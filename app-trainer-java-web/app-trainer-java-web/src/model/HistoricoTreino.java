package model;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Registro de treino realizado para tracking de progresso
 */
public class HistoricoTreino {
    private static final DateTimeFormatter FMT = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public int id;
    public int alunoId;
    public int treinoId;
    public LocalDateTime dataRealizacao;
    public int duracaoMinutos;
    public int rpePercebido;       // 1-10
    public String feedback;        // comentário do aluno
    public boolean completo;

    public HistoricoTreino(int id, int alunoId, int treinoId, LocalDateTime dataRealizacao,
                           int duracaoMinutos, int rpePercebido, String feedback, boolean completo) {
        this.id = id;
        this.alunoId = alunoId;
        this.treinoId = treinoId;
        this.dataRealizacao = dataRealizacao;
        this.duracaoMinutos = duracaoMinutos;
        this.rpePercebido = rpePercebido;
        this.feedback = feedback;
        this.completo = completo;
    }

    public String toJSON() {
        return "{" +
            "\"id\":" + id + "," +
            "\"alunoId\":" + alunoId + "," +
            "\"treinoId\":" + treinoId + "," +
            "\"dataRealizacao\":\"" + dataRealizacao.format(FMT) + "\"," +
            "\"duracaoMinutos\":" + duracaoMinutos + "," +
            "\"rpePercebido\":" + rpePercebido + "," +
            "\"feedback\":\"" + jsonEsc(nullToEmpty(feedback)) + "\"," +
            "\"completo\":" + completo +
            "}";
    }

    public String toCSV() {
        return id + ";" + alunoId + ";" + treinoId + ";" + dataRealizacao.format(FMT) + ";" +
               duracaoMinutos + ";" + rpePercebido + ";" + escape(nullToEmpty(feedback)) + ";" + completo;
    }

    public static HistoricoTreino fromCSV(String line) {
        String[] p = line.split(";", -1);
        if (p.length < 8) return null;
        return new HistoricoTreino(
            Integer.parseInt(p[0]),
            Integer.parseInt(p[1]),
            Integer.parseInt(p[2]),
            LocalDateTime.parse(p[3], FMT),
            Integer.parseInt(p[4]),
            Integer.parseInt(p[5]),
            unescape(p[6]),
            Boolean.parseBoolean(p[7])
        );
    }

    private static String escape(String s) { return s.replace(";", ",").replace("\n", " "); }
    private static String unescape(String s) { return s; }
    private static String jsonEsc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n"); }
    private static String nullToEmpty(String s) { return s == null ? "" : s; }
}
