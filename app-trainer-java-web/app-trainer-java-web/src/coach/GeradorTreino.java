package coach;

import java.util.*;

/**
 * Gerador de treinos personalizados baseado em objetivo, nível e restrições
 */
public class GeradorTreino {

    // Base de exercícios por grupo muscular
    private final Map<String, List<ExercicioBase>> exerciciosPorGrupo = new HashMap<>();

    public GeradorTreino() {
        inicializarExercicios();
    }

    private void inicializarExercicios() {
        // PEITO
        exerciciosPorGrupo.put("peito", Arrays.asList(
            new ExercicioBase("Supino Reto com Barra", "composto", "barra,banco", "iniciante", 90),
            new ExercicioBase("Supino Inclinado com Halteres", "composto", "halteres,banco", "intermediario", 90),
            new ExercicioBase("Supino Declinado", "composto", "barra,banco", "intermediario", 90),
            new ExercicioBase("Crucifixo com Halteres", "isolado", "halteres,banco", "iniciante", 60),
            new ExercicioBase("Crossover no Cabo", "isolado", "cabo", "intermediario", 60),
            new ExercicioBase("Flexão de Braço", "composto", "peso_corpo", "iniciante", 60),
            new ExercicioBase("Fly na Máquina (Peck Deck)", "isolado", "maquina", "iniciante", 60)
        ));

        // COSTAS
        exerciciosPorGrupo.put("costas", Arrays.asList(
            new ExercicioBase("Remada Curvada com Barra", "composto", "barra", "intermediario", 90),
            new ExercicioBase("Puxada Frontal na Polia", "composto", "cabo", "iniciante", 75),
            new ExercicioBase("Remada Unilateral com Halter", "composto", "halteres,banco", "iniciante", 75),
            new ExercicioBase("Remada Cavalinho", "composto", "maquina", "iniciante", 90),
            new ExercicioBase("Pulldown com Pegada Neutra", "composto", "cabo", "iniciante", 75),
            new ExercicioBase("Levantamento Terra", "composto", "barra", "avancado", 180),
            new ExercicioBase("Pull-up (Barra Fixa)", "composto", "peso_corpo", "intermediario", 90),
            new ExercicioBase("Face Pull", "isolado", "cabo", "iniciante", 60)
        ));

        // PERNAS - QUADRÍCEPS
        exerciciosPorGrupo.put("quadriceps", Arrays.asList(
            new ExercicioBase("Agachamento Livre", "composto", "barra", "intermediario", 120),
            new ExercicioBase("Leg Press 45°", "composto", "maquina", "iniciante", 90),
            new ExercicioBase("Agachamento no Hack", "composto", "maquina", "intermediario", 90),
            new ExercicioBase("Extensora", "isolado", "maquina", "iniciante", 60),
            new ExercicioBase("Agachamento Goblet", "composto", "halteres", "iniciante", 90),
            new ExercicioBase("Passada com Halteres", "composto", "halteres", "iniciante", 75),
            new ExercicioBase("Agachamento Búlgaro", "composto", "halteres,banco", "intermediario", 90)
        ));

        // PERNAS - POSTERIORES
        exerciciosPorGrupo.put("posteriores", Arrays.asList(
            new ExercicioBase("Stiff com Barra", "composto", "barra", "intermediario", 90),
            new ExercicioBase("Mesa Flexora", "isolado", "maquina", "iniciante", 60),
            new ExercicioBase("Levantamento Terra Romeno", "composto", "barra,halteres", "intermediario", 90),
            new ExercicioBase("Flexora em Pé", "isolado", "maquina", "iniciante", 60),
            new ExercicioBase("Good Morning", "composto", "barra", "avancado", 90)
        ));

        // GLÚTEOS
        exerciciosPorGrupo.put("gluteos", Arrays.asList(
            new ExercicioBase("Hip Thrust", "composto", "barra,banco", "intermediario", 90),
            new ExercicioBase("Elevação de Quadril", "isolado", "peso_corpo", "iniciante", 60),
            new ExercicioBase("Abdução na Máquina", "isolado", "maquina", "iniciante", 60),
            new ExercicioBase("Kickback no Cabo", "isolado", "cabo", "iniciante", 60)
        ));

        // OMBROS
        exerciciosPorGrupo.put("ombros", Arrays.asList(
            new ExercicioBase("Desenvolvimento com Halteres", "composto", "halteres,banco", "iniciante", 90),
            new ExercicioBase("Desenvolvimento Militar", "composto", "barra", "intermediario", 90),
            new ExercicioBase("Elevação Lateral", "isolado", "halteres", "iniciante", 60),
            new ExercicioBase("Elevação Frontal", "isolado", "halteres", "iniciante", 60),
            new ExercicioBase("Crucifixo Inverso", "isolado", "halteres,cabo", "iniciante", 60),
            new ExercicioBase("Encolhimento (Trapézio)", "isolado", "halteres,barra", "iniciante", 60)
        ));

        // BÍCEPS
        exerciciosPorGrupo.put("biceps", Arrays.asList(
            new ExercicioBase("Rosca Direta com Barra", "isolado", "barra", "iniciante", 60),
            new ExercicioBase("Rosca Alternada com Halteres", "isolado", "halteres", "iniciante", 60),
            new ExercicioBase("Rosca Martelo", "isolado", "halteres", "iniciante", 60),
            new ExercicioBase("Rosca Concentrada", "isolado", "halteres", "iniciante", 60),
            new ExercicioBase("Rosca Scott", "isolado", "barra,banco", "intermediario", 60),
            new ExercicioBase("Rosca no Cabo", "isolado", "cabo", "iniciante", 60)
        ));

        // TRÍCEPS
        exerciciosPorGrupo.put("triceps", Arrays.asList(
            new ExercicioBase("Tríceps Corda no Cabo", "isolado", "cabo", "iniciante", 60),
            new ExercicioBase("Tríceps Testa", "isolado", "barra,halteres", "intermediario", 60),
            new ExercicioBase("Tríceps Francês", "isolado", "halteres", "iniciante", 60),
            new ExercicioBase("Mergulho no Banco", "composto", "banco,peso_corpo", "iniciante", 60),
            new ExercicioBase("Supino Fechado", "composto", "barra,banco", "intermediario", 90),
            new ExercicioBase("Tríceps Kickback", "isolado", "halteres", "iniciante", 60)
        ));

        // PANTURRILHA
        exerciciosPorGrupo.put("panturrilha", Arrays.asList(
            new ExercicioBase("Elevação de Panturrilha em Pé", "isolado", "maquina", "iniciante", 45),
            new ExercicioBase("Elevação de Panturrilha Sentado", "isolado", "maquina", "iniciante", 45),
            new ExercicioBase("Elevação de Panturrilha no Leg Press", "isolado", "maquina", "iniciante", 45)
        ));

        // CORE/ABDOMEN
        exerciciosPorGrupo.put("core", Arrays.asList(
            new ExercicioBase("Prancha Frontal", "isolado", "peso_corpo", "iniciante", 30),
            new ExercicioBase("Abdominal Crunch", "isolado", "peso_corpo", "iniciante", 45),
            new ExercicioBase("Elevação de Pernas", "isolado", "peso_corpo", "intermediario", 45),
            new ExercicioBase("Russian Twist", "isolado", "peso_corpo,halteres", "intermediario", 45),
            new ExercicioBase("Dead Bug", "isolado", "peso_corpo", "iniciante", 30),
            new ExercicioBase("Prancha Lateral", "isolado", "peso_corpo", "intermediario", 30)
        ));
    }

