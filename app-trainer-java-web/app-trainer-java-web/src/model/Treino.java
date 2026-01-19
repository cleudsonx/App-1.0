package model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * Representa um treino completo com exercícios
 */
public class Treino {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    
    public int id;
    public int alunoId;
    public String nome;           // ex: "Treino A - Peito/Tríceps"
    public String tipo;           // hipertrofia, forca, resistencia, funcional
    public String diaSemana;      // segunda, terca, quarta...
    public List<ExercicioTreino> exercicios;
    public String observacoes;
    public LocalDateTime criadoEm;
    public LocalDateTime atualizadoEm;

    public Treino(int id, int alunoId, String nome, String tipo, String diaSemana,
                  List<ExercicioTreino> exercicios, String observacoes,
                  LocalDateTime criadoEm, LocalDateTime atualizadoEm) {
        this.id = id;
        this.alunoId = alunoId;
        this.nome = nome;
        this.tipo = tipo;
        this.diaSemana = diaSemana;
        this.exercicios = exercicios != null ? exercicios : new ArrayList<>();
        this.observacoes = observacoes;
        this.criadoEm = criadoEm != null ? criadoEm : LocalDateTime.now();
        this.atualizadoEm = atualizadoEm != null ? atualizadoEm : LocalDateTime.now();
    }

    public String toJSON() {
        StringBuilder exsJson = new StringBuilder("[");
        for (int i = 0; i < exercicios.size(); i++) {
            if (i > 0) exsJson.append(',');
            exsJson.append(exercicios.get(i).toJSON());
        }
        exsJson.append(']');

        return "{" +
            "\"id\":" + id + "," +
            "\"alunoId\":" + alunoId + "," +
            "\"nome\":\"" + jsonEsc(nome) + "\"," +
            "\"tipo\":\"" + jsonEsc(tipo) + "\"," +
            "\"diaSemana\":\"" + jsonEsc(nullToEmpty(diaSemana)) + "\"," +
            "\"exercicios\":" + exsJson + "," +
            "\"observacoes\":\"" + jsonEsc(nullToEmpty(observacoes)) + "\"," +
            "\"criadoEm\":\"" + criadoEm.format(FMT) + "\"," +
            "\"atualizadoEm\":\"" + atualizadoEm.format(FMT) + "\"" +
            "}";
    }

    private static String jsonEsc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n"); }
    private static String nullToEmpty(String s) { return s == null ? "" : s; }

    /**
     * Representa um exercício dentro de um treino com séries/reps específicas
     */
    public static class ExercicioTreino {
        public int exercicioId;
        public String nomeExercicio;
        public int series;
        public String repeticoes;   // "8-12" ou "10"
        public double cargaKg;
        public int ordem;
        public String notas;

        public ExercicioTreino(int exercicioId, String nomeExercicio, int series, 
                               String repeticoes, double cargaKg, int ordem, String notas) {
            this.exercicioId = exercicioId;
            this.nomeExercicio = nomeExercicio;
            this.series = series;
            this.repeticoes = repeticoes;
            this.cargaKg = cargaKg;
            this.ordem = ordem;
            this.notas = notas;
        }

        public String toJSON() {
            return "{" +
                "\"exercicioId\":" + exercicioId + "," +
                "\"nomeExercicio\":\"" + jsonEsc(nomeExercicio) + "\"," +
                "\"series\":" + series + "," +
                "\"repeticoes\":\"" + jsonEsc(repeticoes) + "\"," +
                "\"cargaKg\":" + cargaKg + "," +
                "\"ordem\":" + ordem + "," +
                "\"notas\":\"" + jsonEsc(nullToEmpty(notas)) + "\"" +
                "}";
        }

        private static String jsonEsc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\""); }
        private static String nullToEmpty(String s) { return s == null ? "" : s; }
    }
}
