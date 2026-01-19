package coach;

import java.util.*;
import java.util.regex.*;
import java.util.concurrent.*;

/**
 * Coach Virtual de Musculação e Treinamento Resistido
 * Processa linguagem natural e responde com base em conhecimento especializado
 * 
 * v2.0 - Melhorias:
 * - NLP avançado com sinônimos e stemming
 * - Integração com serviço ML Python
 * - Scoring de relevância para respostas
 * - Fallback inteligente quando ML está offline
 */
public class CoachIA {

    // Base de conhecimento estruturada
    private final Map<String, List<String>> conhecimento = new HashMap<>();
    private final List<Pattern> padroes = new ArrayList<>();
    private final List<String> topicos = new ArrayList<>();
    
    // Cliente ML para respostas avançadas
    private final MLServiceClient mlClient;
    
    // Threshold de confiança para usar ML
    private static final double ML_THRESHOLD = 0.6;

    public CoachIA() {
        this.mlClient = new MLServiceClient();
        inicializarConhecimento();
        compilarPadroes();
    }
    
    public CoachIA(MLServiceClient mlClient) {
        this.mlClient = mlClient;
        inicializarConhecimento();
        compilarPadroes();
    }

    private void inicializarConhecimento() {
        // HIPERTROFIA
        conhecimento.put("hipertrofia", Arrays.asList(
            "Para hipertrofia, trabalhe na faixa de 8-12 repetições por série.",
            "Priorize exercícios compostos: agachamento, supino, remada, desenvolvimento.",
            "O tempo sob tensão é crucial: execute movimentos controlados (2-3s na excêntrica).",
            "Descanse 60-90 segundos entre séries para otimizar o estímulo metabólico.",
            "Progrida a carga semanalmente (progressive overload) mantendo boa técnica.",
            "Frequência ideal: 2x por semana para cada grupo muscular.",
            "A nutrição é essencial: consuma 1.6-2.2g de proteína por kg de peso corporal."
        ));

        // FORÇA
        conhecimento.put("forca", Arrays.asList(
            "Para desenvolver força máxima, trabalhe na faixa de 1-5 repetições.",
            "Descanse 3-5 minutos entre séries pesadas para recuperação neural completa.",
            "Foque nos movimentos básicos: agachamento, levantamento terra, supino, desenvolvimento.",
            "A velocidade de execução deve ser explosiva na concêntrica.",
            "Periodize o treino alternando semanas de volume e intensidade.",
            "Trabalhe com 85-95% da carga máxima (1RM) para ganhos de força."
        ));

        // EXERCÍCIOS ESPECÍFICOS
        conhecimento.put("agachamento", Arrays.asList(
            "O agachamento é o rei dos exercícios para membros inferiores.",
            "Mantenha os pés na largura dos ombros, pontas levemente para fora.",
            "Desça até pelo menos paralelo (coxas paralelas ao solo) mantendo o core ativado.",
            "Joelhos devem acompanhar a direção dos pés, nunca para dentro.",
            "Olhe para frente, peito alto, coluna neutra durante todo o movimento.",
            "Para iniciantes: comece com peso corporal ou barra vazia até dominar a técnica."
        ));

        conhecimento.put("supino", Arrays.asList(
            "O supino é fundamental para desenvolvimento do peitoral, tríceps e deltoides anterior.",
            "Mantenha escápulas retraídas e deprimidas durante todo o movimento.",
            "Desça a barra até tocar levemente o peito (região do esterno).",
            "Pegada deve ser ligeiramente mais larga que a largura dos ombros.",
            "Empurre a barra em linha reta, travando os cotovelos no topo.",
            "Pés firmes no chão, glúteos e costas em contato com o banco."
        ));

        conhecimento.put("remada", Arrays.asList(
            "A remada é essencial para desenvolver costas largas e postura correta.",
            "Variações: remada curvada, remada unilateral, remada cavalinho, remada T.",
            "Foque em puxar com os cotovelos, não com os braços.",
            "Contraia as escápulas no final do movimento para ativação máxima.",
            "Mantenha a coluna neutra e core ativado para proteger a lombar.",
            "Para remada curvada: inclinação do tronco de 45-60 graus."
        ));

        conhecimento.put("levantamento_terra", Arrays.asList(
            "O levantamento terra trabalha praticamente todo o corpo: posteriores, glúteos, core, costas.",
            "Posicione os pés na largura dos quadris, barra sobre o meio dos pés.",
            "Agarre a barra com pegada mista ou overhand na largura dos ombros.",
            "Mantenha a coluna neutra - NÃO arredonde as costas em hipótese alguma.",
            "Empurre o chão com os pés enquanto mantém a barra próxima ao corpo.",
            "Trave os quadris e glúteos no topo do movimento."
        ));

        // GRUPOS MUSCULARES
        conhecimento.put("peito", Arrays.asList(
            "Para peitoral: supino reto, inclinado e declinado + crucifixo/fly.",
            "Variação de ângulos é importante para desenvolvimento completo.",
            "Frequência: 2x/semana com 10-20 séries semanais totais.",
            "Exercícios compostos (supino) devem vir antes dos isoladores (crucifixo)."
        ));

        conhecimento.put("costas", Arrays.asList(
            "Para costas: remadas (horizontal) + puxadas (vertical).",
            "Largura: puxada aberta; Espessura: remadas com pegada fechada.",
            "Inclua levantamento terra ou suas variações para cadeia posterior.",
            "10-20 séries semanais distribuídas em 2-3 treinos."
        ));

        conhecimento.put("pernas", Arrays.asList(
            "Quadríceps: agachamento, leg press, extensora.",
            "Posteriores: stiff, mesa flexora, levantamento terra romeno.",
            "Glúteos: hip thrust, agachamento profundo, passada.",
            "Panturrilhas: elevação em pé e sentado (diferentes partes do músculo).",
            "Pernas toleram maior volume: 15-25 séries semanais."
        ));

        conhecimento.put("ombros", Arrays.asList(
            "Desenvolvimento/militar para deltoides anterior e medial.",
            "Elevação lateral para ênfase no deltoide medial (forma de 'V').",
            "Face pull ou crucifixo inverso para deltoide posterior.",
            "Cuidado com overtraining: ombros trabalham em supino e remadas."
        ));

        conhecimento.put("bracos", Arrays.asList(
            "Bíceps: rosca direta, rosca alternada, rosca concentrada.",
            "Tríceps: tríceps testa, corda, mergulho, supino fechado.",
            "Braços já trabalham como sinergistas em compostos.",
            "6-12 séries semanais por grupo geralmente são suficientes."
        ));

        // DESCANSO E RECUPERAÇÃO
        conhecimento.put("descanso", Arrays.asList(
            "Músculos crescem durante o descanso, não durante o treino.",
            "Mínimo 48 horas entre treinos do mesmo grupo muscular.",
            "Sono de qualidade (7-9 horas) é essencial para recuperação.",
            "Sintomas de overtraining: fadiga persistente, queda de performance, irritabilidade.",
            "Semanas de deload (redução de volume/intensidade) a cada 4-6 semanas."
        ));

        // FREQUÊNCIA E DIVISÃO
        conhecimento.put("frequencia", Arrays.asList(
            "Iniciantes: Full body 3x/semana.",
            "Intermediários: Upper/Lower 4x/semana ou Push/Pull/Legs.",
            "Avançados: Push/Pull/Legs 6x/semana ou divisões específicas.",
            "Maior frequência = menor volume por sessão = melhor recuperação."
        ));

        conhecimento.put("divisao", Arrays.asList(
            "ABC: Peito/Tríceps, Costas/Bíceps, Pernas/Ombros.",
            "Push/Pull/Legs: Empurrar(peito/ombro/tríceps), Puxar(costas/bíceps), Pernas.",
            "Upper/Lower: Parte superior / Parte inferior.",
            "Full Body: Corpo todo em cada sessão - ótimo para iniciantes.",
            "A melhor divisão é aquela que você consegue manter consistentemente."
        ));

        // RPE E INTENSIDADE
        conhecimento.put("rpe", Arrays.asList(
            "RPE (Rating of Perceived Exertion) mede o esforço de 1-10.",
            "RPE 7: Poderia fazer mais 3 repetições.",
            "RPE 8: Poderia fazer mais 2 repetições.",
            "RPE 9: Poderia fazer mais 1 repetição.",
            "RPE 10: Falha muscular - máximo esforço.",
            "Para hipertrofia, trabalhe geralmente entre RPE 7-9.",
            "Deixe RPE 10 para séries específicas ou testes de força."
        ));

        // NUTRIÇÃO
        conhecimento.put("nutricao", Arrays.asList(
            "Proteína: 1.6-2.2g por kg de peso corporal para ganho muscular.",
            "Distribua proteína em 4-6 refeições ao longo do dia (20-40g por refeição).",
            "Para ganhar massa: superávit calórico de 300-500 kcal.",
            "Para perder gordura: déficit de 300-500 kcal mantendo proteína alta.",
            "Carboidratos são importantes para performance e recuperação.",
            "Hidratação: 35-40ml de água por kg de peso corporal."
        ));

        // LESÕES E RESTRIÇÕES
        conhecimento.put("lesao", Arrays.asList(
            "Em caso de dor aguda, pare imediatamente e procure um profissional.",
            "Dor muscular tardia (DOMS) é normal; dor articular NÃO é.",
            "Aquecimento específico reduz risco de lesões.",
            "Respeite a amplitude de movimento sem forçar articulações.",
            "Lesões anteriores requerem adaptações nos exercícios."
        ));

        conhecimento.put("joelho", Arrays.asList(
            "Para joelhos sensíveis: evite extensora com carga pesada.",
            "Prefira leg press com amplitude controlada.",
            "Agachamento com técnica correta geralmente é seguro.",
            "Fortaleça quadríceps e posteriores equilibradamente.",
            "Evite movimentos balísticos ou impacto excessivo."
        ));

        conhecimento.put("ombro", Arrays.asList(
            "Para ombros sensíveis: evite desenvolvimento atrás da nuca.",
            "Limite amplitude no supino se houver desconforto.",
            "Fortaleça manguito rotador com exercícios específicos.",
            "Face pulls e rotação externa são preventivos.",
            "Evite elevações laterais acima de 90 graus se houver impingement."
        ));

        conhecimento.put("lombar", Arrays.asList(
            "Fortaleça o core: prancha, dead bug, bird dog.",
            "Mantenha coluna neutra em TODOS os exercícios.",
            "Evite movimentos de torção com carga.",
            "Hip hinge (stiff, terra) com técnica perfeita fortalece a região.",
            "Alongue flexores de quadril que podem afetar a lombar."
        ));
    }