    /**
     * Gera um treino personalizado
     */
    public TreinoGerado gerarTreino(String objetivo, String nivel, String restricoes, 
                                     String equipamentosDisponiveis, int diasSemana) {
        // Determina divisão baseada em dias disponíveis
        List<String> divisao = determinarDivisao(diasSemana, nivel);
        
        // Parâmetros baseados no objetivo
        ParametrosTreino params = getParametrosPorObjetivo(objetivo, nivel);
        
        // Filtra exercícios por restrições
        Set<String> restricoesSet = parseRestricoes(restricoes);
        Set<String> equipamentos = parseEquipamentos(equipamentosDisponiveis);
        
        // Gera treinos para cada dia
        List<TreinoDia> treinos = new ArrayList<>();
        for (int i = 0; i < divisao.size(); i++) {
            String gruposDia = divisao.get(i);
            TreinoDia dia = gerarTreinoDia(i + 1, gruposDia, params, restricoesSet, equipamentos, nivel);
            treinos.add(dia);
        }

        return new TreinoGerado(
            "Treino " + capitalize(objetivo) + " - " + capitalize(nivel),
            objetivo,
            nivel,
            params.frequencia,
            treinos,
            gerarObservacoes(objetivo, nivel, restricoesSet)
        );
    }

    private List<String> determinarDivisao(int dias, String nivel) {
        if (dias <= 2) {
            return Arrays.asList("full_body", "full_body");
        } else if (dias == 3) {
            if ("iniciante".equalsIgnoreCase(nivel)) {
                return Arrays.asList("full_body_a", "full_body_b", "full_body_c");
            }
            return Arrays.asList("push", "pull", "legs");
        } else if (dias == 4) {
            return Arrays.asList("upper_a", "lower_a", "upper_b", "lower_b");
        } else if (dias == 5) {
            return Arrays.asList("peito_triceps", "costas_biceps", "pernas", "ombros_core", "full_body");
        } else {
            return Arrays.asList("peito", "costas", "pernas_quad", "ombros_bracos", "pernas_post", "full_body");
        }
    }

