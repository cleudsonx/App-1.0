package storage;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

/**
 * Camada de persistência melhorada com cache e operações thread-safe
 */
import java.util.HashMap;
import java.util.Map;

public class DataStorage implements Storage {
    // Armazenamento simples em memória para refresh tokens (userId -> token)
    private final Map<Integer, String> refreshTokens = new HashMap<>();
        // === Métodos de refresh token (mínimo viável) ===
        public boolean isRefreshTokenValido(int userId, String token) {
            return token != null && token.equals(refreshTokens.get(userId));
        }
        public void invalidarRefreshToken(int userId, String token) {
            refreshTokens.remove(userId);
        }
        public void salvarRefreshToken(int userId, String token, long expiraEm) {
            refreshTokens.put(userId, token);
        }
    private final Path dataDir;
    private final Path alunosCSV;
    private final Path profsCSV;
    
    // Cache em memória para performance
    private final Map<Integer, Aluno> alunosCache = new ConcurrentHashMap<>();
    private final Map<Integer, Professor> professoresCache = new ConcurrentHashMap<>();
    
    private final AtomicInteger alunoSeq = new AtomicInteger(1);
    private final AtomicInteger profSeq = new AtomicInteger(1);

    public DataStorage(Path dataDir) throws IOException {
        this.dataDir = dataDir;
        this.alunosCSV = dataDir.resolve("alunos.csv");
        this.profsCSV = dataDir.resolve("professores.csv");
        if (!Files.exists(dataDir)) Files.createDirectories(dataDir);
        load();
    }

    private void load() throws IOException {
        if (Files.exists(alunosCSV)) {
            for (String line : Files.readAllLines(alunosCSV, StandardCharsets.UTF_8)) {
                if (line.trim().isEmpty()) continue;
                Aluno a = Aluno.fromCSV(line);
                if (a != null) {
                    alunosCache.put(a.id, a);
                    alunoSeq.set(Math.max(alunoSeq.get(), a.id + 1));
                }
            }
        }
        if (Files.exists(profsCSV)) {
            for (String line : Files.readAllLines(profsCSV, StandardCharsets.UTF_8)) {
                if (line.trim().isEmpty()) continue;
                Professor p = Professor.fromCSV(line);
                if (p != null) {
                    professoresCache.put(p.id, p);
                    profSeq.set(Math.max(profSeq.get(), p.id + 1));
                }
            }
        }
    }

