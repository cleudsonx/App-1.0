package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import log.AppLogger;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

/**
 * Handler para integração com Python ML Service
 * Endpoints:
 * - GET /ml/coach?q=pergunta&nome=nome&objetivo=objetivo&nivel=nivel
 * - GET /ml/suggest?objetivo=objetivo&nivel=nivel&diasSemana=dias
 */
public class MLServiceHandler implements HttpHandler {
    private static final String ML_SERVICE_URL = "http://localhost:8001";
    private AppLogger logger;
    
    public MLServiceHandler() {
        try {
            this.logger = AppLogger.getInstance(java.nio.file.Path.of("logs"));
        } catch (IOException e) {
            System.err.println("Failed to initialize logger: " + e.getMessage());
        }
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method = exchange.getRequestMethod();
        String path = exchange.getRequestURI().getPath();
        
        logger.info("Request: " + method + " " + path, "MLServiceHandler");

        // CORS
        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        if (method.equals("OPTIONS")) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        if (!method.equals("GET")) {
            sendError(exchange, 405, "Method not allowed");
            return;
        }

        try {
            if (path.equals("/ml/coach")) {
                handleCoach(exchange);
            } else if (path.equals("/ml/suggest")) {
                handleSuggest(exchange);
            } else if (path.equals("/ml/health")) {
                handleHealth(exchange);
            } else {
                sendError(exchange, 404, "Endpoint not found");
            }
        } catch (Exception e) {
            logger.error("Error: " + e.getMessage(), "MLServiceHandler");
            sendError(exchange, 500, "Internal server error: " + e.getMessage());
        }
    }

    /**
     * GET /ml/coach?q=pergunta&nome=nome&objetivo=objetivo&nivel=nivel
     */
    private void handleCoach(HttpExchange exchange) throws IOException {
        Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
        
        String q = params.get("q");
        if (q == null || q.trim().isEmpty()) {
            sendError(exchange, 400, "Parameter 'q' is required");
            return;
        }

        StringBuilder urlBuilder = new StringBuilder(ML_SERVICE_URL + "/coach?q=" + URLEncoder.encode(q, StandardCharsets.UTF_8));
        
        if (params.containsKey("nome")) {
            urlBuilder.append("&nome=").append(URLEncoder.encode(params.get("nome"), StandardCharsets.UTF_8));
        }
        if (params.containsKey("objetivo")) {
            urlBuilder.append("&objetivo=").append(URLEncoder.encode(params.get("objetivo"), StandardCharsets.UTF_8));
        }
        if (params.containsKey("nivel")) {
            urlBuilder.append("&nivel=").append(URLEncoder.encode(params.get("nivel"), StandardCharsets.UTF_8));
        }

        String response = callMLService(urlBuilder.toString(), "GET", null);
        sendResponse(exchange, 200, response);
        logger.info("Coach query successful: " + q, "MLServiceHandler");
    }

    /**
     * GET /ml/suggest?objetivo=objetivo&nivel=nivel&diasSemana=dias&restricoes=restricoes&equipamentos=equipamentos
     */
    private void handleSuggest(HttpExchange exchange) throws IOException {
        Map<String, String> params = parseQueryParams(exchange.getRequestURI().getQuery());
        
        String objetivo = params.get("objetivo");
        String nivel = params.get("nivel");
        
        if (objetivo == null || nivel == null) {
            sendError(exchange, 400, "Parameters 'objetivo' and 'nivel' are required");
            return;
        }

        StringBuilder urlBuilder = new StringBuilder(ML_SERVICE_URL + "/suggest?");
        urlBuilder.append("objetivo=").append(URLEncoder.encode(objetivo, StandardCharsets.UTF_8));
        urlBuilder.append("&nivel=").append(URLEncoder.encode(nivel, StandardCharsets.UTF_8));
        
        if (params.containsKey("diasSemana")) {
            urlBuilder.append("&diasSemana=").append(params.get("diasSemana"));
        }
        if (params.containsKey("restricoes")) {
            urlBuilder.append("&restricoes=").append(URLEncoder.encode(params.get("restricoes"), StandardCharsets.UTF_8));
        }
        if (params.containsKey("equipamentos")) {
            urlBuilder.append("&equipamentos=").append(URLEncoder.encode(params.get("equipamentos"), StandardCharsets.UTF_8));
        }

        String response = callMLService(urlBuilder.toString(), "GET", null);
        sendResponse(exchange, 200, response);
        logger.info("Suggest query successful: objetivo=" + objetivo + ", nivel=" + nivel, "MLServiceHandler");
    }

    /**
     * GET /ml/health
     */
    private void handleHealth(HttpExchange exchange) throws IOException {
        try {
            String response = callMLService(ML_SERVICE_URL + "/health", "GET", null);
            sendResponse(exchange, 200, response);
        } catch (Exception e) {
            sendError(exchange, 503, "ML Service unavailable");
        }
    }

    /**
     * Chama o ML Service Python
     */
    private String callMLService(String urlString, String method, String body) throws IOException {
        URL url = new URL(urlString);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod(method);
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setConnectTimeout(10000); // 10 segundos
        conn.setReadTimeout(30000); // 30 segundos

        if (body != null && !body.isEmpty()) {
            conn.setDoOutput(true);
            try (OutputStream os = conn.getOutputStream()) {
                os.write(body.getBytes(StandardCharsets.UTF_8));
            }
        }

        int responseCode = conn.getResponseCode();
        
        BufferedReader reader;
        if (responseCode >= 200 && responseCode < 300) {
            reader = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
        } else {
            reader = new BufferedReader(new InputStreamReader(conn.getErrorStream(), StandardCharsets.UTF_8));
        }

        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();

        if (responseCode < 200 || responseCode >= 300) {
            throw new IOException("ML Service returned error: " + responseCode + " - " + response.toString());
        }

        return response.toString();
    }

    /**
     * Parse query parameters
     */
    private Map<String, String> parseQueryParams(String query) {
        Map<String, String> params = new HashMap<>();
        if (query == null || query.isEmpty()) {
            return params;
        }

        String[] pairs = query.split("&");
        for (String pair : pairs) {
            String[] keyValue = pair.split("=", 2);
            if (keyValue.length == 2) {
                params.put(keyValue[0], keyValue[1]);
            }
        }
        return params;
    }

    private void sendResponse(HttpExchange exchange, int statusCode, String response) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private void sendError(HttpExchange exchange, int statusCode, String message) throws IOException {
        String json = "{\"error\":\"" + message + "\",\"status\":" + statusCode + "}";
        sendResponse(exchange, statusCode, json);
    }
}
