package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler base com utilitários para APIs REST
 * Implementa padrões de resposta JSON, CORS e parsing
 */
public abstract class BaseHandler implements HttpHandler {

    protected static final String JSON_TYPE = "application/json; charset=utf-8";

    @Override
    public void handle(HttpExchange ex) throws IOException {
        // Adiciona headers CORS para acesso cross-origin (mobile/desktop apps)
        ex.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        ex.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        ex.getResponseHeaders().add("Access-Control-Max-Age", "86400");

        // Preflight CORS
        if ("OPTIONS".equalsIgnoreCase(ex.getRequestMethod())) {
            ex.sendResponseHeaders(204, -1);
            return;
        }

        try {
            processRequest(ex);
        } catch (Exception e) {
            sendError(ex, 500, "Erro interno: " + e.getMessage());
        }
    }

    /**
     * Processa a requisição específica - implementar nas subclasses
     */
    protected abstract void processRequest(HttpExchange ex) throws IOException;

    /**
     * Parseia query string em Map
     */
    protected Map<String, String> parseQuery(String query) {
        Map<String, String> params = new HashMap<>();
        if (query == null || query.isEmpty()) return params;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            String key = URLDecoder.decode(kv[0], StandardCharsets.UTF_8);
            String value = kv.length > 1 ? URLDecoder.decode(kv[1], StandardCharsets.UTF_8) : "";
            params.put(key, value);
        }
        return params;
    }

    /**
     * Lê body da requisição POST/PUT
     */
    protected String readBody(HttpExchange ex) throws IOException {
        try (InputStream is = ex.getRequestBody();
             BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }

    /**
     * Parseia JSON simples para Map (implementação básica)
     */
    protected Map<String, String> parseJsonBody(String json) {
        Map<String, String> result = new HashMap<>();
        if (json == null || json.isBlank()) return result;
        
        // Remove { } e divide por vírgulas (parsing simples)
        json = json.trim();
        if (json.startsWith("{")) json = json.substring(1);
        if (json.endsWith("}")) json = json.substring(0, json.length() - 1);
        
        String[] pairs = json.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] kv = pair.split(":", 2);
            if (kv.length == 2) {
                String key = kv[0].trim().replaceAll("^\"|\"$", "");
                String value = kv[1].trim().replaceAll("^\"|\"$", "");
                result.put(key, value);
            }
        }
        return result;
    }

    /**
     * Envia resposta JSON de sucesso
     */
    protected void sendJson(HttpExchange ex, int status, String json) throws IOException {
        ex.getResponseHeaders().add("Content-Type", JSON_TYPE);
        ex.getResponseHeaders().add("Cache-Control", "no-cache");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }

    /**
     * Envia resposta de erro
     */
    protected void sendError(HttpExchange ex, int status, String message) throws IOException {
        String json = "{\"error\":\"" + escapeJson(message) + "\",\"status\":" + status + "}";
        sendJson(ex, status, json);
    }

    /**
     * Envia resposta de sucesso simples
     */
    protected void sendSuccess(HttpExchange ex, String message) throws IOException {
        String json = "{\"success\":true,\"message\":\"" + escapeJson(message) + "\"}";
        sendJson(ex, 200, json);
    }

    /**
     * Valida método HTTP
     */
    protected boolean validateMethod(HttpExchange ex, String... allowed) throws IOException {
        String method = ex.getRequestMethod().toUpperCase();
        for (String m : allowed) {
            if (m.equals(method)) return true;
        }
        sendError(ex, 405, "Método não permitido: " + method);
        return false;
    }

    // Utilitários
    protected String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    protected int parseIntSafe(String s, int defaultVal) {
        try { return Integer.parseInt(s); }
        catch (Exception e) { return defaultVal; }
    }

    protected double parseDoubleSafe(String s, double defaultVal) {
        try { return Double.parseDouble(s); }
        catch (Exception e) { return defaultVal; }
    }

    protected String nullToEmpty(String s) { return s == null ? "" : s; }
}
