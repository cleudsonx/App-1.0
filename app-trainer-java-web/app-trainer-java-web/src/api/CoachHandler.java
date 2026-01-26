package api;

import com.sun.net.httpserver.HttpExchange;
import coach.CoachIA;
import storage.Storage;

import java.io.IOException;
import java.util.Map;

/**
 * Handler para o Coach Virtual de Musculação
 * Processa linguagem natural para dúvidas sobre treino
 */
public class CoachHandler extends BaseHandler {
    private final Storage storage;
    private final CoachIA coach;

    public CoachHandler(Storage storage) {
        this.storage = storage;
        this.coach = new CoachIA();
    }

    @Override
    protected void processRequest(HttpExchange ex) throws IOException {
        if (!validateMethod(ex, "GET", "POST")) return;

        Map<String, String> params;
        if ("POST".equalsIgnoreCase(ex.getRequestMethod())) {
            String contentType = ex.getRequestHeaders().getFirst("Content-Type");
            if (contentType != null && contentType.contains("application/json")) {
                params = parseJsonBody(readBody(ex));
            } else {
                params = parseQuery(readBody(ex));
            }
        } else {
            params = parseQuery(ex.getRequestURI().getQuery());
        }

        String pergunta = params.getOrDefault("q", params.getOrDefault("pergunta", "")).trim();
        if (pergunta.isEmpty()) {
            sendError(ex, 400, "Pergunta é obrigatória (parâmetro 'q' ou 'pergunta')");
            return;
        }

        // Contexto do aluno (opcional)
        String nome = params.getOrDefault("nome", "");
        String objetivo = params.getOrDefault("objetivo", "");
        String nivel = params.getOrDefault("nivel", "");
        String restricoes = params.getOrDefault("restricoes", "");
        int alunoId = parseIntSafe(params.get("alunoId"), -1);

        // Se tem alunoId, busca dados completos
        if (alunoId > 0) {
            try {
                var aluno = storage.getAlunoById(alunoId);
                if (aluno != null) {
                    nome = aluno.nome;
                    objetivo = aluno.objetivo;
                    nivel = aluno.nivel;
                    restricoes = aluno.restricoes;
                }
            } catch (Exception e) {
                // Loga e ignora, segue com os parâmetros default
                if (storage instanceof log.AppLogger logger) {
                    logger.warn("Erro ao buscar aluno por ID: " + alunoId + ": " + e.getMessage(), "CoachHandler");
                }
            }
        }

        // Gera resposta do Coach
        CoachIA.Contexto ctx = new CoachIA.Contexto(nome, objetivo, nivel, restricoes);
        CoachIA.Resposta resposta = coach.responder(pergunta, ctx);

        sendJson(ex, 200, resposta.toJSON());
        
    }
}