    private TreinoDia gerarTreinoDia(int numero, String tipo, ParametrosTreino params,
                                      Set<String> restricoes, Set<String> equipamentos, String nivel) {
        List<ExercicioTreino> exercicios = new ArrayList<>();
        List<String> grupos = getGruposPorTipo(tipo);
        
        int ordem = 1;
        for (String grupo : grupos) {
            List<ExercicioBase> disponiveis = exerciciosPorGrupo.get(grupo);
            if (disponiveis == null) continue;
            
            // Filtra e seleciona exercícios
            List<ExercicioBase> filtrados = filtrarExercicios(disponiveis, restricoes, equipamentos, nivel);
            
            // Quantos exercícios por grupo
            int qtd = getQuantidadeExercicios(grupo, tipo);
            
            for (int i = 0; i < Math.min(qtd, filtrados.size()); i++) {
                ExercicioBase ex = filtrados.get(i);
                exercicios.add(new ExercicioTreino(
                    ordem++,
                    ex.nome,
                    grupo,
                    params.series,
                    params.repeticoes,
                    ex.descansoSeg
                ));
            }
        }

        return new TreinoDia(numero, getNomeDia(tipo), tipo, exercicios);
    }

    private List<String> getGruposPorTipo(String tipo) {
        switch (tipo.toLowerCase()) {
            case "push":
                return Arrays.asList("peito", "ombros", "triceps");
            case "pull":
                return Arrays.asList("costas", "biceps", "core");
            case "legs":
            case "pernas":
                return Arrays.asList("quadriceps", "posteriores", "gluteos", "panturrilha");
            case "upper_a":
            case "upper_b":
                return Arrays.asList("peito", "costas", "ombros", "biceps", "triceps");
            case "lower_a":
            case "lower_b":
                return Arrays.asList("quadriceps", "posteriores", "gluteos", "panturrilha", "core");
            case "peito":
            case "peito_triceps":
                return Arrays.asList("peito", "triceps");
            case "costas":
            case "costas_biceps":
                return Arrays.asList("costas", "biceps");
            case "pernas_quad":
                return Arrays.asList("quadriceps", "gluteos", "panturrilha");
            case "pernas_post":
                return Arrays.asList("posteriores", "gluteos", "panturrilha");
            case "ombros_bracos":
            case "ombros_core":
                return Arrays.asList("ombros", "biceps", "triceps", "core");
            default: // full_body
                return Arrays.asList("peito", "costas", "quadriceps", "posteriores", "ombros", "core");
        }
    }

    private int getQuantidadeExercicios(String grupo, String tipoTreino) {
        if (tipoTreino.contains("full_body")) {
            return 1; // Um exercício por grupo em full body
        }
        // Grupos principais pegam mais exercícios
        if (grupo.equals("peito") || grupo.equals("costas") || 
            grupo.equals("quadriceps") || grupo.equals("posteriores")) {
            return 2;
        }
        return 1;
    }

    private List<ExercicioBase> filtrarExercicios(List<ExercicioBase> exercicios, 
                                                   Set<String> restricoes, 
                                                   Set<String> equipamentos,
                                                   String nivel) {
        List<ExercicioBase> resultado = new ArrayList<>();
        
        for (ExercicioBase ex : exercicios) {
            // Verifica restrições
            boolean temRestricao = false;
            for (String r : restricoes) {
                if (verificaRestricao(ex.nome, r)) {
                    temRestricao = true;
                    break;
                }
            }
            if (temRestricao) continue;
            
            // Verifica equipamentos
            if (!equipamentos.isEmpty()) {
                boolean temEquipamento = false;
                for (String eq : ex.equipamentos.split(",")) {
                    if (equipamentos.contains(eq.trim()) || eq.equals("peso_corpo")) {
                        temEquipamento = true;
                        break;
                    }
                }
                if (!temEquipamento) continue;
            }
            
            // Verifica nível
            if (!nivelCompativel(ex.dificuldade, nivel)) continue;
            
            resultado.add(ex);
        }
        
        // Ordena: compostos primeiro, depois por dificuldade
        resultado.sort((a, b) -> {
            int tipoComp = a.tipo.equals("composto") ? -1 : 1;
            int tipoBComp = b.tipo.equals("composto") ? -1 : 1;
            return tipoComp - tipoBComp;
        });
        
        return resultado;
    }

