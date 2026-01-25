package storage;

import java.sql.*;
import java.time.Instant;

public class DataStorageSQL {
    private final Connection conn;

    public DataStorageSQL(Connection conn) {
        this.conn = conn;
    }

    public boolean isRefreshTokenValido(int userId, String token) throws SQLException {
        String sql = "SELECT 1 FROM java_app.autenticacao WHERE id_usuario=? AND refresh_token=? AND expira_em > NOW()";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setString(2, token);
            try (ResultSet rs = ps.executeQuery()) {
                return rs.next();
            }
        }
    }

    public void invalidarRefreshToken(int userId, String token) throws SQLException {
        String sql = "DELETE FROM java_app.autenticacao WHERE id_usuario=? AND refresh_token=?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setString(2, token);
            ps.executeUpdate();
        }
    }

    public void salvarRefreshToken(int userId, String token, long expiraEmEpoch) throws SQLException {
        String sql = "INSERT INTO java_app.autenticacao (id_usuario, refresh_token, expira_em) VALUES (?, ?, ?) " +
                     "ON CONFLICT (id_usuario) DO UPDATE SET refresh_token=EXCLUDED.refresh_token, expira_em=EXCLUDED.expira_em";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ps.setString(2, token);
            ps.setTimestamp(3, Timestamp.from(Instant.ofEpochMilli(expiraEmEpoch)));
            ps.executeUpdate();
        }
    }
}
