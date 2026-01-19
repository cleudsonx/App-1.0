package api;

import com.sun.net.httpserver.HttpExchange;
import storage.DataStorage;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Handler para endpoints de Autenticação
 * POST /auth/login - login (email, senha) → token
 * POST /auth/registro - registro (nome, email, senha) → user_id, token
 */
public class AuthHandler extends BaseHandler {
    private final DataStorage storage;
    private static final AtomicInteger userIdCounter = new AtomicInteger(1000);
    private static final Map<String, String> tokenMap = new HashMap<>();
    
    public AuthHandler(DataStorage storage) {
        this.storage = storage;
    }

    @Override
    protected void processRequest(HttpExchange ex) throws IOException {
        String path = ex.getRequestURI().getPath();
        String method = ex.getRequestMethod().toUpperCase();

        if (!method.equals("POST") && !method.equals("GET")) {
            sendError(ex, 405, "Método não permitido");
            return;
        }

        String body = readBody(ex);
        
        if (path.equals("/auth/login")) {
            handleLogin(ex, body);
        } else if (path.equals("/auth/registro")) {
            handleRegistro(ex, body);
        } else if (path.startsWith("/auth/verificar/")) {
            handleVerificar(ex, path);
        } else {
            sendError(ex, 404, "Endpoint não encontrado");
        }
    }

    /**
     * POST /auth/login
     * Body: { "email": "...", "senha": "..." }
     * Response: { "user_id": ..., "token": "...", "nome": "...", "email": "..." }
     */
    private void handleLogin(HttpExchange ex, String body) throws IOException {
        try {
            // Parse simples do JSON
            Map<String, String> data = parseSimpleJSON(body);
            String email = data.get("email");
            String senha = data.get("senha");

            if (email == null || email.trim().isEmpty() || senha == null || senha.isEmpty()) {
                sendError(ex, 400, "Email e senha são obrigatórios");
                return;
            }

            // Buscar aluno por email
            var aluno = storage.getAlunoByEmail(email);
            
            if (aluno == null) {
                sendError(ex, 401, "Email ou senha inválidos");
                return;
            }

            // Verificar senha (simples comparação por enquanto - em produção usar hash)
            if (!aluno.getSenha().equals(senha)) {
                sendError(ex, 401, "Email ou senha inválidos");
                return;
            }

            // Gerar token (UUID simples)
            String token = UUID.randomUUID().toString();
            tokenMap.put(token, String.valueOf(aluno.getId()));

            // Resposta de sucesso
            String perfil = aluno.getPerfil() != null ? aluno.getPerfil() : "{}";
            String response = "{" +
                "\"user_id\":" + aluno.getId() + "," +
                "\"token\":\"" + token + "\"," +
                "\"nome\":\"" + jsonEsc(aluno.getNome()) + "\"," +
                "\"email\":\"" + jsonEsc(aluno.getEmail()) + "\"," +
                "\"perfil\":" + perfil +
                "}";

            sendJson(ex, 200, response);

        } catch (Exception e) {
            sendError(ex, 400, "Dados inválidos: " + e.getMessage());
        }
    }

    /**
     * POST /auth/registro
     * Body: { "nome": "...", "email": "...", "senha": "..." }
     * Response: { "user_id": ..., "token": "...", "nome": "...", "email": "..." }
     */
    private void handleRegistro(HttpExchange ex, String body) throws IOException {
        try {
            Map<String, String> data = parseSimpleJSON(body);
            String nome = data.get("nome");
            String email = data.get("email");
            String senha = data.get("senha");

            if (nome == null || nome.trim().isEmpty() || 
                email == null || email.trim().isEmpty() || 
                senha == null || senha.isEmpty()) {
                sendError(ex, 400, "Nome, email e senha são obrigatórios");
                return;
            }

            // Verificar se email já existe
            if (storage.getAlunoByEmail(email) != null) {
                sendError(ex, 409, "Email já cadastrado");
                return;
            }

            // Criar novo aluno diretamente no storage
            var newAluno = storage.addAluno(nome, email, senha);

            // Gerar token
            String token = UUID.randomUUID().toString();
            tokenMap.put(token, String.valueOf(newAluno.getId()));

            // Resposta de sucesso
            String response = "{" +
                "\"user_id\":" + newAluno.getId() + "," +
                "\"token\":\"" + token + "\"," +
                "\"nome\":\"" + jsonEsc(nome) + "\"," +
                "\"email\":\"" + jsonEsc(email) + "\"," +
                "\"perfil\":{}" +
                "}";

            sendJson(ex, 201, response);

        } catch (Exception e) {
            sendError(ex, 400, "Dados inválidos: " + e.getMessage());
        }
    }

    /**
     * GET /auth/verificar/{user_id}
     * Verifica se user existe e retorna dados básicos
     */
    private void handleVerificar(HttpExchange ex, String path) throws IOException {
        try {
            String[] parts = path.split("/");
            if (parts.length < 4) {
                sendError(ex, 400, "User ID inválido");
                return;
            }

            int userId = Integer.parseInt(parts[3]);
            var aluno = storage.getAlunoById(userId);

            if (aluno == null) {
                sendError(ex, 404, "Usuário não encontrado");
                return;
            }

            String perfil = aluno.getPerfil() != null ? aluno.getPerfil() : "{}";
            String response = "{" +
                "\"id\":" + aluno.getId() + "," +
                "\"nome\":\"" + jsonEsc(aluno.getNome()) + "\"," +
                "\"email\":\"" + jsonEsc(aluno.getEmail()) + "\"," +
                "\"perfil\":" + perfil +
                "}";

            sendJson(ex, 200, response);

        } catch (NumberFormatException e) {
            sendError(ex, 400, "User ID deve ser um número");
        } catch (Exception e) {
            sendError(ex, 500, "Erro ao verificar usuário");
        }
    }

    /**
     * Parse simples de JSON sem dependências externas
     */
    private Map<String, String> parseSimpleJSON(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null || json.trim().isEmpty()) return map;
        
        // Remove chaves externas e espaços
        json = json.trim();
        if (json.startsWith("{")) json = json.substring(1);
        if (json.endsWith("}")) json = json.substring(0, json.length() - 1);
        
        // Split por vírgulas fora de strings
        String[] parts = json.split(",");
        for (String part : parts) {
            part = part.trim();
            int colonIdx = part.indexOf(":");
            if (colonIdx > 0) {
                String key = part.substring(0, colonIdx).trim().replaceAll("[\"']", "");
                String value = part.substring(colonIdx + 1).trim().replaceAll("[\"']", "");
                map.put(key, value);
            }
        }
        return map;
    }

    private static String jsonEsc(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