    private boolean verificaRestricao(String exercicio, String restricao) {
        String exLower = exercicio.toLowerCase();
        String restLower = restricao.toLowerCase();
        
        if (restLower.contains("joelho")) {
            return exLower.contains("extensor") || exLower.contains("leg press");
        }
        if (restLower.contains("ombro")) {
            return exLower.contains("desenvolvimento") || exLower.contains("militar");
        }
        if (restLower.contains("lombar") || restLower.contains("coluna")) {
            return exLower.contains("terra") || exLower.contains("stiff") || exLower.contains("good morning");
        }
        return false;
    }

    private boolean nivelCompativel(String dificuldadeExercicio, String nivelAluno) {
        if ("avancado".equalsIgnoreCase(nivelAluno)) return true;
        if ("intermediario".equalsIgnoreCase(nivelAluno)) {
            return !"avancado".equalsIgnoreCase(dificuldadeExercicio);
        }
        return "iniciante".equalsIgnoreCase(dificuldadeExercicio);
    }

    private Set<String> parseRestricoes(String restricoes) {
        Set<String> set = new HashSet<>();
        if (restricoes == null || restricoes.isEmpty()) return set;
        for (String r : restricoes.split("[,;]")) {
            set.add(r.trim().toLowerCase());
        }
        return set;
    }

    private Set<String> parseEquipamentos(String equipamentos) {
        Set<String> set = new HashSet<>();
        if (equipamentos == null || equipamentos.isEmpty()) return set;
        for (String e : equipamentos.split("[,;]")) {
            set.add(e.trim().toLowerCase());
        }
        return set;
    }

    private ParametrosTreino getParametrosPorObjetivo(String objetivo, String nivel) {
        int series, descanso;
        String repeticoes, frequencia;

        switch (objetivo.toLowerCase()) {
            case "hipertrofia":
                series = "iniciante".equalsIgnoreCase(nivel) ? 3 : 4;
                repeticoes = "8-12";
                descanso = 75;
                frequencia = "intermediario".equalsIgnoreCase(nivel) ? "4x/semana" : "3-4x/semana";
                break;
            case "forca":
                series = "avancado".equalsIgnoreCase(nivel) ? 5 : 4;
                repeticoes = "4-6";
                descanso = 180;
                frequencia = "3-4x/semana";
                break;
            case "resistencia":
                series = 3;
                repeticoes = "15-20";
                descanso = 45;
                frequencia = "3-5x/semana";
                break;
            case "perda_peso":
                series = 3;
                repeticoes = "12-15";
                descanso = 45;
                frequencia = "4-5x/semana";
                break;
            default:
                series = 3;
                repeticoes = "10-12";
                descanso = 60;
                frequencia = "3x/semana";
        }

        return new ParametrosTreino(series, repeticoes, descanso, frequencia);
    }

    private String getNomeDia(String tipo) {
        switch (tipo.toLowerCase()) {
            case "push": return "Push (Empurrar)";
            case "pull": return "Pull (Puxar)";
            case "legs": return "Legs (Pernas)";
            case "upper_a": return "Superior A";
            case "upper_b": return "Superior B";
            case "lower_a": return "Inferior A";
            case "lower_b": return "Inferior B";
            case "peito": return "Peito";
            case "peito_triceps": return "Peito e Tríceps";
            case "costas": return "Costas";
            case "costas_biceps": return "Costas e Bíceps";
            case "pernas": return "Pernas Completo";
            case "pernas_quad": return "Pernas - Quadríceps";
            case "pernas_post": return "Pernas - Posteriores";
            case "ombros_bracos": return "Ombros e Braços";
            case "ombros_core": return "Ombros e Core";
            default: return "Full Body";
        }
    }

    private String gerarObservacoes(String objetivo, String nivel, Set<String> restricoes) {
        StringBuilder obs = new StringBuilder();
        
        obs.append("• Aqueça 5-10 min antes de treinar.\n");
        
        if ("iniciante".equalsIgnoreCase(nivel)) {
            obs.append("• Foque na técnica correta antes de aumentar carga.\n");
            obs.append("• Progrida devagar e ouça seu corpo.\n");
        }
        
        if ("hipertrofia".equalsIgnoreCase(objetivo)) {
            obs.append("• Tempo sob tensão: controle a fase excêntrica (2-3s).\n");
            obs.append("• Proteína: 1.6-2.2g por kg de peso corporal.\n");
        }
        
        if (!restricoes.isEmpty()) {
            obs.append("• Atenção às suas restrições: ").append(String.join(", ", restricoes)).append(".\n");
            obs.append("• Interrompa qualquer exercício que cause dor.\n");
        }
        
        obs.append("• Hidrate-se bem durante o treino.");
        
        return obs.toString();
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return s;
        return s.substring(0, 1).toUpperCase() + s.substring(1).toLowerCase();
    }

