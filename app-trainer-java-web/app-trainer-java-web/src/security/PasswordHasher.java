package security;

import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Classe utilitária para hash seguro de senhas
 * Implementa PBKDF2 manual (sem dependência externa)
 * 
 * Para produção, considere adicionar BCrypt via dependência:
 * - BCrypt: https://www.mindrot.org/projects/jBCrypt/
 * - OWASP Password Storage Cheat Sheet
 */
public class PasswordHasher {
    
    private static final int SALT_LENGTH = 32;
    private static final int ITERATIONS = 10000;
    private static final int HASH_LENGTH = 32;
    private static final String ALGORITHM = "SHA-256";
    
    /**
     * Gera hash seguro da senha com salt
     * Formato: iterations$salt$hash
     */
    public static String hashPassword(String password) {
        try {
            SecureRandom random = new SecureRandom();
            byte[] salt = new byte[SALT_LENGTH];
            random.nextBytes(salt);
            
            byte[] hash = pbkdf2(password, salt, ITERATIONS);
            
            String encodedSalt = Base64.getEncoder().encodeToString(salt);
            String encodedHash = Base64.getEncoder().encodeToString(hash);
            
            return ITERATIONS + "$" + encodedSalt + "$" + encodedHash;
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar hash de senha", e);
        }
    }
    
    /**
     * Verifica se a senha fornecida corresponde ao hash armazenado
     */
    public static boolean verifyPassword(String password, String hashedPassword) {
        try {
            String[] parts = hashedPassword.split("\\$");
            if (parts.length != 3) {
                return false;
            }
            
            int iterations = Integer.parseInt(parts[0]);
            byte[] salt = Base64.getDecoder().decode(parts[1]);
            byte[] storedHash = Base64.getDecoder().decode(parts[2]);
            
            byte[] computedHash = pbkdf2(password, salt, iterations);
            
            return constantTimeEquals(storedHash, computedHash);
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * PBKDF2 - Password-Based Key Derivation Function 2
     * Implementação manual sem dependências
     */
    private static byte[] pbkdf2(String password, byte[] salt, int iterations) throws Exception {
        MessageDigest md = MessageDigest.getInstance(ALGORITHM);
        
        byte[] input = new byte[salt.length + 4];
        System.arraycopy(salt, 0, input, 0, salt.length);
        System.arraycopy(new byte[]{0, 0, 0, 1}, 0, input, salt.length, 4);
        
        byte[] output = new byte[HASH_LENGTH];
        byte[] previousHash = new byte[0];
        
        for (int i = 0; i < iterations; i++) {
            md.reset();
            md.update(password.getBytes("UTF-8"));
            md.update(input);
            byte[] hash = md.digest();
            
            if (i == 0) {
                System.arraycopy(hash, 0, output, 0, Math.min(hash.length, output.length));
            } else {
                xor(output, hash);
            }
            input = hash;
        }
        
        return output;
    }
    
    /**
     * XOR para combinar hashes
     */
    private static void xor(byte[] a, byte[] b) {
        for (int i = 0; i < a.length && i < b.length; i++) {
            a[i] ^= b[i];
        }
    }
    
    /**
     * Comparação constante de tempo para evitar timing attacks
     */
    private static boolean constantTimeEquals(byte[] a, byte[] b) {
        if (a.length != b.length) {
            return false;
        }
        
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }
}
