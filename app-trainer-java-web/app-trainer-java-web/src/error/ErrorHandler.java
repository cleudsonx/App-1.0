package error;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Gerenciador centralizado de erros e respostas HTTP
 */
public class ErrorHandler {
    
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    /**
     * Enumeração de tipos de erro
     */
    public enum ErrorType {
        BAD_REQUEST(400, "Bad Request"),
        UNAUTHORIZED(401, "Unauthorized"),
        FORBIDDEN(403, "Forbidden"),
        NOT_FOUND(404, "Not Found"),
        CONFLICT(409, "Conflict"),
        RATE_LIMIT(429, "Too Many Requests"),
        INTERNAL_ERROR(500, "Internal Server Error"),
        SERVICE_UNAVAILABLE(503, "Service Unavailable");
        
        public final int statusCode;
        public final String message;
        
        ErrorType(int statusCode, String message) {
            this.statusCode = statusCode;
            this.message = message;
        }
    }
    
    /**
     * Resposta de erro padronizada
     */
    public static class ErrorResponse {
        public String timestamp;
        public int status;
        public String error;
        public String message;
        public String path;
        public Map<String, Object> details;
        
        public ErrorResponse(int status, String error, String message, String path) {
            this.timestamp = LocalDateTime.now().format(formatter);
            this.status = status;
            this.error = error;
            this.message = message;
            this.path = path;
            this.details = new HashMap<>();
        }
        
        public void addDetail(String key, Object value) {
            details.put(key, value);
        }
        
        public String toJSON() {
            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"timestamp\":\"").append(escapeJson(timestamp)).append("\",");
            sb.append("\"status\":").append(status).append(",");
            sb.append("\"error\":\"").append(escapeJson(error)).append("\",");
            sb.append("\"message\":\"").append(escapeJson(message)).append("\",");
            sb.append("\"path\":\"").append(escapeJson(path)).append("\"");
            
            if (!details.isEmpty()) {
                sb.append(",\"details\":{");
                details.forEach((key, value) -> {
                    sb.append("\"").append(escapeJson(key)).append("\":");
                    if (value instanceof String) {
                        sb.append("\"").append(escapeJson((String)value)).append("\"");
                    } else {
                        sb.append(value);
                    }
                    sb.append(",");
                });
                sb.setLength(sb.length() - 1); // Remove última vírgula
                sb.append("}");
            }
            
            sb.append("}");
            return sb.toString();
        }
    }
    
    /**
     * Envia erro HTTP padronizado
     */
    public static void sendError(HttpExchange exchange, ErrorType type, String message) throws IOException {
        sendError(exchange, type.statusCode, type.message, message, null);
    }
    
    /**
     * Envia erro HTTP com detalhes
     */
    public static void sendError(HttpExchange exchange, ErrorType type, String message, Map<String, Object> details) throws IOException {
        ErrorResponse response = new ErrorResponse(type.statusCode, type.message, message, exchange.getRequestURI().getPath());
        if (details != null) {
            details.forEach(response::addDetail);
        }
        sendError(exchange, type.statusCode, type.message, message, response);
    }
    
    /**
     * Envia erro genérico
     */
    public static void sendError(HttpExchange exchange, int statusCode, String error, String message, ErrorResponse response) throws IOException {
        if (response == null) {
            response = new ErrorResponse(statusCode, error, message, exchange.getRequestURI().getPath());
        }
        
        String json = response.toJSON();
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Content-Length", String.valueOf(bytes.length));
        
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream out = exchange.getResponseBody();
        out.write(bytes);
        out.close();
        
        logError(statusCode, error, message, exchange.getRequestURI().getPath());
    }
    
    /**
     * Envia sucesso JSON
     */
    public static void sendSuccess(HttpExchange exchange, Object data) throws IOException {
        sendSuccess(exchange, 200, data);
    }
    
    /**
     * Envia sucesso com status code customizado
     */
    public static void sendSuccess(HttpExchange exchange, int statusCode, Object data) throws IOException {
        String json = objectToJson(data);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Content-Length", String.valueOf(bytes.length));
        
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream out = exchange.getResponseBody();
        out.write(bytes);
        out.close();
    }
    
    /**
     * Converte objeto para JSON (implementação simples)
     */
    public static String objectToJson(Object obj) {
        if (obj instanceof String) {
            return "\"" + escapeJson((String)obj) + "\"";
        } else if (obj instanceof Number) {
            return obj.toString();
        } else if (obj instanceof Boolean) {
            return obj.toString();
        } else if (obj instanceof Map) {
            return mapToJson((Map<?, ?>)obj);
        } else if (obj instanceof List) {
            return listToJson((List<?>)obj);
        }
        return "{}";
    }
    
    /**
     * Converte map para JSON
     */
    private static String mapToJson(Map<?, ?> map) {
        StringBuilder sb = new StringBuilder("{");
        map.forEach((key, value) -> {
            sb.append("\"").append(escapeJson(key.toString())).append("\":");
            sb.append(objectToJson(value)).append(",");
        });
        if (map.size() > 0) {
            sb.setLength(sb.length() - 1); // Remove última vírgula
        }
        sb.append("}");
        return sb.toString();
    }
    
    /**
     * Converte lista para JSON
     */
    private static String listToJson(List<?> list) {
        StringBuilder sb = new StringBuilder("[");
        list.forEach(item -> sb.append(objectToJson(item)).append(","));
        if (list.size() > 0) {
            sb.setLength(sb.length() - 1); // Remove última vírgula
        }
        sb.append("]");
        return sb.toString();
    }
    
    /**
     * Escapa caracteres especiais para JSON
     */
    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
    
    /**
     * Log centralizado de erros
     */
    private static void logError(int statusCode, String error, String message, String path) {
        String timestamp = LocalDateTime.now().format(formatter);
        System.err.printf("[%s] ERROR %d %s - %s - %s%n", timestamp, statusCode, error, message, path);
    }
    
    /**
     * Processa exceção e retorna erro apropriado
     */
    public static void handleException(HttpExchange exchange, Exception e, String context) throws IOException {
        String message = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
        
        if (e instanceof IllegalArgumentException) {
            sendError(exchange, ErrorType.BAD_REQUEST, message);
        } else if (e instanceof SecurityException) {
            sendError(exchange, ErrorType.UNAUTHORIZED, message);
        } else if (e instanceof java.sql.SQLException) {
            System.err.println("[DB ERROR] " + context + ": " + e.getMessage());
            e.printStackTrace();
            sendError(exchange, ErrorType.INTERNAL_ERROR, "Erro ao acessar banco de dados");
        } else {
            System.err.println("[ERROR] " + context + ": " + message);
            e.printStackTrace();
            sendError(exchange, ErrorType.INTERNAL_ERROR, "Erro interno do servidor");
        }
    }
    
    /**
     * Valida request size
     */
    public static boolean validateRequestSize(HttpExchange exchange, long maxBytes) throws IOException {
        String contentLength = exchange.getRequestHeaders().getFirst("Content-Length");
        if (contentLength != null) {
            try {
                long size = Long.parseLong(contentLength);
                if (size > maxBytes) {
                    Map<String, Object> details = new HashMap<>();
                    details.put("max_size", maxBytes);
                    details.put("received", size);
                    sendError(exchange, ErrorType.BAD_REQUEST, 
                             "Payload muito grande", details);
                    return false;
                }
            } catch (NumberFormatException ignored) {}
        }
        return true;
    }
}
