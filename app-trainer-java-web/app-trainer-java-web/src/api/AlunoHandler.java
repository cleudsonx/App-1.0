package api;

import com.sun.net.httpserver.HttpExchange;
import storage.Storage;
import storage.StorageUtils;

import java.io.IOException;
import java.util.Map;

/**
 * Handler para endpoints de Alunos
 * GET /api/alunos - lista todos
 * GET /api/alunos/{id} - busca por id
 * POST /api/alunos - cria novo
 * PUT /api/alunos/{id} - atualiza
 * DELETE /api/alunos/{id} - remove
 */
public class AlunoHandler extends BaseHandler {
    private final Storage storage;

    public AlunoHandler(Storage storage) {
        this.storage = storage;
    }

    @Override
    protected void processRequest(HttpExchange ex) throws IOException {
        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod().toUpperCase();
        Map<String, String> query = parseQuery(ex.getRequestURI().getQuery());

        // Extrai ID do path se existir: /api/alunos/123
        String[] parts = path.split("/");
        Integer id = null;
        if (parts.length >= 4) {
            id = parseIntSafe(parts[3], -1);
            if (id == -1) id = null;
        }

        switch (method) {
            case "GET":
                try {
                    if (id != null) {
                        var aluno = storage.getAlunoById(id);
                        if (aluno != null) {
                            sendJson(ex, 200, aluno.toJSON());
                        } else {
                            sendError(ex, 404, "Aluno não encontrado");
                        }
                    } else {
                        // Lista com filtros opcionais
                        String objetivo = query.get("objetivo");
                        String nivel = query.get("nivel");
                        var alunos = storage.listAlunos(objetivo, nivel);
                        sendJson(ex, 200, StorageUtils.toJSONArrayAlunos(alunos));
                    }
                } catch (Exception e) {
                    sendError(ex, 500, "Erro ao acessar dados do aluno: " + e.getMessage());
                }
                break;

            case "POST":
                createAluno(ex);
                break;

            case "PUT":
                if (id != null) {
                    updateAluno(ex, id);
                } else {
                    sendError(ex, 400, "ID do aluno é obrigatório para atualização");
                }
                break;

            case "DELETE":
                if (id != null) {
                    try {
                        if (storage.deleteAluno(id)) {
                            sendSuccess(ex, "Aluno removido");
                        } else {
                            sendError(ex, 404, "Aluno não encontrado");
                        }
                    } catch (Exception e) {
                        sendError(ex, 500, "Erro ao remover aluno: " + e.getMessage());
                    }
                } else {
                    sendError(ex, 400, "ID do aluno é obrigatório");
                }
                break;

            default:
                sendError(ex, 405, "Método não suportado");
        }
    }

    private void createAluno(HttpExchange ex) throws IOException {
        Map<String, String> params;
        
        // Suporta query string (GET legacy) ou body JSON (POST correto)
        String contentType = ex.getRequestHeaders().getFirst("Content-Type");
        if (contentType != null && contentType.contains("application/json")) {
            params = parseJsonBody(readBody(ex));
        } else {
            params = parseQuery(ex.getRequestURI().getQuery());
            if (params.isEmpty()) {
                // Tenta ler do body como form
                params = parseQuery(readBody(ex));
            }
        }

        String nome = params.getOrDefault("nome", "").trim();
        if (nome.isEmpty()) {
            sendError(ex, 400, "Nome é obrigatório");
            return;
        }

        int idade = parseIntSafe(params.get("idade"), 0);
        String objetivo = params.getOrDefault("objetivo", "hipertrofia");
        String nivel = params.getOrDefault("nivel", "iniciante");
        double pesoKg = parseDoubleSafe(params.get("pesoKg"), 0);
        double alturaCm = parseDoubleSafe(params.get("alturaCm"), 0);
        String restricoes = params.getOrDefault("restricoes", "");
        String equipamentos = params.getOrDefault("equipamentos", "");
        String rpeStr = params.get("rpe");
        Integer rpe = (rpeStr == null || rpeStr.isEmpty()) ? null : parseIntSafe(rpeStr, 0);

        try {
            var aluno = storage.addAluno(nome, idade, objetivo, nivel, pesoKg, alturaCm, restricoes, equipamentos, rpe);
            sendJson(ex, 201, aluno.toJSON());
        } catch (Exception e) {
            sendError(ex, 500, "Erro ao criar aluno: " + e.getMessage());
        }
    }

    private void updateAluno(HttpExchange ex, int id) throws IOException {
        Map<String, String> params;
        String contentType = ex.getRequestHeaders().getFirst("Content-Type");
        if (contentType != null && contentType.contains("application/json")) {
            params = parseJsonBody(readBody(ex));
        } else {
            params = parseQuery(readBody(ex));
        }

        try {
            var updated = storage.updateAluno(id, params);
            if (updated != null) {
                sendJson(ex, 200, updated.toJSON());
            } else {
                sendError(ex, 404, "Aluno não encontrado");
            }
        } catch (Exception e) {
            sendError(ex, 500, "Erro ao atualizar aluno: " + e.getMessage());
        }
    }
}
