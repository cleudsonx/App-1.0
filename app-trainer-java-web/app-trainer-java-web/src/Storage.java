import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Storage {
    private final Path dataDir;
    private final Path alunosCSV;
    private final Path profsCSV;
    private final List<Aluno> alunos = new ArrayList<>();
    private final List<Professor> professores = new ArrayList<>();
    private final AtomicInteger alunoSeq = new AtomicInteger(1);
    private final AtomicInteger profSeq = new AtomicInteger(1);

    public Storage(Path dataDir) throws IOException {
        this.dataDir = dataDir;
        this.alunosCSV = dataDir.resolve("alunos.csv");
        this.profsCSV = dataDir.resolve("professores.csv");
        if (!Files.exists(dataDir)) Files.createDirectories(dataDir);
        load();
    }

    private void load() throws IOException {
        if (Files.exists(alunosCSV)) {
            for (String line : Files.readAllLines(alunosCSV, StandardCharsets.UTF_8)) {
                Aluno a = Aluno.fromCSV(line);
                if (a != null) { alunos.add(a); alunoSeq.set(Math.max(alunoSeq.get(), a.id + 1)); }
            }
        }
        if (Files.exists(profsCSV)) {
            for (String line : Files.readAllLines(profsCSV, StandardCharsets.UTF_8)) {
                Professor p = Professor.fromCSV(line);
                if (p != null) { professores.add(p); profSeq.set(Math.max(profSeq.get(), p.id + 1)); }
            }
        }
    }

    private void saveAlunos() throws IOException {
        List<String> lines = new ArrayList<>();
        for (Aluno a : alunos) lines.add(a.toCSV());
        Files.write(alunosCSV, lines, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    private void saveProfs() throws IOException {
        List<String> lines = new ArrayList<>();
        for (Professor p : professores) lines.add(p.toCSV());
        Files.write(profsCSV, lines, StandardCharsets.UTF_8, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    public synchronized Aluno addAluno(String nome, int idade, String objetivo, String nivel,
                                       double pesoKg, double alturaCm, String restricoes, String equipamentos, Integer rpe) throws IOException {
        Aluno a = new Aluno(alunoSeq.getAndIncrement(), nome, idade, objetivo, nivel, pesoKg, alturaCm, restricoes, equipamentos, rpe);
        alunos.add(a);
        saveAlunos();
        return a;
    }

    public synchronized Professor addProfessor(String nome, String especialidade) throws IOException {
        Professor p = new Professor(profSeq.getAndIncrement(), nome, especialidade);
        professores.add(p);
        saveProfs();
        return p;
    }

    public synchronized List<Aluno> listAlunos() { return new ArrayList<>(alunos); }
    public synchronized List<Professor> listProfessores() { return new ArrayList<>(professores); }

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
}
