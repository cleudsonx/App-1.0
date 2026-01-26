package storage;

import java.sql.*;
import java.time.Instant;

public class DataStorageSQL implements Storage {
    private final Connection conn;

    public DataStorageSQL(Connection conn) {
        this.conn = conn;
    }

    // Métodos obrigatórios da interface Storage (stubs para não implementados)
    public Aluno getAlunoById(int id) throws Exception {
        throw new UnsupportedOperationException("getAlunoById não implementado em DataStorageSQL");
    }
    public java.util.List<Aluno> listAlunos(String objetivo, String nivel) throws Exception {
        throw new UnsupportedOperationException("listAlunos não implementado em DataStorageSQL");
    }
    public Aluno addAluno(String nome, int idade, String objetivo, String nivel, double pesoKg, double alturaCm, String restricoes, String equipamentos, Integer rpe) throws Exception {
        throw new UnsupportedOperationException("addAluno não implementado em DataStorageSQL");
    }
    public Aluno updateAluno(int id, java.util.Map<String, String> updates) throws Exception {
        throw new UnsupportedOperationException("updateAluno não implementado em DataStorageSQL");
    }
    public boolean deleteAluno(int id) throws Exception {
        throw new UnsupportedOperationException("deleteAluno não implementado em DataStorageSQL");
    }
    public Professor addProfessor(String nome, String especialidade) throws Exception {
        throw new UnsupportedOperationException("addProfessor não implementado em DataStorageSQL");
    }
    public Professor getProfessorById(int id) throws Exception {
        throw new UnsupportedOperationException("getProfessorById não implementado em DataStorageSQL");
    }
    public java.util.List<Professor> listProfessores(String especialidade) throws Exception {
        throw new UnsupportedOperationException("listProfessores não implementado em DataStorageSQL");
    }
    public boolean deleteProfessor(int id) throws Exception {
        throw new UnsupportedOperationException("deleteProfessor não implementado em DataStorageSQL");
    }
package storage;

import java.sql.*;
import java.time.Instant;

public class DataStorageSQL implements Storage {
    private final Connection conn;

    public DataStorageSQL(Connection conn) {
        this.conn = conn;
    }

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
