public class Professor {
    public int id;
    public String nome;
    public String especialidade; // musculacao | cardio | funcional | alongamento

    public Professor(int id, String nome, String especialidade) {
        this.id = id;
        this.nome = nome;
        this.especialidade = especialidade;
    }

    public String toCSV() {
        return id + ";" + escape(nome) + ";" + especialidade;
    }

    public static Professor fromCSV(String line) {
        String[] p = line.split(";", -1);
        if (p.length < 3) return null;
        int id = Integer.parseInt(p[0]);
        String nome = unescape(p[1]);
        String esp = p[2];
        return new Professor(id, nome, esp);
    }

    public String toJSON() {
        return "{" +
            "\"id\":" + id + "," +
            "\"nome\":\"" + jsonEsc(nome) + "\"," +
            "\"especialidade\":\"" + jsonEsc(especialidade) + "\"" +
            "}";
    }

    private static String escape(String s) { return s.replace(";", ","); }
    private static String unescape(String s) { return s; }
    private static String jsonEsc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\""); }
}
