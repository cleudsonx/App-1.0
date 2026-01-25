    // === Métodos de usuário (aluno) ===
    public Aluno getAlunoByEmail(String email) throws SQLException {
        String sql = "SELECT id, nome, email, senha_hash FROM java_app.usuarios WHERE email = ?";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, email);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int id = rs.getInt("id");
                    String nome = rs.getString("nome");
                    String emailDb = rs.getString("email");
                    String senhaHash = rs.getString("senha_hash");
                    // Adapte conforme o construtor de Aluno
                    return new Aluno(id, nome, 0, "", "", 0, 0, "", "", null, emailDb, senhaHash, "{}");
                }
            }
        }
        return null;
    }

    /**
     * Adiciona aluno com senha já hasheada (PBKDF2)
     */
    public Aluno addAlunoWithHash(String nome, String email, String senhaHash) throws SQLException {
        String sql = "INSERT INTO java_app.usuarios (nome, email, senha_hash) VALUES (?, ?, ?) RETURNING id";
        try (PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, nome);
            ps.setString(2, email);
            ps.setString(3, senhaHash);
            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    int id = rs.getInt("id");
                    return new Aluno(id, nome, 0, "", "", 0, 0, "", "", null, email, senhaHash, "{}");
                }
            }
        }
        return null;
    }
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