    // Classes auxiliares
    static class ExercicioBase {
        String nome;
        String tipo; // composto, isolado
        String equipamentos;
        String dificuldade;
        int descansoSeg;

        ExercicioBase(String nome, String tipo, String equipamentos, String dificuldade, int descansoSeg) {
            this.nome = nome;
            this.tipo = tipo;
            this.equipamentos = equipamentos;
            this.dificuldade = dificuldade;
            this.descansoSeg = descansoSeg;
        }
    }

    static class ParametrosTreino {
        int series;
        String repeticoes;
        int descansoSeg;
        String frequencia;

        ParametrosTreino(int series, String repeticoes, int descansoSeg, String frequencia) {
            this.series = series;
            this.repeticoes = repeticoes;
            this.descansoSeg = descansoSeg;
            this.frequencia = frequencia;
        }
    }

    public static class ExercicioTreino {
        public int ordem;
        public String nome;
        public String grupoMuscular;
        public int series;
        public String repeticoes;
        public int descansoSeg;

        public ExercicioTreino(int ordem, String nome, String grupoMuscular, 
                               int series, String repeticoes, int descansoSeg) {
            this.ordem = ordem;
            this.nome = nome;
            this.grupoMuscular = grupoMuscular;
            this.series = series;
            this.repeticoes = repeticoes;
            this.descansoSeg = descansoSeg;
        }

        public String toJSON() {
            return "{" +
                "\"ordem\":" + ordem + "," +
                "\"nome\":\"" + escapeJson(nome) + "\"," +
                "\"grupoMuscular\":\"" + escapeJson(grupoMuscular) + "\"," +
                "\"series\":" + series + "," +
                "\"repeticoes\":\"" + repeticoes + "\"," +
                "\"descansoSeg\":" + descansoSeg +
                "}";
        }

        private static String escapeJson(String s) {
            return s.replace("\\", "\\\\").replace("\"", "\\\"");
        }
    }

    public static class TreinoDia {
        public int numero;
        public String nome;
        public String tipo;
        public List<ExercicioTreino> exercicios;

        public TreinoDia(int numero, String nome, String tipo, List<ExercicioTreino> exercicios) {
            this.numero = numero;
            this.nome = nome;
            this.tipo = tipo;
            this.exercicios = exercicios;
        }

        public String toJSON() {
            StringBuilder sb = new StringBuilder("{");
            sb.append("\"numero\":").append(numero).append(",");
            sb.append("\"nome\":\"").append(escapeJson(nome)).append("\",");
            sb.append("\"tipo\":\"").append(tipo).append("\",");
            sb.append("\"exercicios\":[");
            for (int i = 0; i < exercicios.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(exercicios.get(i).toJSON());
            }
            sb.append("]}");
            return sb.toString();
        }

        private static String escapeJson(String s) {
            return s.replace("\\", "\\\\").replace("\"", "\\\"");
        }
    }

    public static class TreinoGerado {
        public String titulo;
        public String objetivo;
        public String nivel;
        public String frequencia;
        public List<TreinoDia> treinos;
        public String observacoes;

        public TreinoGerado(String titulo, String objetivo, String nivel, String frequencia,
                            List<TreinoDia> treinos, String observacoes) {
            this.titulo = titulo;
            this.objetivo = objetivo;
            this.nivel = nivel;
            this.frequencia = frequencia;
            this.treinos = treinos;
            this.observacoes = observacoes;
        }

        public String toJSON() {
            StringBuilder sb = new StringBuilder("{");
            sb.append("\"titulo\":\"").append(escapeJson(titulo)).append("\",");
            sb.append("\"objetivo\":\"").append(objetivo).append("\",");
            sb.append("\"nivel\":\"").append(nivel).append("\",");
            sb.append("\"frequencia\":\"").append(frequencia).append("\",");
            sb.append("\"treinos\":[");
            for (int i = 0; i < treinos.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append(treinos.get(i).toJSON());
            }
            sb.append("],");
            sb.append("\"observacoes\":\"").append(escapeJson(observacoes)).append("\"");
            sb.append("}");
            return sb.toString();
        }

        private static String escapeJson(String s) {
            return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
        }
    }
}
