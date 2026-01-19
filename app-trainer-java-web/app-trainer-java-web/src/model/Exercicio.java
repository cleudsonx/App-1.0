package model;

/**
 * Representa um exercício de musculação/treinamento resistido
 */
public class Exercicio {
    public int id;
    public String nome;
    public String grupoMuscular;  // peito, costas, pernas, ombros, bracos, core
    public String tipo;           // composto, isolado, cardio
    public String equipamento;    // barra, halteres, maquina, cabo, peso_corpo
    public String dificuldade;    // iniciante, intermediario, avancado
    public String instrucoes;
    public int tempoDescansoSeg;  // descanso recomendado em segundos

    public Exercicio(int id, String nome, String grupoMuscular, String tipo, 
                     String equipamento, String dificuldade, String instrucoes, int tempoDescansoSeg) {
        this.id = id;
        this.nome = nome;
        this.grupoMuscular = grupoMuscular;
        this.tipo = tipo;
        this.equipamento = equipamento;
        this.dificuldade = dificuldade;
        this.instrucoes = instrucoes;
        this.tempoDescansoSeg = tempoDescansoSeg;
    }

    public String toJSON() {
        return "{" +
            "\"id\":" + id + "," +
            "\"nome\":\"" + jsonEsc(nome) + "\"," +
            "\"grupoMuscular\":\"" + jsonEsc(grupoMuscular) + "\"," +
            "\"tipo\":\"" + jsonEsc(tipo) + "\"," +
            "\"equipamento\":\"" + jsonEsc(equipamento) + "\"," +
            "\"dificuldade\":\"" + jsonEsc(dificuldade) + "\"," +
            "\"instrucoes\":\"" + jsonEsc(nullToEmpty(instrucoes)) + "\"," +
            "\"tempoDescansoSeg\":" + tempoDescansoSeg +
            "}";
    }

    public String toCSV() {
        return id + ";" + escape(nome) + ";" + grupoMuscular + ";" + tipo + ";" +
               equipamento + ";" + dificuldade + ";" + escape(nullToEmpty(instrucoes)) + ";" + tempoDescansoSeg;
    }

    public static Exercicio fromCSV(String line) {
        String[] p = line.split(";", -1);
        if (p.length < 8) return null;
        return new Exercicio(
            Integer.parseInt(p[0]), unescape(p[1]), p[2], p[3],
            p[4], p[5], unescape(p[6]), Integer.parseInt(p[7])
        );
    }

    private static String escape(String s) { return s.replace(";", ",").replace("\n", " "); }
    private static String unescape(String s) { return s; }
    private static String jsonEsc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n"); }
    private static String nullToEmpty(String s) { return s == null ? "" : s; }
}
