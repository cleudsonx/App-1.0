package storage;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;

import db.ConnectionPool;

/**
 * Camada de persistência com PostgreSQL
 * Substitui DataStorage CSV com suporte a transações e queries otimizadas
 */
public class DataStorageSQL {
    private final ConnectionPool pool;

    public DataStorageSQL(String dbUrl, String dbUser, String dbPassword) throws SQLException {
        this.pool = ConnectionPool.getInstance(dbUrl, dbUser, dbPassword);
    }

    public DataStorageSQL(ConnectionPool pool) {
        this.pool = pool;
    }

    public DataStorageSQL() throws SQLException {
        this.pool = ConnectionPool.getInstance();
    }

    // ==================== ALUNOS ====================

    /**
     * Adiciona novo aluno sem autenticação (migração de dados)
     */
    public Aluno addAluno(String nome, int idade, String objetivo, String nivel,
                         double pesoKg, double alturaCm, String restricoes, 
                         String equipamentos, Integer rpe) throws SQLException {
        String sql = """
            INSERT INTO alunos (nome, idade, objetivo, nivel, peso_kg, altura_cm, restricoes, equipamentos, rpe, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')
            RETURNING id
            """;
        
        long id = pool.executeInsertReturnId(sql, nome, idade, objetivo, nivel, 
                                             pesoKg, alturaCm, restricoes, equipamentos, rpe);
        
        return new Aluno((int)id, nome, idade, objetivo, nivel, pesoKg, alturaCm, 
                        restricoes, equipamentos, rpe, "", "", "{}");
    }

