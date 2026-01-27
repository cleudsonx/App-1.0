package security;

import java.util.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;

/**
 * Gerenciador de JWT (JSON Web Tokens)
 * Implementação manual sem dependências externas
 * 
 * Tokens com expiração:
 * - Access token: 15 minutos
 * - Refresh token: 7 dias
 */
public class JWTManager {
    
    private static final String SECRET_KEY = getSecretKey();

    private static String getSecretKey() {
        String key = System.getenv("JWT_SECRET_KEY");
        if (key == null || key.isEmpty()) {
            throw new RuntimeException("JWT_SECRET_KEY não definida. Configure a variável de ambiente JWT_SECRET_KEY antes de iniciar o servidor.");
        }
        return key;
    }
    private static final int ACCESS_TOKEN_EXPIRY_MINUTES = 15;
    private static final int REFRESH_TOKEN_EXPIRY_DAYS = 7;
    
    public static class TokenPair {
        public String accessToken;
        public String refreshToken;
        public long expiresIn; // segundos do access token
        public long refreshTokenExpiraEm; // epoch millis do refresh token

        public TokenPair(String accessToken, String refreshToken, long expiresIn, long refreshTokenExpiraEm) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.expiresIn = expiresIn;
            this.refreshTokenExpiraEm = refreshTokenExpiraEm;
        }
    }
    
    public static class TokenPayload {
        public String userId;
        public String email;
        public long issuedAt;
        public long expiresAt;
        public String tokenType; // "access" ou "refresh"
        
        public TokenPayload(String userId, String email, String tokenType, long expiryMs) {
            this.userId = userId;
            this.email = email;
            this.tokenType = tokenType;
            this.issuedAt = System.currentTimeMillis();
            this.expiresAt = this.issuedAt + expiryMs;
        }
        
        public boolean isExpired() {
            return System.currentTimeMillis() > expiresAt;
        }
    }
    
    /**
     * Gera par de tokens (access + refresh)
     */
    public static TokenPair generateTokens(String userId, String email) {
        long accessExpiryMs = ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000;
        long refreshExpiryMs = REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        String accessToken = generateToken(userId, email, "access", accessExpiryMs);
        String refreshToken = generateToken(userId, email, "refresh", refreshExpiryMs);

        long refreshTokenExpiraEm = System.currentTimeMillis() + refreshExpiryMs;
        return new TokenPair(accessToken, refreshToken, accessExpiryMs / 1000, refreshTokenExpiraEm);
    }
    
    /**
     * Gera um token individual
     */
    private static String generateToken(String userId, String email, String type, long expiryMs) {
        TokenPayload payload = new TokenPayload(userId, email, type, expiryMs);
        
        // Header: {"alg":"HS256","typ":"JWT"}
        String header = Base64.getUrlEncoder().withoutPadding().encodeToString(
            "{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes()
        );
        
        // Payload: {"userId":"...","email":"...","type":"access|refresh","iat":...,"exp":...}
        String payloadJson = String.format(
            "{\"userId\":\"%s\",\"email\":\"%s\",\"type\":\"%s\",\"iat\":%d,\"exp\":%d}",
            payload.userId, payload.email, payload.tokenType, 
            payload.issuedAt, payload.expiresAt
        );
        String payloadEncoded = Base64.getUrlEncoder().withoutPadding().encodeToString(payloadJson.getBytes());
        
        // Signature: HMAC-SHA256(header.payload, secret)
        String messageToSign = header + "." + payloadEncoded;
        String signature = generateSignature(messageToSign);
        
        return messageToSign + "." + signature;
    }
    
    /**
     * Verifica validade do token e retorna o payload
     */
    public static TokenPayload verifyToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                return null;
            }
            
            // Valida assinatura
            String messageToSign = parts[0] + "." + parts[1];
            String expectedSignature = generateSignature(messageToSign);
            
            if (!expectedSignature.equals(parts[2])) {
                return null; // Assinatura inválida
            }
            
            // Decodifica payload
            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(decodedPayload);
            
            // Parse simples do JSON
            TokenPayload payload = parseTokenPayload(payloadJson);
            
            if (payload == null || payload.isExpired()) {
                return null; // Token expirado ou inválido
            }
            
            return payload;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Gera assinatura HMAC-SHA256
     */
    private static String generateSignature(String message) {
        try {
            javax.crypto.Mac mac = javax.crypto.Mac.getInstance("HmacSHA256");
            javax.crypto.spec.SecretKeySpec keySpec = 
                new javax.crypto.spec.SecretKeySpec(SECRET_KEY.getBytes(), 0, SECRET_KEY.length(), "HmacSHA256");
            mac.init(keySpec);
            
            byte[] signature = mac.doFinal(message.getBytes());
            return Base64.getUrlEncoder().withoutPadding().encodeToString(signature);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar assinatura", e);
        }
    }
    
    /**
     * Parse simples de JSON do payload
     */
    private static TokenPayload parseTokenPayload(String json) {
        try {
            // Regex simples para extrair valores
            String userId = extract(json, "userId");
            String email = extract(json, "email");
            String type = extract(json, "type");
            long exp = Long.parseLong(extract(json, "exp"));
            long iat = Long.parseLong(extract(json, "iat"));
            
            TokenPayload payload = new TokenPayload(userId, email, type, exp - iat);
            payload.issuedAt = iat;
            payload.expiresAt = exp;
            
            return payload;
        } catch (Exception e) {
            return null;
        }
    }
    
    /**
     * Helper para extrair valor do JSON
     */
    private static String extract(String json, String key) {
        String pattern = "\"" + key + "\":";
        int start = json.indexOf(pattern);
        if (start == -1) return null;
        
        start += pattern.length();
        
        // Se é string (com aspas)
        if (json.charAt(start) == '"') {
            start++;
            int end = json.indexOf("\"", start);
            return json.substring(start, end);
        }
        
        // Se é número
        int end = start;
        while (end < json.length() && Character.isDigit(json.charAt(end))) {
            end++;
        }
        return json.substring(start, end);
    }
}