    private synchronized void saveAlunos() throws IOException {
        List<String> lines = alunosCache.values().stream()
                .sorted(Comparator.comparingInt(a -> a.id))
                .map(Aluno::toCSV)
                .collect(Collectors.toList());
        Files.write(alunosCSV, lines, StandardCharsets.UTF_8, 
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    private synchronized void saveProfs() throws IOException {
        List<String> lines = professoresCache.values().stream()
                .sorted(Comparator.comparingInt(p -> p.id))
                .map(Professor::toCSV)
                .collect(Collectors.toList());
        Files.write(profsCSV, lines, StandardCharsets.UTF_8, 
                    StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    // ==================== ALUNOS ====================

    public synchronized Aluno addAluno(String nome, int idade, String objetivo, String nivel,
                                       double pesoKg, double alturaCm, String restricoes, 
                                       String equipamentos, Integer rpe) throws IOException {
        Aluno a = new Aluno(alunoSeq.getAndIncrement(), nome, idade, objetivo, nivel, 
                            pesoKg, alturaCm, restricoes, equipamentos, rpe, "", "", "{}");
        alunosCache.put(a.id, a);
        saveAlunos();
        return a;
    }

    public Aluno getAlunoById(int id) {
        return alunosCache.get(id);
    }

    public List<Aluno> listAlunos(String objetivo, String nivel) {
        return alunosCache.values().stream()
                .filter(a -> objetivo == null || objetivo.isEmpty() || objetivo.equalsIgnoreCase(a.objetivo))
                .filter(a -> nivel == null || nivel.isEmpty() || nivel.equalsIgnoreCase(a.nivel))
                .sorted(Comparator.comparingInt(a -> a.id))
                .collect(Collectors.toList());
    }

    public synchronized Aluno updateAluno(int id, Map<String, String> updates) throws IOException {
        Aluno existing = alunosCache.get(id);
        if (existing == null) return null;

        // Atualiza campos
        if (updates.containsKey("nome")) existing.nome = updates.get("nome");
        if (updates.containsKey("idade")) existing.idade = parseIntSafe(updates.get("idade"), existing.idade);
        if (updates.containsKey("objetivo")) existing.objetivo = updates.get("objetivo");
        if (updates.containsKey("nivel")) existing.nivel = updates.get("nivel");
        if (updates.containsKey("pesoKg")) existing.pesoKg = parseDoubleSafe(updates.get("pesoKg"), existing.pesoKg);
        if (updates.containsKey("alturaCm")) existing.alturaCm = parseDoubleSafe(updates.get("alturaCm"), existing.alturaCm);
        if (updates.containsKey("restricoes")) existing.restricoes = updates.get("restricoes");
        if (updates.containsKey("equipamentos")) existing.equipamentos = updates.get("equipamentos");
        if (updates.containsKey("rpe")) {
            String rpeStr = updates.get("rpe");
            existing.rpe = (rpeStr == null || rpeStr.isEmpty()) ? null : parseIntSafe(rpeStr, 0);
        }

        saveAlunos();
        return existing;
    }

    public synchronized boolean deleteAluno(int id) throws IOException {
        if (alunosCache.remove(id) != null) {
            saveAlunos();
            return true;
        }
        return false;
    }

    // Métodos auxiliares para autenticação
    public Aluno getAlunoByEmail(String email) {
        if (email == null) return null;
        return alunosCache.values().stream()
            .filter(a -> email.equalsIgnoreCase(a.getEmail()))
            .findFirst()
            .orElse(null);
    }

    public synchronized Aluno addAluno(String nome, String email, String senha) throws IOException {
        int id = alunoSeq.getAndIncrement();
        Aluno a = new Aluno(id, nome, 0, "hipertrofia", "iniciante", 0, 0, "", "", null, email, senha, "{}");
        alunosCache.put(a.getId(), a);
        saveAlunos();
        return a;
    }

    /**
     * Adiciona aluno com senha já hasheada (PBKDF2)
     * ✅ Para uso com PasswordHasher - senha já vem criptografada
     */
    public synchronized Aluno addAlunoWithHash(String nome, String email, String senhaHash) throws IOException {
        int id = alunoSeq.getAndIncrement();
        Aluno a = new Aluno(id, nome, 0, "hipertrofia", "iniciante", 0, 0, "", "", null, email, senhaHash, "{}");
        alunosCache.put(a.getId(), a);
        saveAlunos();
        return a;
    }

    // ==================== PROFESSORES ====================

    public synchronized Professor addProfessor(String nome, String especialidade) throws IOException {
        Professor p = new Professor(profSeq.getAndIncrement(), nome, especialidade);
        professoresCache.put(p.id, p);
        saveProfs();
        return p;
    }

    public Professor getProfessorById(int id) {
        return professoresCache.get(id);
    }

    public List<Professor> listProfessores(String especialidade) {
        return professoresCache.values().stream()
                .filter(p -> especialidade == null || especialidade.isEmpty() || 
                            especialidade.equalsIgnoreCase(p.especialidade))
                .sorted(Comparator.comparingInt(p -> p.id))
                .collect(Collectors.toList());
    }

    public synchronized boolean deleteProfessor(int id) throws IOException {
        if (professoresCache.remove(id) != null) {
            saveProfs();
            return true;
        }
        return false;
    }

    // ==================== UTILIDADES ====================

    public static String toJSONArrayAlunos(List<Aluno> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(list.get(i).toJSON());
        }
        sb.append(']');
        return sb.toString();
    }

    public static String toJSONArrayProfessores(List<Professor> list) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < list.size(); i++) {
            if (i > 0) sb.append(',');
            sb.append(list.get(i).toJSON());
        }
        sb.append(']');
        return sb.toString();
    }

    private int parseIntSafe(String s, int defaultVal) {
        try { return Integer.parseInt(s); }
        catch (Exception e) { return defaultVal; }
    }

    private double parseDoubleSafe(String s, double defaultVal) {
        try { return Double.parseDouble(s); }
        catch (Exception e) { return defaultVal; }
    }
}