    /**
     * Adiciona aluno com autenticação (email + senha)
     */
    public Aluno addAlunoWithAuth(String nome, int idade, String objetivo, String nivel,
                                  double pesoKg, double alturaCm, String email, 
                                  String passwordHash, String restricoes, String equipamentos) throws SQLException {
        String insertUserSQL = "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id";
        String insertAlunoSQL = """
            INSERT INTO alunos (user_id, nome, idade, objetivo, nivel, peso_kg, altura_cm, restricoes, equipamentos, metadata)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, '{}')
            RETURNING id
            """;
        
        Connection conn = pool.getConnection();
        try {
            conn.setAutoCommit(false);
            
            // Insert user
            String userId = null;
            PreparedStatement pstmt = conn.prepareStatement(insertUserSQL, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, email);
            pstmt.setString(2, passwordHash);
            pstmt.executeUpdate();
            ResultSet rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
                userId = rs.getString(1);
            }
            pstmt.close();
            
            if (userId == null) {
                conn.rollback();
                throw new SQLException("Erro ao criar usuário");
            }
            
            // Insert aluno
            pstmt = conn.prepareStatement(insertAlunoSQL, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, userId);
            pstmt.setString(2, nome);
            pstmt.setInt(3, idade);
            pstmt.setString(4, objetivo);
            pstmt.setString(5, nivel);
            pstmt.setDouble(6, pesoKg);
            pstmt.setInt(7, (int)alturaCm);
            pstmt.setString(8, restricoes);
            pstmt.setString(9, equipamentos);
            pstmt.executeUpdate();
            rs = pstmt.getGeneratedKeys();
            int alunoId = 0;
            if (rs.next()) {
                alunoId = rs.getInt(1);
            }
            pstmt.close();
            
            conn.commit();
            
            return new Aluno(alunoId, nome, idade, objetivo, nivel, pesoKg, alturaCm, 
                           restricoes, equipamentos, null, email, passwordHash, "{}");
        } catch (SQLException e) {
            try {
                conn.rollback();
            } catch (SQLException ignored) {}
            throw e;
        } finally {
            try {
                conn.setAutoCommit(true);
            } catch (SQLException ignored) {}
            pool.returnConnection(conn);
        }
    }

    /**
     * Adiciona aluno com hash de senha apenas (autenticação simplificada)
     * Cria usuário na tabela users e aluno na tabela alunos
     */
    public Aluno addAlunoWithHash(String nome, String email, String passwordHash) throws SQLException {
        String insertUserSQL = "INSERT INTO users (email, password_hash) VALUES (?, ?) RETURNING id";
        String insertAlunoSQL = """
            INSERT INTO alunos (user_id, nome, idade, objetivo, nivel, peso_kg, altura_cm, restricoes, equipamentos, metadata)
            VALUES (?::uuid, ?, ?, ?, ?, ?, ?, ?, ?, '{}')
            RETURNING id
            """;
        
        Connection conn = pool.getConnection();
        try {
            conn.setAutoCommit(false);
            
            // Insert user
            String userId = null;
            PreparedStatement pstmt = conn.prepareStatement(insertUserSQL, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, email);
            pstmt.setString(2, passwordHash);
            pstmt.executeUpdate();
            ResultSet rs = pstmt.getGeneratedKeys();
            if (rs.next()) {
                userId = rs.getString(1);  // UUID retornado como String
            }
            pstmt.close();
            
            if (userId == null) {
                conn.rollback();
                throw new SQLException("Erro ao criar usuário");
            }
            
            // Insert aluno com valores padrão
            pstmt = conn.prepareStatement(insertAlunoSQL, Statement.RETURN_GENERATED_KEYS);
            pstmt.setString(1, userId);  // UUID como String
            pstmt.setString(2, nome);
            pstmt.setInt(3, 0); // idade padrão
            pstmt.setString(4, "hipertrofia"); // objetivo padrão
            pstmt.setString(5, "iniciante"); // nivel padrão
            pstmt.setDouble(6, 0.0); // peso_kg padrão
            pstmt.setInt(7, 0); // altura_cm padrão
            pstmt.setString(8, ""); // restricoes
            pstmt.setString(9, ""); // equipamentos
            pstmt.executeUpdate();
            rs = pstmt.getGeneratedKeys();
            int alunoId = 0;
            if (rs.next()) {
                alunoId = rs.getInt(1);
            }
            pstmt.close();
            
            conn.commit();
            
            return new Aluno(alunoId, nome, 0, "hipertrofia", "iniciante", 0.0, 0, 
                           "", "", null, email, passwordHash, "{}");
        } catch (SQLException e) {
            try {
                conn.rollback();
            } catch (SQLException ignored) {}
            throw e;
        } finally {
            try {
                conn.setAutoCommit(true);
            } catch (SQLException ignored) {}
            pool.returnConnection(conn);
        }
    }

    /**
     * Obtém aluno por ID
     */
    public Aluno getAlunoById(int id) throws SQLException {
        String sql = """
            SELECT id, nome, idade, objetivo, nivel, peso_kg, altura_cm, restricoes, equipamentos, rpe
            FROM alunos WHERE id = ?
            """;
        
        return pool.executeQuery(sql, new Object[]{id}, rs -> {
            if (rs.next()) {
                return new Aluno(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getInt("idade"),
                    rs.getString("objetivo"),
                    rs.getString("nivel"),
                    rs.getDouble("peso_kg"),
                    rs.getInt("altura_cm"),
                    rs.getString("restricoes"),
                    rs.getString("equipamentos"),
                    rs.getObject("rpe") != null ? rs.getInt("rpe") : null,
                    "", "", "{}"
                );
            }
            return null;
        });
    }

    /**
     * Lista alunos com filtro por objetivo e nível
     */
    public List<Aluno> listAlunos(String objetivo, String nivel) throws SQLException {
        StringBuilder sql = new StringBuilder("""
            SELECT id, nome, idade, objetivo, nivel, peso_kg, altura_cm, restricoes, equipamentos, rpe
            FROM alunos WHERE 1=1
            """);
        
        List<Object> params = new ArrayList<>();
        
        if (objetivo != null && !objetivo.isEmpty()) {
            sql.append(" AND objetivo = ?");
            params.add(objetivo);
        }
        if (nivel != null && !nivel.isEmpty()) {
            sql.append(" AND nivel = ?");
            params.add(nivel);
        }
        
        sql.append(" ORDER BY id ASC");
        
        return pool.executeQuery(sql.toString(), params.toArray(), rs -> {
            List<Aluno> alunos = new ArrayList<>();
            while (rs.next()) {
                alunos.add(new Aluno(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getInt("idade"),
                    rs.getString("objetivo"),
                    rs.getString("nivel"),
                    rs.getDouble("peso_kg"),
                    rs.getInt("altura_cm"),
                    rs.getString("restricoes"),
                    rs.getString("equipamentos"),
                    rs.getObject("rpe") != null ? rs.getInt("rpe") : null,
                    "", "", "{}"
                ));
            }
            return alunos;
        });
    }

    /**
     * Atualiza aluno
     */
    public Aluno updateAluno(int id, Map<String, String> updates) throws SQLException {
        StringBuilder sql = new StringBuilder("UPDATE alunos SET ");
        List<Object> params = new ArrayList<>();
        
        updates.forEach((key, value) -> {
            if (!sql.toString().endsWith("SET ")) sql.append(", ");
            sql.append(key).append(" = ? ");
            params.add(value);
        });
        
        sql.append("WHERE id = ?");
        params.add(id);
        
        pool.executeUpdate(sql.toString(), params.toArray());
        return getAlunoById(id);
    }

    /**
     * Deleta aluno
     */
    public boolean deleteAluno(int id) throws SQLException {
        return pool.executeUpdate("DELETE FROM alunos WHERE id = ?", id) > 0;
    }

    // ==================== PROFESSORES ====================

    /**
     * Adiciona professor
     */
    public Professor addProfessor(String nome, String especialidade) throws SQLException {
        String sql = """
            INSERT INTO professores (nome, especialidade)
            VALUES (?, ?)
            RETURNING id
            """;
        
        long id = pool.executeInsertReturnId(sql, nome, especialidade);
        return new Professor((int)id, nome, especialidade);
    }

    /**
     * Lista professores
     */
    public List<Professor> listProfessores() throws SQLException {
        String sql = "SELECT id, nome, especialidade FROM professores ORDER BY id ASC";
        
        return pool.executeQuery(sql, rs -> {
            List<Professor> profs = new ArrayList<>();
            while (rs.next()) {
                profs.add(new Professor(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("especialidade")
                ));
            }
            return profs;
        });
    }

    /**
     * Obtém professor por ID
     */
    public Professor getProfessorById(int id) throws SQLException {
        String sql = "SELECT id, nome, especialidade FROM professores WHERE id = ?";
        
        return pool.executeQuery(sql, new Object[]{id}, rs -> {
            if (rs.next()) {
                return new Professor(
                    rs.getInt("id"),
                    rs.getString("nome"),
                    rs.getString("especialidade")
                );
            }
            return null;
        });
    }

    // ==================== MIGRAÇÃO DE DADOS ====================

    /**
     * Migra dados de CSV para PostgreSQL (para recovery/backup)
     */
    public void migrateFromCSV(Path alunosCSV, Path profsCSV) throws IOException, SQLException {
        System.out.println("[DB] Iniciando migração de dados CSV...");
        
        // Limpar tabelas
        pool.executeUpdate("DELETE FROM alunos");
        pool.executeUpdate("DELETE FROM professores");
        
        // Migrar alunos
        if (Files.exists(alunosCSV)) {
            int count = 0;
            for (String line : Files.readAllLines(alunosCSV, StandardCharsets.UTF_8)) {
                if (line.trim().isEmpty()) continue;
                
                Aluno a = Aluno.fromCSV(line);
                if (a != null) {
                    try {
                        addAluno(a.nome, a.idade, a.objetivo, a.nivel, 
                                a.pesoKg, a.alturaCm, a.restricoes, a.equipamentos, a.rpe);
                        count++;
                    } catch (SQLException e) {
                        System.err.println("[DB] Erro ao migrar aluno: " + e.getMessage());
                    }
                }
            }
            System.out.println("[DB] " + count + " alunos migrados");
        }
        
        // Migrar professores
        if (Files.exists(profsCSV)) {
            int count = 0;
            for (String line : Files.readAllLines(profsCSV, StandardCharsets.UTF_8)) {
                if (line.trim().isEmpty()) continue;
                
                Professor p = Professor.fromCSV(line);
                if (p != null) {
                    try {
                        addProfessor(p.nome, p.especialidade);
                        count++;
                    } catch (SQLException e) {
                        System.err.println("[DB] Erro ao migrar professor: " + e.getMessage());
                    }
                }
            }
            System.out.println("[DB] " + count + " professores migrados");
        }
    }

    /**
     * Retorna status da conexão
     */
    public String getStatus() {
        return pool.getStatus();
    }

    /**
     * Fecha o pool
     */
    public void close() {
        pool.close();
    }
}