    private void compilarPadroes() {
        // Padrões para detecção de intenção
        addPadrao("hipertrofia|ganhar massa|ganho muscular|crescer|volume muscular", "hipertrofia");
        addPadrao("for[cç]a|forte|mais forte|carga m[aá]xima|1rm|pr", "forca");
        addPadrao("agachamento|agachar|squat", "agachamento");
        addPadrao("supino|bench|peito press", "supino");
        addPadrao("remada|row|puxar|puxada horizontal", "remada");
        addPadrao("terra|deadlift|levantamento", "levantamento_terra");
        addPadrao("peitoral|peito|peck|pec", "peito");
        addPadrao("costas|dorsal|lat|lats", "costas");
        addPadrao("perna|quadr[ií]ceps|posterior|gl[úu]teo|panturrilha|coxa", "pernas");
        addPadrao("ombro|delt[oó]ide|desenvolvimento|militar", "ombros");
        addPadrao("bra[cç]o|b[ií]ceps|tr[ií]ceps|curl|rosca", "bracos");
        addPadrao("descans|recupera|sono|over.?training|deload", "descanso");
        addPadrao("frequ[eê]ncia|quantas vezes|dias.?semana|vezes.?semana", "frequencia");
        addPadrao("divis[aã]o|split|abc|push.?pull|upper.?lower|full.?body", "divisao");
        addPadrao("rpe|intensidade|esfor[cç]o|falha", "rpe");
        addPadrao("prote[ií]na|caloria|nutri|alimenta|dieta|comer", "nutricao");
        addPadrao("les[aã]o|dor|machuc|cuidado", "lesao");
        addPadrao("joelho", "joelho");
        addPadrao("ombro.*(les|dor|cuidado)|les.*ombro", "ombro");
        addPadrao("lombar|coluna|costas.*(dor|les)", "lombar");
    }

