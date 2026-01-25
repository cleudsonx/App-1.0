package api;

import com.sun.net.httpserver.HttpExchange;
import storage.Storage;
import storage.StorageUtils;

import java.io.IOException;
import java.util.Map;

/**
 * Handler para endpoints de Professores
 */
public class ProfessorHandler extends BaseHandler {
    private final Storage storage;

    public ProfessorHandler(Storage storage) {
        this.storage = storage;
    }

    @Override
    protected void processRequest(HttpExchange ex) throws IOException {
        String method = ex.getRequestMethod().toUpperCase();
        String path = ex.getRequestURI().getPath();
        Map<String, String> query = parseQuery(ex.getRequestURI().getQuery());

        // Extrai ID do path
        String[] parts = path.split("/");
        Integer id = null;
        if (parts.length >= 4) {
            id = parseIntSafe(parts[3], -1);
            if (id == -1) id = null;
        }

        switch (method) {
            case "GET":
                if (id != null) {
                    var prof = storage.getProfessorById(id);
                    if (prof != null) {
                        sendJson(ex, 200, prof.toJSON());
                    } else {
                        sendError(ex, 404, "Professor não encontrado");
                    }
                } else {
                    String especialidade = query.get("especialidade");
                    var profs = storage.listProfessores(especialidade);
                    sendJson(ex, 200, StorageUtils.toJSONArrayProfessores(profs));
                }
                break;

            case "POST":
                createProfessor(ex);
                break;

            case "DELETE":
                if (id != null) {
                    if (storage.deleteProfessor(id)) {
                        sendSuccess(ex, "Professor removido");
                    } else {
                        sendError(ex, 404, "Professor não encontrado");
                    }
                } else {
                    sendError(ex, 400, "ID é obrigatório");
                }
                break;

            default:
                sendError(ex, 405, "Método não suportado");
        }
    }

    private void createProfessor(HttpExchange ex) throws IOException {
        Map<String, String> params;
        String contentType = ex.getRequestHeaders().getFirst("Content-Type");
        if (contentType != null && contentType.contains("application/json")) {
            params = parseJsonBody(readBody(ex));
        } else {
            params = parseQuery(ex.getRequestURI().getQuery());
            if (params.isEmpty()) {
                params = parseQuery(readBody(ex));
            }
        }

        String nome = params.getOrDefault("nome", "").trim();
        if (nome.isEmpty()) {
            sendError(ex, 400, "Nome é obrigatório");
            return;
        }

        String especialidade = params.getOrDefault("especialidade", "musculacao");
        var prof = storage.addProfessor(nome, especialidade);
        sendJson(ex, 201, prof.toJSON());
    }
}
