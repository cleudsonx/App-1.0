// Exemplo: RefreshHandler.java
package auth;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import db.ConnectionPool;
import org.json.JSONObject;

import java.io.IOException;
import java.sql.*;
import java.time.Instant;
import java.util.UUID;

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
            // Busca refresh_token e verifica expiração
            PreparedStatement ps = conn.prepareStatement(
                "SELECT id_usuario, expira_em FROM java_app.autenticacao WHERE refresh_token = ?"
            );
            ps.setString(1, refreshToken);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                int userId = rs.getInt("id_usuario");
                Timestamp expiraEm = rs.getTimestamp("expira_em");
                if (expiraEm != null && expiraEm.toInstant().isBefore(Instant.now())) {
                    AuthUtils.sendJsonResponse(exchange, 401, "Refresh token expirado");
                    return;
                }
                // Gera novo access_token (JWT) e nova expiração
                String newToken = AuthUtils.generateJwtToken(userId);
                long expiresIn = 3600; // 1 hora
                // Gera novo refresh_token (rotação)
                String newRefreshToken = UUID.randomUUID().toString();
                Timestamp newExpiraEm = Timestamp.from(Instant.now().plusSeconds(7 * 24 * 3600)); // 7 dias
                // Atualiza refresh_token na base
                PreparedStatement upd = conn.prepareStatement(
                    "UPDATE java_app.autenticacao SET refresh_token = ?, expira_em = ? WHERE id_usuario = ?"
                );
                upd.setString(1, newRefreshToken);
                upd.setTimestamp(2, newExpiraEm);
                upd.setInt(3, userId);
                upd.executeUpdate();

                JSONObject resp = new JSONObject();
                resp.put("access_token", newToken);
                resp.put("expires_in", expiresIn);
                resp.put("refresh_token", newRefreshToken);

                AuthUtils.sendJsonResponse(exchange, 200, resp);
            } else {
                AuthUtils.sendJsonResponse(exchange, 401, "Refresh token inválido");
            }
        } catch (Exception e) {
            // Log interno, resposta genérica ao cliente
            System.err.println("[RefreshHandler] Erro: " + e.getMessage());
            AuthUtils.sendJsonResponse(exchange, 500, "Erro interno ao processar refresh token");
        }
    }
}