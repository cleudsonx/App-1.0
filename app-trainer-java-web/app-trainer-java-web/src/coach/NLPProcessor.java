package coach;

import java.util.*;
import java.util.regex.*;

/**
 * Processador de Linguagem Natural para português
 * Implementa: sinônimos, stemming básico, normalização e scoring
 */
public class NLPProcessor {

    // Mapa de sinônimos para expansão de consulta
    private static final Map<String, Set<String>> SINONIMOS = new HashMap<>();
    
    // Sufixos para stemming português
    private static final String[] SUFIXOS = {
        "mente", "ação", "ções", "ando", "endo", "indo",
        "ado", "ido", "ada", "ida", "ados", "idos", "adas", "idas",
        "ar", "er", "ir", "or", "ores", "ções",
        "eiro", "eira", "eiros", "eiras",
        "ista", "istas", "ismo", "ismos",
        "oso", "osa", "osos", "osas",
        "ável", "ível", "veis",
        "ção", "ções", "mento", "mentos"
    };
    
    // Stopwords portuguesas
    private static final Set<String> STOPWORDS = Set.of(
        "o", "a", "os", "as", "um", "uma", "uns", "umas",
        "de", "da", "do", "das", "dos", "em", "na", "no", "nas", "nos",
        "por", "para", "com", "sem", "que", "qual", "quais",
        "e", "ou", "mas", "se", "como", "quando", "onde",
        "é", "são", "ser", "ter", "fazer", "está", "estão",
        "eu", "tu", "ele", "ela", "nós", "eles", "elas", "você",
        "meu", "minha", "seu", "sua", "isso", "isto", "aquilo",
        "mais", "menos", "muito", "pouco", "bem", "mal",
        "já", "ainda", "também", "só", "apenas", "mesmo"
    );

    static {
        inicializarSinonimos();
    }

    private static void inicializarSinonimos() {
        // Exercícios
        addSinonimos("agachamento", "squat", "agachar", "agachando");
        addSinonimos("supino", "bench", "bench press", "press", "peito");
        addSinonimos("remada", "row", "rowing", "puxada", "puxar");
        addSinonimos("levantamento terra", "terra", "deadlift", "levantamento");
        addSinonimos("desenvolvimento", "militar", "shoulder press", "overhead");
        addSinonimos("rosca", "curl", "biceps curl", "rosca direta");
        addSinonimos("triceps", "francês", "testa", "triceps testa", "pushdown");
        addSinonimos("leg press", "prensa", "prensa de pernas");
        addSinonimos("extensora", "cadeira extensora", "leg extension");
        addSinonimos("flexora", "mesa flexora", "leg curl");
        addSinonimos("elevação lateral", "lateral raise", "abdução ombro");
        addSinonimos("crucifixo", "fly", "flye", "peck deck");
        
        // Objetivos
        addSinonimos("hipertrofia", "massa", "muscular", "crescer", "ganhar massa", "volume");
        addSinonimos("força", "forte", "potência", "carga máxima", "pesado");
        addSinonimos("emagrecer", "perder peso", "perda de peso", "secar", "definir", "definição");
        addSinonimos("resistência", "condicionamento", "cardio", "endurance", "aeróbico");
        
        // Grupos musculares
        addSinonimos("peito", "peitoral", "pectorais", "pecs");
        addSinonimos("costas", "dorsal", "dorsais", "lats", "latíssimo");
        addSinonimos("ombro", "deltóide", "deltoide", "ombros", "deltoides");
        addSinonimos("braço", "braços", "bíceps", "tríceps", "antebraço");
        addSinonimos("perna", "pernas", "quadríceps", "posterior", "coxa");
        addSinonimos("glúteo", "glúteos", "bumbum", "posterior");
        addSinonimos("abdômen", "abdominal", "barriga", "core", "abs");
        addSinonimos("panturrilha", "panturrilhas", "gêmeos", "sóleo");
        
        // Conceitos de treino
        addSinonimos("séries", "sets", "série");
        addSinonimos("repetições", "reps", "repetição");
        addSinonimos("descanso", "intervalo", "pausa", "recuperação");
        addSinonimos("aquecimento", "warmup", "aquecer");
        addSinonimos("alongamento", "stretching", "alongar", "flexibilidade");
        addSinonimos("técnica", "execução", "forma", "movimento");
        addSinonimos("progressão", "progressive overload", "aumentar carga", "progredir");
        
        // Divisões de treino
        addSinonimos("abc", "divisão abc", "split abc");
        addSinonimos("push pull legs", "ppl", "empurrar puxar pernas");
        addSinonimos("upper lower", "superior inferior", "parte superior inferior");
        addSinonimos("full body", "corpo todo", "fullbody", "treino completo");
        
        // Nutrição
        addSinonimos("proteína", "proteínas", "whey", "caseína");
        addSinonimos("carboidrato", "carbo", "carboidratos", "carbs");
        addSinonimos("caloria", "calorias", "kcal", "energia");
        addSinonimos("suplemento", "suplementos", "suplementação");
        
        // Lesões
        addSinonimos("lesão", "machucado", "dor", "doendo", "lesionado");
        addSinonimos("lombar", "coluna", "costas baixas", "lower back");
    }