    private void addPadrao(String regex, String topico) {
        padroes.add(Pattern.compile(regex, Pattern.CASE_INSENSITIVE | Pattern.UNICODE_CASE));
        topicos.add(topico);
    }

    /**
     * Processa uma pergunta e gera resposta contextualizada
     * Usa NLP avançado e integração com ML quando apropriado
     */
    public Resposta responder(String pergunta, Contexto ctx) {
        String perguntaNorm = NLPProcessor.normalizar(pergunta);
        Set<String> termosExpandidos = NLPProcessor.expandirConsulta(pergunta);
        Set<String> topicosDetectados = new LinkedHashSet<>();
        
        // Detecta intenção da pergunta
        String intencao = NLPProcessor.detectarIntencao(pergunta);
        
        // Extrai entidades (exercícios, grupos musculares, objetivos)
        Map<String, List<String>> entidades = NLPProcessor.extrairEntidades(pergunta);

        // Detecta tópicos usando padrões regex tradicionais
        for (int i = 0; i < padroes.size(); i++) {
            if (padroes.get(i).matcher(perguntaNorm).find()) {
                topicosDetectados.add(topicos.get(i));
            }
        }
        
        // Também detecta usando termos expandidos (sinônimos)
        for (String termo : termosExpandidos) {
            for (int i = 0; i < padroes.size(); i++) {
                if (padroes.get(i).matcher(termo).find()) {
                    topicosDetectados.add(topicos.get(i));
                }
            }
        }
        
        // Adiciona tópicos baseados em entidades detectadas
        if (entidades.containsKey("exercicios")) {
            for (String ex : entidades.get("exercicios")) {
                topicosDetectados.add(ex);
            }
        }
        if (entidades.containsKey("grupos_musculares")) {
            for (String grupo : entidades.get("grupos_musculares")) {
                if (conhecimento.containsKey(grupo)) {
                    topicosDetectados.add(grupo);
                }
            }
        }

        // Adiciona contexto do aluno se relevante
        if (ctx.objetivo != null && !ctx.objetivo.isEmpty()) {
            if (ctx.objetivo.equalsIgnoreCase("hipertrofia")) topicosDetectados.add("hipertrofia");
            else if (ctx.objetivo.equalsIgnoreCase("forca")) topicosDetectados.add("forca");
        }

        // Verifica restrições
        if (ctx.restricoes != null && !ctx.restricoes.isEmpty()) {
            String rest = ctx.restricoes.toLowerCase();
            if (rest.contains("joelho")) topicosDetectados.add("joelho");
            if (rest.contains("ombro")) topicosDetectados.add("ombro");
            if (rest.contains("lombar") || rest.contains("coluna")) topicosDetectados.add("lombar");
        }

        // Calcula confiança da resposta local
        double confiancaLocal = calcularConfianca(topicosDetectados.size());
        
        // Se confiança baixa e ML disponível, consulta serviço externo
        StringBuilder resposta = new StringBuilder();
        String mlAnswer = null;
        
        if (confiancaLocal < ML_THRESHOLD && mlClient.isServiceOnline()) {
            try {
                var mlFuture = mlClient.consultarCoach(pergunta, ctx.nome, ctx.objetivo, ctx.nivel);
                var mlResponse = mlFuture.get(3, java.util.concurrent.TimeUnit.SECONDS);
                if (mlResponse.success && mlResponse.answer != null) {
                    mlAnswer = mlResponse.answer;
                }
            } catch (Exception e) {
                // Fallback para resposta local
            }
        }

        List<String> referencias = new ArrayList<>();

        // Saudação personalizada
        if (ctx.nome != null && !ctx.nome.isEmpty()) {
            resposta.append("Olá, ").append(ctx.nome).append("! ");
        }

        // Se temos resposta do ML, combina com conhecimento local
        if (mlAnswer != null && !mlAnswer.isEmpty()) {
            resposta.append(mlAnswer.replace("[Coach]", "").trim());
            resposta.append("\n\n📚 Complementando com dicas específicas:\n");
        }

        // Adiciona informações relevantes do conhecimento local
        if (topicosDetectados.isEmpty()) {
            resposta.append(gerarRespostaGenerica(perguntaNorm, ctx));
        } else {
            boolean primeiro = mlAnswer == null;
            for (String topico : topicosDetectados) {
                List<String> info = conhecimento.get(topico);
                if (info != null && !info.isEmpty()) {
                    if (!primeiro) resposta.append("\n");
                    primeiro = false;
                    
                    // Usa NLP para selecionar itens mais relevantes
                    List<ScoredItem> scored = new ArrayList<>();
                    for (String item : info) {
                        double score = NLPProcessor.calcularRelevancia(pergunta, item);
                        scored.add(new ScoredItem(item, score));
                    }
                    scored.sort((a, b) -> Double.compare(b.score, a.score));
                    
                    // Pega os 3 mais relevantes
                    int count = 0;
                    for (ScoredItem si : scored) {
                        if (count >= 3) break;
                        resposta.append("• ").append(si.text).append("\n");
                        count++;
                    }
                    referencias.add(topico);
                }
            }
        }

        // Adiciona dicas baseadas no nível
        if (ctx.nivel != null) {
            resposta.append("\n").append(dicaPorNivel(ctx.nivel));
        }
        
        // Adiciona sugestão baseada na intenção
        resposta.append(sugestaoPorIntencao(intencao, topicosDetectados));

        // Ajusta confiança se usou ML
        double confiancaFinal = mlAnswer != null ? Math.max(confiancaLocal, 0.85) : confiancaLocal;

        return new Resposta(
            resposta.toString().trim(),
            referencias,
            ctx.nivel,
            confiancaFinal
        );
    }
    
