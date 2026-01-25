package api;

import com.sun.net.httpserver.HttpExchange;
import coach.GeradorTreino;
import storage.Storage;

import java.io.IOException;
import java.util.Map;

/**
 * Handler para geração de sugestões de treino
 */
public class SugestaoHandler extends BaseHandler {
    private final Storage storage;
    private final GeradorTreino gerador;

    public SugestaoHandler(Storage storage) {
        this.storage = storage;
        this.gerador = new GeradorTreino();
    }

    @Override
    protected void processRequest(HttpExchange ex) throws IOException {
        if (!validateMethod(ex, "GET", "POST")) return;

        Map<String, String> params = parseQuery(ex.getRequestURI().getQuery());
        if (params.isEmpty() && "POST".equalsIgnoreCase(ex.getRequestMethod())) {
            String contentType = ex.getRequestHeaders().getFirst("Content-Type");
            if (contentType != null && contentType.contains("application/json")) {
                params = parseJsonBody(readBody(ex));
            } else {
                params = parseQuery(readBody(ex));
            }
        }

        String objetivo = params.getOrDefault("objetivo", "hipertrofia");
        String nivel = params.getOrDefault("nivel", "iniciante");
        String restricoes = params.getOrDefault("restricoes", "");
        String equipamentos = params.getOrDefault("equipamentos", "");
        int diasSemana = parseIntSafe(params.get("diasSemana"), 3);

        // Se tem alunoId, usa dados do aluno
        int alunoId = parseIntSafe(params.get("alunoId"), -1);
        if (alunoId > 0) {
            var aluno = storage.getAlunoById(alunoId);
            if (aluno != null) {
                objetivo = aluno.objetivo;
                nivel = aluno.nivel;
                restricoes = aluno.restricoes;
                equipamentos = aluno.equipamentos;
            }
        }

        // Gera treino personalizado
        var treino = gerador.gerarTreino(objetivo, nivel, restricoes, equipamentos, diasSemana);
        sendJson(ex, 200, treino.toJSON());
    }
}