    private static void addSinonimos(String... palavras) {
        Set<String> grupo = new HashSet<>(Arrays.asList(palavras));
        for (String p : palavras) {
            SINONIMOS.computeIfAbsent(p.toLowerCase(), k -> new HashSet<>()).addAll(grupo);
        }
    }

    /**
     * Normaliza texto: lowercase, remove acentos, caracteres especiais
     */
    public static String normalizar(String texto) {
        if (texto == null) return "";
        String s = texto.toLowerCase().trim();
        // Remove acentos
        s = s.replaceAll("[áàâã]", "a")
             .replaceAll("[éèê]", "e")
             .replaceAll("[íì]", "i")
             .replaceAll("[óòôõ]", "o")
             .replaceAll("[úù]", "u")
             .replaceAll("[ç]", "c");
        // Remove pontuação
        s = s.replaceAll("[^a-z0-9\\s]", " ");
        // Remove espaços múltiplos
        s = s.replaceAll("\\s+", " ").trim();
        return s;
    }

    /**
     * Aplica stemming básico para português
     */
    public static String stem(String palavra) {
        if (palavra == null || palavra.length() < 4) return palavra;
        String s = palavra.toLowerCase();
        for (String sufixo : SUFIXOS) {
            if (s.endsWith(sufixo) && s.length() - sufixo.length() >= 3) {
                return s.substring(0, s.length() - sufixo.length());
            }
        }
        return s;
    }

    /**
     * Tokeniza texto removendo stopwords
     */
    public static List<String> tokenizar(String texto) {
        List<String> tokens = new ArrayList<>();
        String normalizado = normalizar(texto);
        for (String palavra : normalizado.split("\\s+")) {
            if (palavra.length() > 2 && !STOPWORDS.contains(palavra)) {
                tokens.add(palavra);
            }
        }
        return tokens;
    }

    /**
     * Expande consulta com sinônimos
     */
    public static Set<String> expandirConsulta(String texto) {
        Set<String> termos = new HashSet<>();
        List<String> tokens = tokenizar(texto);
        
        for (String token : tokens) {
            termos.add(token);
            termos.add(stem(token));
            
            // Adiciona sinônimos
            Set<String> sins = SINONIMOS.get(token);
            if (sins != null) {
                for (String s : sins) {
                    termos.add(normalizar(s));
                }
            }
        }
        return termos;
    }

    /**
     * Calcula similaridade entre duas strings usando distância de Levenshtein normalizada
     */
    public static double similaridade(String a, String b) {
        if (a == null || b == null) return 0;
        String s1 = normalizar(a);
        String s2 = normalizar(b);
        if (s1.equals(s2)) return 1.0;
        if (s1.isEmpty() || s2.isEmpty()) return 0;
        
        int distancia = levenshtein(s1, s2);
        int maxLen = Math.max(s1.length(), s2.length());
        return 1.0 - (double) distancia / maxLen;
    }