    // Classe auxiliar para scoring
    private static class ScoredItem {
        String text;
        double score;
        ScoredItem(String text, double score) {
            this.text = text;
            this.score = score;
        }
    }
    
    private String sugestaoPorIntencao(String intencao, Set<String> topicos) {
        switch (intencao) {
            case "tecnica":
                return "\n\n🎯 Quer que eu detalhe a técnica de algum exercício específico?";
            case "quantidade":
                return "\n\n📊 Posso ajustar as quantidades para seu nível e objetivo!";
            case "lesao":
                return "\n\n⚠️ Lembre-se: em caso de dor persistente, consulte um profissional de saúde.";
            case "comparacao":
                return "\n\n🔄 Cada exercício tem suas vantagens - posso explicar mais se quiser!";
            default:
                return "";
        }
    }

    private String gerarRespostaGenerica(String pergunta, Contexto ctx) {
        if (pergunta.contains("comec") || pergunta.contains("inici")) {
            return "Para começar na musculação:\n" +
                   "• Aprenda a técnica correta dos exercícios básicos.\n" +
                   "• Comece com cargas leves e progrida gradualmente.\n" +
                   "• Treine 3x por semana com treino full body.\n" +
                   "• Descanse e alimente-se adequadamente.";
        }
        if (pergunta.contains("melhor") && pergunta.contains("exerc")) {
            return "Os melhores exercícios são os compostos:\n" +
                   "• Agachamento (pernas e core)\n" +
                   "• Supino (peito, ombros, tríceps)\n" +
                   "• Remada (costas e bíceps)\n" +
                   "• Desenvolvimento (ombros)\n" +
                   "• Levantamento terra (cadeia posterior)";
        }
        return "Posso ajudar com dúvidas sobre:\n" +
               "• Técnica de exercícios (agachamento, supino, remada, etc.)\n" +
               "• Hipertrofia e ganho de força\n" +
               "• Divisão de treino e frequência\n" +
               "• Nutrição para resultados\n" +
               "• Prevenção de lesões\n\n" +
               "Faça uma pergunta específica para que eu possa ajudar melhor!";
    }

