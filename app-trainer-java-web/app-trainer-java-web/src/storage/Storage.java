package storage;

import java.io.IOException;
import java.sql.SQLException;

public interface Storage {
    // Métodos de refresh token
    boolean isRefreshTokenValido(int userId, String token) throws Exception;
    void invalidarRefreshToken(int userId, String token) throws Exception;
    void salvarRefreshToken(int userId, String token, long expiraEmEpoch) throws Exception;

    // Métodos de aluno
    Aluno getAlunoByEmail(String email) throws Exception;
    Aluno addAlunoWithHash(String nome, String email, String senhaHash) throws Exception;
    Aluno getAlunoById(int id) throws Exception;
    java.util.List<Aluno> listAlunos(String objetivo, String nivel) throws Exception;
    Aluno addAluno(String nome, int idade, String objetivo, String nivel, double pesoKg, double alturaCm, String restricoes, String equipamentos, Integer rpe) throws Exception;
    Aluno updateAluno(int id, java.util.Map<String, String> updates) throws Exception;
    boolean deleteAluno(int id) throws Exception;

    // Métodos de professor
    Professor addProfessor(String nome, String especialidade) throws Exception;
    Professor getProfessorById(int id) throws Exception;
    java.util.List<Professor> listProfessores(String especialidade) throws Exception;
    boolean deleteProfessor(int id) throws Exception;
}