    private static int levenshtein(String a, String b) {
        int[][] dp = new int[a.length() + 1][b.length() + 1];
        for (int i = 0; i <= a.length(); i++) dp[i][0] = i;
        for (int j = 0; j <= b.length(); j++) dp[0][j] = j;
        
        for (int i = 1; i <= a.length(); i++) {
            for (int j = 1; j <= b.length(); j++) {
                int cost = a.charAt(i-1) == b.charAt(j-1) ? 0 : 1;
                dp[i][j] = Math.min(
                    Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1),
                    dp[i-1][j-1] + cost
                );
            }
        }
        return dp[a.length()][b.length()];
    }

    /**
     * Calcula score de relevância entre consulta e texto
     */
    public static double calcularRelevancia(String consulta, String texto) {
        Set<String> termosConsulta = expandirConsulta(consulta);
        Set<String> termosTexto = expandirConsulta(texto);
        
        // Interseção
        Set<String> comum = new HashSet<>(termosConsulta);
        comum.retainAll(termosTexto);
        
        if (termosConsulta.isEmpty()) return 0;
        
        // Jaccard + boost para matches exatos
        double jaccard = (double) comum.size() / (termosConsulta.size() + termosTexto.size() - comum.size());
        
        // Boost se termo aparece diretamente
        double boost = 0;
        String textoNorm = normalizar(texto);
        for (String termo : tokenizar(consulta)) {
            if (textoNorm.contains(termo)) {
                boost += 0.1;
            }
        }
        
        return Math.min(1.0, jaccard + boost);
    }

    /**
     * Extrai entidades nomeadas simples (exercícios, grupos musculares)
     */
    public static Map<String, List<String>> extrairEntidades(String texto) {
        Map<String, List<String>> entidades = new HashMap<>();
        String norm = normalizar(texto);
        
        // Exercícios
        List<String> exercicios = new ArrayList<>();
        if (norm.contains("agacha") || norm.contains("squat")) exercicios.add("agachamento");
        if (norm.contains("supino") || norm.contains("bench")) exercicios.add("supino");
        if (norm.contains("remada") || norm.contains("row")) exercicios.add("remada");
        if (norm.contains("terra") || norm.contains("deadlift")) exercicios.add("levantamento_terra");
        if (norm.contains("rosca") || norm.contains("curl")) exercicios.add("rosca");
        if (norm.contains("triceps") || norm.contains("frances")) exercicios.add("triceps");
        if (norm.contains("leg press") || norm.contains("prensa")) exercicios.add("leg_press");
        if (norm.contains("desenvolvimento") || norm.contains("militar")) exercicios.add("desenvolvimento");
        if (!exercicios.isEmpty()) entidades.put("exercicios", exercicios);
        
        // Grupos musculares
        List<String> grupos = new ArrayList<>();
        if (norm.contains("peito") || norm.contains("peitoral")) grupos.add("peito");
        if (norm.contains("costa") || norm.contains("dorsal")) grupos.add("costas");
        if (norm.contains("ombro") || norm.contains("deltoid")) grupos.add("ombros");
        if (norm.contains("biceps") || norm.contains("braco")) grupos.add("biceps");
        if (norm.contains("triceps")) grupos.add("triceps");
        if (norm.contains("perna") || norm.contains("quadri") || norm.contains("coxa")) grupos.add("pernas");
        if (norm.contains("gluteo") || norm.contains("bumbum")) grupos.add("gluteos");
        if (norm.contains("abdom") || norm.contains("core") || norm.contains("barriga")) grupos.add("abdomen");
        if (!grupos.isEmpty()) entidades.put("grupos_musculares", grupos);
        
        // Objetivos
        List<String> objetivos = new ArrayList<>();
        if (norm.contains("hipertrofia") || norm.contains("massa") || norm.contains("crescer")) objetivos.add("hipertrofia");
        if (norm.contains("forca") || norm.contains("forte") || norm.contains("pesado")) objetivos.add("forca");
        if (norm.contains("emagrecer") || norm.contains("secar") || norm.contains("definir")) objetivos.add("perda_peso");
        if (norm.contains("resistencia") || norm.contains("cardio")) objetivos.add("resistencia");
        if (!objetivos.isEmpty()) entidades.put("objetivos", objetivos);
        
        return entidades;
    }

    /**
     * Detecta intenção da pergunta
     */
    public static String detectarIntencao(String texto) {
        String norm = normalizar(texto);
        
        if (norm.matches(".*(como|qual|quais|tecnica|execu|forma).*fazer.*") ||
            norm.matches(".*(fazer|executar|realizar).*correto.*")) {
            return "tecnica";
        }
        if (norm.matches(".*(quanto|quantas|quantos).*")) {
            return "quantidade";
        }
        if (norm.matches(".*(melhor|ideal|recomend|indicado).*")) {
            return "recomendacao";
        }
        if (norm.matches(".*(por que|porque|motivo|razao).*")) {
            return "explicacao";
        }
        if (norm.matches(".*(devo|posso|pode|consigo).*")) {
            return "permissao";
        }
        if (norm.matches(".*(diferenca|versus|vs|comparar).*")) {
            return "comparacao";
        }
        if (norm.matches(".*(dor|lesao|machuc|problema).*")) {
            return "lesao";
        }
        return "geral";
    }
}