    private String dicaPorNivel(String nivel) {
        switch (nivel.toLowerCase()) {
            case "iniciante":
                return "💡 Dica para iniciante: Foque na técnica antes de aumentar a carga!";
            case "intermediario":
                return "💡 Dica para intermediário: Experimente técnicas avançadas como drop sets e supersets.";
            case "avancado":
                return "💡 Dica para avançado: Periodização é fundamental para continuar progredindo.";
            default:
                return "";
        }
    }

    private double calcularConfianca(int topicosEncontrados) {
        if (topicosEncontrados == 0) return 0.5;
        if (topicosEncontrados == 1) return 0.8;
        return Math.min(0.95, 0.7 + topicosEncontrados * 0.1);
    }

    // Classes auxiliares
    public static class Contexto {
        public String nome;
        public String objetivo;
        public String nivel;
        public String restricoes;

        public Contexto(String nome, String objetivo, String nivel, String restricoes) {
            this.nome = nome;
            this.objetivo = objetivo;
            this.nivel = nivel;
            this.restricoes = restricoes;
        }
    }

    public static class Resposta {
        public String texto;
        public List<String> topicos;
        public String nivelAluno;
        public double confianca;

        public Resposta(String texto, List<String> topicos, String nivelAluno, double confianca) {
            this.texto = texto;
            this.topicos = topicos;
            this.nivelAluno = nivelAluno;
            this.confianca = confianca;
        }

        public String toJSON() {
            StringBuilder sb = new StringBuilder("{");
            sb.append("\"texto\":\"").append(escapeJson(texto)).append("\",");
            sb.append("\"topicos\":[");
            for (int i = 0; i < topicos.size(); i++) {
                if (i > 0) sb.append(',');
                sb.append("\"").append(topicos.get(i)).append("\"");
            }
            sb.append("],");
            sb.append("\"nivelAluno\":").append(nivelAluno == null || nivelAluno.isEmpty() ? "null" : "\"" + nivelAluno + "\"").append(",");
            // Usa Locale.US para garantir ponto decimal
            sb.append("\"confianca\":").append(String.format(java.util.Locale.US, "%.2f", confianca));
            sb.append("}");
            return sb.toString();
        }

        private static String escapeJson(String s) {
            if (s == null) return "";
            return s.replace("\\", "\\\\")
                    .replace("\"", "\\\"")
                    .replace("\n", "\\n")
                    .replace("\r", "\\r")
                    .replace("\t", "\\t");
        }
    }
}
