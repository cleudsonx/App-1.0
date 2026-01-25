package storage;

import java.io.IOException;
import java.sql.SQLException;

public interface Storage {
    // Métodos de refresh token
    boolean isRefreshTokenValido(int userId, String token) throws SQLException;
    void invalidarRefreshToken(int userId, String token) throws SQLException;
    void salvarRefreshToken(int userId, String token, long expiraEmEpoch) throws SQLException;

    // Métodos de usuário
    Aluno getAlunoByEmail(String email) throws SQLException;
    Aluno addAlunoWithHash(String nome, String email, String senhaHash) throws SQLException;
    // Adicione outros métodos conforme necessário (ex: getAlunoById, updateAluno, etc)
}
