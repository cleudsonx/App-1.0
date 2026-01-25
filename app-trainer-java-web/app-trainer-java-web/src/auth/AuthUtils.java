package auth;

import com.sun.net.httpserver.HttpExchange;
import org.json.JSONObject;
import java.io.*;
import java.nio.charset.StandardCharsets;

public class AuthUtils {
    public static JSONObject parseRequestBody(HttpExchange exchange) throws IOException {
        InputStream is = exchange.getRequestBody();
        StringBuilder sb = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) {
                sb.append(line);
            }
        }
        return new JSONObject(sb.toString());
    }

    public static void sendJsonResponse(HttpExchange exchange, int status, Object body) throws IOException {
        String json = body instanceof String ? (String) body : body.toString();
        byte[] resp = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(status, resp.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(resp);
        }
    }

    public static String generateJwtToken(int userId) {
        // Implemente conforme sua lógica de geração de JWT
        return "dummy-jwt-token-for-" + userId;
    }
}
