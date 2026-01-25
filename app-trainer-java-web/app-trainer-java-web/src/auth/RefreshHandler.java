// Exemplo: RefreshHandler.java
package auth;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import db.ConnectionPool;
import org.json.JSONObject;

import java.io.IOException;
import java.io.OutputStream;
import java.sql.*;

public class RefreshHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(405, -1);
            return;
        }

        JSONObject req = AuthUtils.parseRequestBody(exchange);
        String refreshToken = req.optString("refresh_token", null);

        if (refreshToken == null || refreshToken.isEmpty()) {
            AuthUtils.sendJsonResponse(exchange, 400, "Refresh token ausente");
            return;
        }

        try (Connection conn = ConnectionPool.getInstance().getConnection()) {
            // Verifica se o refresh_token é válido e não expirou
            PreparedStatement ps = conn.prepareStatement(
                "SELECT id_usuario FROM java_app.autenticacao WHERE refresh_token = ?"
            );
            ps.setString(1, refreshToken);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                int userId = rs.getInt("id_usuario");
                // Gere novo access_token (JWT) e nova expiração
                String newToken = AuthUtils.generateJwtToken(userId);
                long expiresIn = 3600; // 1 hora, por exemplo

                JSONObject resp = new JSONObject();
                resp.put("access_token", newToken);
                resp.put("expires_in", expiresIn);
                resp.put("refresh_token", refreshToken);

                AuthUtils.sendJsonResponse(exchange, 200, resp);
            } else {
                AuthUtils.sendJsonResponse(exchange, 401, "Refresh token inválido");
            }
        } catch (Exception e) {
            AuthUtils.sendJsonResponse(exchange, 500, "Erro interno: " + e.getMessage());
        }
    }
}