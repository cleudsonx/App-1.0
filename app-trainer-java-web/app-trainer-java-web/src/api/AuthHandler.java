package api;

import com.sun.net.httpserver.HttpExchange;
import storage.DataStorage;
import security.PasswordHasher;
import security.JWTManager;
import security.RateLimiter;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Handler para endpoints de Autenticação
 * POST /auth/login - login (email, senha) → JWT token
 * POST /auth/registro - registro (nome, email, senha) → user_id, JWT token
 * 
 * ✅ Segurança Implementada:
 * - Senhas com hash PBKDF2
 * - JWT com expiração (15min access, 7d refresh)
 * - Rate limiting (5 tentativas em 5min)
 */
public class AuthHandler extends BaseHandler {
    private final DataStorage storage;
    private static final AtomicInteger userIdCounter = new AtomicInteger(1000);
    
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
        } else if (path.equals("/auth/refresh")) {
            handleRefresh(ex, body);
        } else if (path.startsWith("/auth/verificar/")) {
            handleVerificar(ex, path);
        } else {
            sendError(ex, 404, "Endpoint não encontrado");
        }
    }

    /**
     * POST /auth/login
     * Body: { "email": "...", "senha": "..." }
     * Response: { "user_id": ..., "access_token": "...", "refresh_token": "...", "nome": "...", "email": "..." }
     * 
     * ✅ Rate Limiting: 5 tentativas em 5 minutos
     * ✅ Senha com hash PBKDF2
     * ✅ JWT com 15min expiração
     */
    private void handleLogin(HttpExchange ex, String body) throws IOException {
        try {
            Map<String, String> data = parseSimpleJSON(body);
            String email = data.get("email");
            String senha = data.get("senha");

            if (email == null || email.trim().isEmpty() || senha == null || senha.isEmpty()) {
                sendError(ex, 400, "Email e senha são obrigatórios");
                return;
            }

            // 🔐 RATE LIMITING: Proteger contra brute force
            if (!RateLimiter.isAllowed(email)) {
                int waitSeconds = RateLimiter.getWaitTimeSeconds(email);
                sendError(ex, 429, String.format(
                    "Muitas tentativas. Aguarde %d segundos antes de tentar novamente", 
                    waitSeconds
                ));
                return;
            }

            // Buscar aluno por email
            var aluno = storage.getAlunoByEmail(email);
            
            if (aluno == null) {
                sendError(ex, 401, "Email ou senha inválidos");
                return;
            }

            // 🔐 VERIFICAR SENHA: com hash seguro
            if (!PasswordHasher.verifyPassword(senha, aluno.getSenha())) {
                sendError(ex, 401, "Email ou senha inválidos");
                return;
            }

            // ✅ Login bem-sucedido: gerar JWT tokens
            RateLimiter.reset(email); // Limpar tentativas falhadas
            
            JWTManager.TokenPair tokens = JWTManager.generateTokens(
                String.valueOf(aluno.getId()),
                email
            );

            // Resposta com tokens JWT
            String perfil = aluno.getPerfil() != null ? aluno.getPerfil() : "{}";
            String response = "{" +
                "\"success\":true," +
                "\"user_id\":" + aluno.getId() + "," +
                "\"access_token\":\"" + tokens.accessToken + "\"," +
                "\"refresh_token\":\"" + tokens.refreshToken + "\"," +
                "\"expires_in\":" + tokens.expiresIn + "," +
                "\"token_type\":\"Bearer\"," +
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
     * Response: { "user_id": ..., "access_token": "...", "refresh_token": "...", ... }
     * 
     * ✅ Validação de senha (mínimo 6 caracteres)
     * ✅ Senha armazenada com hash PBKDF2
     * ✅ JWT tokens retornados
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

            // Validar senha mínima
            if (senha.length() < 6) {
                sendError(ex, 400, "Senha deve ter no mínimo 6 caracteres");
                return;
            }

            // Verificar se email já existe
            if (storage.getAlunoByEmail(email) != null) {
                sendError(ex, 409, "Email já cadastrado");
                return;
            }

            // 🔐 HASH DA SENHA: com PBKDF2
            String senhaHash = PasswordHasher.hashPassword(senha);
            
            // Criar novo aluno com senha hasheada
            var newAluno = storage.addAlunoWithHash(nome, email, senhaHash);

            // ✅ Gerar JWT tokens
            JWTManager.TokenPair tokens = JWTManager.generateTokens(
                String.valueOf(newAluno.getId()),
                email
            );

            // Resposta de sucesso
            String response = "{" +
                "\"success\":true," +
                "\"user_id\":" + newAluno.getId() + "," +
                "\"access_token\":\"" + tokens.accessToken + "\"," +
                "\"refresh_token\":\"" + tokens.refreshToken + "\"," +
                "\"expires_in\":" + tokens.expiresIn + "," +
                "\"token_type\":\"Bearer\"," +
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
     * POST /auth/refresh
     * Body: { "refresh_token": "..." }
     * Response: { "access_token": "...", "expires_in": 900 }
     * 
     * ✅ Valida refresh token e gera novo access token
     */
    private void handleRefresh(HttpExchange ex, String body) throws IOException {
        try {
            Map<String, String> data = parseSimpleJSON(body);
            String refreshToken = data.get("refresh_token");

            if (refreshToken == null || refreshToken.trim().isEmpty()) {
                sendError(ex, 400, "refresh_token é obrigatório");
                return;
            }

            // 🔐 VALIDAR REFRESH TOKEN
            JWTManager.TokenPayload payload;
            try {
                payload = JWTManager.verifyToken(refreshToken);
            } catch (Exception e) {
                sendError(ex, 401, "Refresh token inválido ou expirado");
                return;
            }

            // Verificar se é realmente um refresh token (não um access token)
            if (!"refresh".equals(payload.type)) {
                sendError(ex, 401, "Token fornecido não é um refresh token");
                return;
            }

            // Verificar se usuário ainda existe
            var aluno = storage.getAlunoByEmail(payload.email);
            if (aluno == null) {
                sendError(ex, 401, "Usuário não encontrado");
                return;
            }

            // ✅ Gerar novo access token (15 minutos)
            String newAccessToken = JWTManager.generateAccessToken(payload.userId, payload.email);
            
            String response = "{" +
                "\"access_token\":\"" + newAccessToken + "\"," +
                "\"expires_in\":900," +
                "\"token_type\":\"Bearer\"" +
                "}";

            sendJson(ex, 200, response);

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
