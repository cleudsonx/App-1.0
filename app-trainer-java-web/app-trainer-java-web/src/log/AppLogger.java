package log;

import java.io.*;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.*;

/**
 * Logger centralizado para aplicação
 * Escreve logs em arquivo de forma thread-safe com rotation
 */
public class AppLogger {
    
    private static AppLogger instance;
    private final Path logDir;
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");
    private final DateTimeFormatter fileFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private final BlockingQueue<LogEntry> logQueue;
    private final Thread writerThread;
    private volatile boolean running = true;
    
    private static final long MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
    private static final int MAX_LOG_FILES = 7; // Manter 7 dias
    
    private enum Level {
        DEBUG("[DEBUG]"),
        INFO("[INFO]"),
        WARN("[WARN]"),
        ERROR("[ERROR]");
        
        final String label;
        Level(String label) {
            this.label = label;
        }
    }
    
    private static class LogEntry {
        LocalDateTime timestamp;
        Level level;
        String message;
        Throwable exception;
        String context;
        
        LogEntry(LocalDateTime timestamp, Level level, String message, Throwable exception, String context) {
            this.timestamp = timestamp;
            this.level = level;
            this.message = message;
            this.exception = exception;
            this.context = context;
        }
        
        String format(DateTimeFormatter formatter) {
            StringBuilder sb = new StringBuilder();
            sb.append(formatter.format(timestamp)).append(" ");
            sb.append(level.label).append(" ");
            if (context != null && !context.isEmpty()) {
                sb.append("[").append(context).append("] ");
            }
            sb.append(message);
            if (exception != null) {
                sb.append(" - ").append(exception.getMessage());
            }
            return sb.toString();
        }
    }
    
    private AppLogger(Path logDir) throws IOException {
        this.logDir = logDir;
        Files.createDirectories(logDir);
        this.logQueue = new LinkedBlockingQueue<>(1000);
        
        // Thread de background para escrever logs
        this.writerThread = new Thread(this::writeLogsBackground);
        writerThread.setName("LogWriter");
        writerThread.setDaemon(true);
        writerThread.start();
    }
    
    /**
     * Inicializa o logger com diretório de logs
     */
    public static synchronized AppLogger getInstance(Path logDir) throws IOException {
        if (instance == null) {
            instance = new AppLogger(logDir);
        }
        return instance;
    }
    
    /**
     * Inicializa com diretório padrão
     */
    public static synchronized AppLogger getInstance() throws IOException {
        if (instance == null) {
            instance = new AppLogger(Path.of("logs"));
        }
        return instance;
    }
    
    /**
     * Log de informação
     */
    public void info(String message, String context) {
        enqueueLog(Level.INFO, message, null, context);
    }
    
    public void info(String message) {
        info(message, null);
    }
    
    /**
     * Log de aviso
     */
    public void warn(String message, String context) {
        enqueueLog(Level.WARN, message, null, context);
        System.out.println("[WARN] " + message);
    }
    
    public void warn(String message) {
        warn(message, null);
    }
    
    /**
     * Log de erro
     */
    public void error(String message, Exception exception, String context) {
        enqueueLog(Level.ERROR, message, exception, context);
        System.err.println("[ERROR] " + message);
        if (exception != null) {
            exception.printStackTrace();
        }
    }
    
    public void error(String message, String context) {
        error(message, null, context);
    }
    
    public void error(String message, Exception exception) {
        error(message, exception, null);
    }
    
    /**
     * Log de debug
     */
    public void debug(String message, String context) {
        enqueueLog(Level.DEBUG, message, null, context);
    }
    
    public void debug(String message) {
        debug(message, null);
    }
    
    /**
     * Enfileira log para processamento assíncrono
     */
    private void enqueueLog(Level level, String message, Throwable exception, String context) {
        if (!running) return;
        
        LogEntry entry = new LogEntry(LocalDateTime.now(), level, message, exception, context);
        if (!logQueue.offer(entry)) {
            System.err.println("[WARN] Log queue full, dropping: " + message);
        }
    }
    
    /**
     * Thread de background para escrever logs
     */
    private void writeLogsBackground() {
        try {
            while (running) {
                LogEntry entry = logQueue.poll(1, TimeUnit.SECONDS);
                if (entry != null) {
                    writeLogToFile(entry);
                }
            }
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }
    }
    
    /**
     * Escreve log em arquivo
     */
    private void writeLogToFile(LogEntry entry) {
        try {
            Path logFile = logDir.resolve("app_" + fileFormatter.format(entry.timestamp) + ".log");
            String logLine = entry.format(formatter) + "\n";
            
            // Escrever em arquivo
            Files.write(logFile, logLine.getBytes(), 
                       StandardOpenOption.CREATE, 
                       StandardOpenOption.APPEND);
            
            // Verificar rotação
            checkLogRotation();
            
        } catch (IOException e) {
            System.err.println("[LOG ERROR] Erro ao escrever log: " + e.getMessage());
        }
    }
    
    /**
     * Verifica se precisa fazer rotação de logs
     */
    private void checkLogRotation() {
        try {
            // Limpar logs antigos
            LocalDateTime oneWeekAgo = LocalDateTime.now().minusDays(MAX_LOG_FILES);
            String datePattern = fileFormatter.format(oneWeekAgo);
            
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(logDir, "app_*.log")) {
                for (Path file : stream) {
                    String filename = file.getFileName().toString();
                    if (filename.compareTo("app_" + datePattern + ".log") < 0) {
                        Files.delete(file);
                    }
                }
            }
        } catch (IOException e) {
            System.err.println("[LOG ROTATION] Erro: " + e.getMessage());
        }
    }
    
    /**
     * Fecha o logger e drena fila de logs
     */
    public synchronized void close() {
        running = false;
        
        // Drena fila antes de fechar
        LogEntry entry;
        while ((entry = logQueue.poll()) != null) {
            writeLogToFile(entry);
        }
        
        // Aguarda thread terminar
        try {
            writerThread.join(5000);
        } catch (InterruptedException ignored) {}
    }
    
    /**
     * Retorna status do logger
     */
    public String getStatus() {
        return String.format("[Logger] Queue size: %d, Running: %s, Log dir: %s",
            logQueue.size(), running, logDir.toAbsolutePath());
    }
}
