import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import api.*;
import storage.DataStorage;
import storage.DataStorageSQL;
import db.ConnectionPool;
import log.AppLogger;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.SQLException;
import java.util.concurrent.Executors;

/**
 * Servidor Web principal - APP Trainer
 * Versão 2.0 - Reestruturado com arquitetura modular
 * 
 * Suporta acesso via:
 * - Web Browser (desktop/mobile)
 * - Apps nativos via API REST
 * - PWA (Progressive Web App)
 */
public class WebServer {
    
    private static final String VERSION = "2.0.0";

    public static void main(String[] args) throws Exception {
        // Configuração de porta
        String portEnv = System.getenv("PORT");
        int port = (portEnv != null && portEnv.matches("\\d+")) ? Integer.parseInt(portEnv) : 8081;
        
        // Diretórios - detectar automaticamente baseado na localização de execução
        Path currentDir = Path.of(".").toAbsolutePath().normalize();
        Path webDir;
        Path dataDir;
        
        // Se estamos em src/, voltar um nível
        if (currentDir.endsWith("src")) {
            webDir = currentDir.getParent().resolve("web");
            dataDir = currentDir.getParent().resolve("data");
        } else if (Files.exists(Path.of("web"))) {
            // Se web/ existe no diretório atual
            webDir = Path.of("web");
            dataDir = Path.of("data");
        } else if (Files.exists(Path.of("app-trainer-java-web/web"))) {
            // Se app-trainer-java-web/web existe
            webDir = Path.of("app-trainer-java-web/web");
            dataDir = Path.of("app-trainer-java-web/data");
        } else {
            // Tentar caminho relativo ao src
            webDir = Path.of("../web");
            dataDir = Path.of("../data");
        }
        
        System.out.println("[Config] webDir: " + webDir.toAbsolutePath());
        System.out.println("[Config] dataDir: " + dataDir.toAbsolutePath());
        
        // Verificar se webDir existe
        if (!Files.exists(webDir)) {
            System.err.println("[ERRO] Diretório web não encontrado: " + webDir.toAbsolutePath());
            System.err.println("[ERRO] Execute o servidor do diretório correto ou verifique a estrutura de pastas.");
            return;
        }
        
        // Storage compartilhado
        DataStorage storage = new DataStorage(dataDir);
        
        // ✅ Inicializar Logger Centralizado
        final AppLogger logger = AppLogger.getInstance(Path.of("logs"));
        logger.info("APP Trainer iniciado - Version " + VERSION, "WebServer");
        logger.info("Web Directory: " + webDir.toAbsolutePath(), "WebServer");
        
        // ✅ Inicializar PostgreSQL Connection Pool (opcional - use quando DB estiver pronto)
        final DataStorageSQL[] storageSQLHolder = {null};
        String dbUrl = System.getenv("DB_URL");
        String dbUser = System.getenv("DB_USER");
        String dbPassword = System.getenv("DB_PASSWORD");
        
        if (dbUrl != null && dbUser != null && dbPassword != null) {
            try {
                ConnectionPool pool = ConnectionPool.getInstance(dbUrl, dbUser, dbPassword);
                storageSQLHolder[0] = new DataStorageSQL(pool);
                logger.info("PostgreSQL Connection Pool initialized: " + pool.getStatus(), "WebServer");
            } catch (SQLException e) {
                logger.warn("PostgreSQL não disponível - usando CSV storage: " + e.getMessage(), "WebServer");
            }
        } else {
            logger.info("PostgreSQL não configurado - usando CSV storage", "WebServer");
        }
        
        // Cria servidor com thread pool para melhor performance
        // Bind em 0.0.0.0 para aceitar conexões de qualquer interface de rede
        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.setExecutor(Executors.newFixedThreadPool(10));
        
        // ==================== ENDPOINTS ESTÁTICOS ====================
        server.createContext("/", new StaticHandler(webDir));
        
        // ==================== API REST ====================
        
        // Autenticação
        AuthHandler authHandler = new AuthHandler(storage, storageSQLHolder[0], logger);
        server.createContext("/auth/login", authHandler);
        server.createContext("/auth/registro", authHandler);
        server.createContext("/auth/refresh", authHandler);
        server.createContext("/auth/verificar", authHandler);
        
        // Alunos - CRUD completo
        AlunoHandler alunoHandler = new AlunoHandler(storage);
        server.createContext("/api/alunos", alunoHandler);
        
        // Professores - CRUD completo  
        ProfessorHandler profHandler = new ProfessorHandler(storage);
        server.createContext("/api/professores", profHandler);
        server.createContext("/api/profs", profHandler); // Alias para compatibilidade
        
        // Coach Virtual IA
        CoachHandler coachHandler = new CoachHandler(storage);
        server.createContext("/api/coach", coachHandler);
        
        // Sugestão de Treino
        SugestaoHandler sugestaoHandler = new SugestaoHandler(storage);
        server.createContext("/api/sugestao", sugestaoHandler);
        server.createContext("/api/treino/gerar", sugestaoHandler);
        
        // Health check e info
        server.createContext("/api/health", ex -> {
            String json = "{\"status\":\"ok\",\"version\":\"" + VERSION + "\"}";
            sendJson(ex, 200, json);
        });
        
        // Proxy para serviço ML Python (opcional)
        server.createContext("/api/sugestao-ml", ex -> Proxy.forward(ex, "http://localhost:8001/suggest"));
        server.createContext("/api/coach-ml", ex -> Proxy.forward(ex, "http://localhost:8001/coach"));

        // Obtém IP local para exibição
        String localIP = getLocalIPAddress();
        
        System.out.println("╔════════════════════════════════════════════════════╗");
        System.out.println("║         APP TRAINER - Servidor Web v" + VERSION + "        ║");
        System.out.println("╠════════════════════════════════════════════════════╣");
        System.out.println("║  🌐 Web (Local):    http://localhost:" + port + "          ║");
        System.out.println("║  📱 Web (Rede):     http://" + localIP + ":" + port + "      ║");
        System.out.println("║  📱 API:            http://" + localIP + ":" + port + "/api  ║");
        System.out.println("║  🤖 Coach:          http://localhost:" + port + "/api/coach        ║");
        System.out.println("║  💪 Treino:         http://localhost:" + port + "/api/sugestao     ║");
        System.out.println("╠════════════════════════════════════════════════════╣");
        System.out.println("║  Endpoints disponíveis:                            ║");
        System.out.println("║  • POST       /auth/login                          ║");
        System.out.println("║  • POST       /auth/registro                       ║");
        System.out.println("║  • POST       /auth/refresh                        ║");
        System.out.println("║  • GET        /auth/verificar/{user_id}            ║");
        System.out.println("║  • GET/POST   /api/alunos                          ║");
        System.out.println("║  • GET/POST   /api/professores                     ║");
        System.out.println("║  • GET/POST   /api/coach?q=pergunta                ║");
        System.out.println("║  • GET/POST   /api/sugestao?objetivo=&nivel=       ║");
        System.out.println("║  • GET        /api/health                          ║");
        System.out.println("║                                                    ║");
        System.out.println("║  🔐 Security: JWT, PBKDF2, Rate Limiting           ║");
        System.out.println("║  📊 Storage: " + (storageSQLHolder[0] != null ? "PostgreSQL" : "CSV") + "                              ║");
        System.out.println("║  📝 Logging: " + "Enabled" + "                                ║");
        System.out.println("╚════════════════════════════════════════════════════╝");
        
        server.start();
        logger.info("Server started on port " + port, "WebServer");
        
        // ✅ Graceful shutdown hook
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            logger.warn("Shutting down server...", "WebServer");
            server.stop(5);
            if (storageSQLHolder[0] != null) {
                storageSQLHolder[0].close();
            }
            logger.info("Server stopped", "WebServer");
            logger.close(); // Flush remaining logs
        }));
        
        // Mantém servidor rodando - loop infinito
        Thread keepAlive = new Thread(() -> {
            try {
                while (true) {
                    Thread.sleep(60000);
                }
            } catch (InterruptedException e) {
                // Servidor encerrado
            }
        });
        keepAlive.setDaemon(false);
        keepAlive.start();
    }

    /**
     * Handler para arquivos estáticos (HTML, CSS, JS, imagens)
     */
    static class StaticHandler implements HttpHandler {
        private final Path webRoot;
        
        StaticHandler(Path webRoot) { 
            this.webRoot = webRoot; 
        }
        
        @Override 
        public void handle(HttpExchange ex) throws IOException {
            // CORS para acesso de apps externos
            ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
            
            String path = ex.getRequestURI().getPath();
            if (path.equals("/")) path = "/index.html";
            
            // Previne path traversal
            Path file = webRoot.resolve(path.substring(1)).normalize();
            if (!file.startsWith(webRoot) || !Files.exists(file)) {
                send404(ex);
                return;
            }
            
            // Determina MIME type
            String mime = getMimeType(path);
            
            // Cache headers para assets - DESENVOLVIMENTO: sem cache para JS/CSS
            if (path.endsWith(".png") || path.endsWith(".jpg") || path.endsWith(".svg")) {
                ex.getResponseHeaders().add("Cache-Control", "public, max-age=86400");
            } else {
                // Sem cache para HTML, CSS, JS - melhor para desenvolvimento
                ex.getResponseHeaders().add("Cache-Control", "no-cache, no-store, must-revalidate");
                ex.getResponseHeaders().add("Pragma", "no-cache");
                ex.getResponseHeaders().add("Expires", "0");
            }
            
            byte[] bytes = Files.readAllBytes(file);
            ex.getResponseHeaders().add("Content-Type", mime);
            ex.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { 
                os.write(bytes); 
            }
        }
        
        private String getMimeType(String path) {
            if (path.endsWith(".html")) return "text/html; charset=utf-8";
            if (path.endsWith(".css")) return "text/css; charset=utf-8";
            if (path.endsWith(".js")) return "application/javascript; charset=utf-8";
            if (path.endsWith(".json")) return "application/json; charset=utf-8";
            if (path.endsWith(".png")) return "image/png";
            if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
            if (path.endsWith(".svg")) return "image/svg+xml";
            if (path.endsWith(".ico")) return "image/x-icon";
            if (path.endsWith(".webmanifest")) return "application/manifest+json";
            return "application/octet-stream";
        }
        
        private void send404(HttpExchange ex) throws IOException {
            String html = "<!DOCTYPE html><html><head><meta charset='utf-8'><title>404</title></head>" +
                         "<body style='font-family:sans-serif;text-align:center;padding:50px'>" +
                         "<h1>404 - Página não encontrada</h1>" +
                         "<p><a href='/'>Voltar ao início</a></p></body></html>";
            byte[] bytes = html.getBytes(StandardCharsets.UTF_8);
            ex.getResponseHeaders().add("Content-Type", "text/html; charset=utf-8");
            ex.sendResponseHeaders(404, bytes.length);
            try (OutputStream os = ex.getResponseBody()) { 
                os.write(bytes); 
            }
        }
    }
    
    private static void sendJson(HttpExchange ex, int status, String json) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }
    
    /**
     * Obtém o endereço IP local da máquina para acesso via rede
     */
    private static String getLocalIPAddress() {
        try {
            java.net.InetAddress localHost = java.net.InetAddress.getLocalHost();
            return localHost.getHostAddress();
        } catch (Exception e) {
            return "0.0.0.0";
        }
    }
}
