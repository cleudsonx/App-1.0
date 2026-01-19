package storage;

/**
 * Modelo de Aluno com campos expandidos
 */
public class Aluno {
    public int id;
    public String nome;
    public int idade;
    public String objetivo; // perda_peso | hipertrofia | resistencia | forca
    public String nivel;    // iniciante | intermediario | avancado
    public double pesoKg;
    public double alturaCm;
    public String restricoes;
    public String equipamentos;
    public Integer rpe;
    public String email;
    public String senha;
    public String perfil; // JSON string

    public Aluno(int id, String nome, int idade, String objetivo, String nivel,
                 double pesoKg, double alturaCm, String restricoes, String equipamentos, Integer rpe,
                 String email, String senha, String perfil) {
        this.id = id;
        this.nome = nome;
        this.idade = idade;
        this.objetivo = objetivo;
        this.nivel = nivel;
        this.pesoKg = pesoKg;
        this.alturaCm = alturaCm;
        this.restricoes = restricoes;
        this.equipamentos = equipamentos;
        this.rpe = rpe;
        this.email = email;
        this.senha = senha;
        this.perfil = perfil != null ? perfil : "{}";
    }

    public String toCSV() {
        return id + ";" + escape(nome) + ";" + idade + ";" + objetivo + ";" + nivel + ";" +
               pesoKg + ";" + alturaCm + ";" + escape(nullToEmpty(restricoes)) + ";" + 
               escape(nullToEmpty(equipamentos)) + ";" + (rpe == null ? "" : rpe) + ";" +
               escape(email) + ";" + escape(senha) + ";" + escape(perfil);
    }

    public static Aluno fromCSV(String line) {
        String[] p = line.split(";", -1);
        if (p.length < 10) return null;
        int id = Integer.parseInt(p[0]);
        String nome = unescape(p[1]);
        int idade = Integer.parseInt(p[2]);
        String objetivo = p[3];
        String nivel = p[4];
        double pesoKg = parseDoubleSafe(p[5]);
        double alturaCm = parseDoubleSafe(p[6]);
        String restricoes = unescape(p[7]);
        String equipamentos = unescape(p[8]);
        Integer rpe = p[9].isEmpty() ? null : Integer.parseInt(p[9]);
        String email = p.length > 10 ? unescape(p[10]) : "";
        String senha = p.length > 11 ? unescape(p[11]) : "";
        String perfil = p.length > 12 ? unescape(p[12]) : "{}";
        return new Aluno(id, nome, idade, objetivo, nivel, pesoKg, alturaCm, restricoes, equipamentos, rpe, email, senha, perfil);
    }

    public String toJSON() {
        return "{" +
            "\"id\":" + id + "," +
            "\"nome\":\"" + jsonEsc(nome) + "\"," +
            "\"idade\":" + idade + "," +
            "\"objetivo\":\"" + jsonEsc(objetivo) + "\"," +
            "\"nivel\":\"" + jsonEsc(nivel) + "\"," +
            "\"pesoKg\":" + pesoKg + "," +
            "\"alturaCm\":" + alturaCm + "," +
            "\"imc\":" + String.format("%.1f", calcularIMC()) + "," +
            "\"restricoes\":\"" + jsonEsc(nullToEmpty(restricoes)) + "\"," +
            "\"equipamentos\":\"" + jsonEsc(nullToEmpty(equipamentos)) + "\"," +
            "\"rpe\":" + (rpe == null ? "null" : rpe) +
            "}";
    }

    public double calcularIMC() {
        if (alturaCm <= 0) return 0;
        double alturaM = alturaCm / 100.0;
        return pesoKg / (alturaM * alturaM);
    }

    // Getters
    public int getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getSenha() { return senha; }
    public String getPerfil() { return perfil; }

    private static String escape(String s) { return s.replace(";", ","); }
    private static String unescape(String s) { return s; }
    private static String jsonEsc(String s) { return s.replace("\\", "\\\\").replace("\"", "\\\""); }
    private static String nullToEmpty(String s) { return s == null ? "" : s; }
    private static double parseDoubleSafe(String s) { 
        try { return Double.parseDouble(s); } 
        catch (Exception e) { return 0.0; } 
    }
}
