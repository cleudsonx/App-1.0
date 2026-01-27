
package validation;

import java.util.regex.Pattern;

/**
 * Validador de entrada - Previne SQL Injection, XSS, input inválido
 */
public class InputValidator {
    // Padrões de validação
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
        "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$"
    );
    private static final Pattern SAFE_STRING_PATTERN = Pattern.compile(
        "^[a-zA-Z0-9_\\-. \\pL]*$"
    );
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        ".*['\";\\\\].*|.*(--|;|/\\*|\\*/).*|.*(DROP|DELETE|INSERT|UPDATE|SELECT|CREATE).*",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Valida força de senha (8+ chars, 1 maiúscula, 1 número, 1 símbolo)
     */
    public static boolean isStrongPassword(String password) {
        ValidationResult result = validatePassword(password);
        return result.valid;
    }

    /**
     * Verifica se string é "segura" (sem padrões de SQL injection, apenas caracteres permitidos)
     */
    public static boolean isSafeString(String input) {
        if (input == null || input.trim().isEmpty()) {
            return false;
        }
        if (SQL_INJECTION_PATTERN.matcher(input).matches()) {
            return false;
        }
        return SAFE_STRING_PATTERN.matcher(input).matches();
    }

    /**
     * Valida força de senha (8+ chars, 1 maiúscula, 1 número, 1 símbolo)
     */
    public static boolean isStrongPassword(String password) {
        ValidationResult result = validatePassword(password);
        return result.valid;
    }

    /**
     * Verifica se string é "segura" (sem padrões de SQL injection, apenas caracteres permitidos)
     */
    public static boolean isSafeString(String input) {
        if (input == null || input.trim().isEmpty()) {
            return false;
        }
        if (SQL_INJECTION_PATTERN.matcher(input).matches()) {
            return false;
        }
        return SAFE_STRING_PATTERN.matcher(input).matches();
    }
    }
    
    /**
     * Sanitiza string para evitar SQL Injection
     */
    public static String sanitizeString(String input) {
        if (input == null) {
            return "";
        }
        
        // Remove SQL injection patterns
        if (SQL_INJECTION_PATTERN.matcher(input).matches()) {
            throw new IllegalArgumentException("Input contém padrão suspeito de SQL Injection");
        }
        
        // Remove caracteres de controle
        return input.replaceAll("[\\x00-\\x1f\\x7f]", "");
    }
    
    /**
     * Sanitiza para HTML (XSS prevention)
     */
    public static String sanitizeHtml(String input) {
        if (input == null) {
            return "";
        }
        
        return input
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;");
    }
    
    /**
     * Valida nome (apenas letras, números, espaço, hífen)
     */
    public static boolean isValidName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        if (name.length() > 255) {
            return false;
        }
        return SAFE_STRING_PATTERN.matcher(name).matches();
    }
    
    /**
     * Valida objetivo (hipertrofia, perda_peso, resistencia)
     */
    public static boolean isValidObjetivo(String objetivo) {
        if (objetivo == null) {
            return false;
        }
        return objetivo.equals("hipertrofia") || 
               objetivo.equals("perda_peso") || 
               objetivo.equals("resistencia");
    }
    
    /**
     * Valida nível (iniciante, intermediario, avancado)
     */
    public static boolean isValidNivel(String nivel) {
        if (nivel == null) {
            return false;
        }
        return nivel.equals("iniciante") || 
               nivel.equals("intermediario") || 
               nivel.equals("avancado");
    }
    
    /**
     * Valida especialidade (musculacao, cardio, funcional, alongamento)
     */
    public static boolean isValidEspecialidade(String especialidade) {
        if (especialidade == null) {
            return false;
        }
        return especialidade.equals("musculacao") || 
               especialidade.equals("cardio") || 
               especialidade.equals("funcional") || 
               especialidade.equals("alongamento");
    }
    
    /**
     * Valida número (inteiro positivo)
     */
    public static boolean isValidInt(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        try {
            int num = Integer.parseInt(value);
            return num >= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * Valida número (decimal positivo)
     */
    public static boolean isValidDouble(String value) {
        if (value == null || value.isEmpty()) {
            return false;
        }
        try {
            double num = Double.parseDouble(value);
            return num >= 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
    
    /**
     * Valida request size (proteção contra payload grande)
     */
    public static boolean isValidRequestSize(long size, long maxBytes) {
        return size > 0 && size <= maxBytes;
    }
    
    /**
     * Classe auxiliar para retornar resultado de validação
     */
    public static class ValidationResult {
        public final boolean valid;
        public final String message;
        
        public ValidationResult(boolean valid, String message) {
            this.valid = valid;
            this.message = message;
        }
        
        @Override
        public String toString() {
            return message;
        }
    }
}
