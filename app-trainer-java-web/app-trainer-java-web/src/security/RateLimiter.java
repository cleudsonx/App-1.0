package security;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Gerenciador de Rate Limiting
 * Protege contra brute force attacks em endpoints de autenticação
 * 
 * Estratégia: 5 tentativas em 5 minutos por IP/email
 */
public class RateLimiter {
    
    private static final int MAX_ATTEMPTS = 5;
    private static final long WINDOW_MS = 5 * 60 * 1000; // 5 minutos
    private static final ConcurrentHashMap<String, List<Long>> attempts = new ConcurrentHashMap<>();
    
    /**
     * Verifica se o cliente atingiu o limite de tentativas
     * @param identifier Email ou IP do cliente
     * @return true se dentro do limite, false se excedeu
     */
    public static boolean isAllowed(String identifier) {
        long now = System.currentTimeMillis();
        
        List<Long> attemptTimes = attempts.computeIfAbsent(identifier, k -> Collections.synchronizedList(new ArrayList<>()));
        
        // Remove tentativas antigas (fora da janela)
        attemptTimes.removeIf(time -> now - time > WINDOW_MS);
        
        // Se ainda tem tentativas disponíveis
        if (attemptTimes.size() < MAX_ATTEMPTS) {
            attemptTimes.add(now);
            return true;
        }
        
        return false;
    }
    
    /**
     * Retorna o número de tentativas restantes
     */
    public static int getRemainingAttempts(String identifier) {
        long now = System.currentTimeMillis();
        List<Long> attemptTimes = attempts.get(identifier);
        
        if (attemptTimes == null) {
            return MAX_ATTEMPTS;
        }
        
        long count = attemptTimes.stream()
            .filter(time -> now - time <= WINDOW_MS)
            .count();
        
        return Math.max(0, MAX_ATTEMPTS - (int)count);
    }
    
    /**
     * Retorna o tempo de espera em segundos até a próxima tentativa
     */
    public static int getWaitTimeSeconds(String identifier) {
        List<Long> attemptTimes = attempts.get(identifier);
        if (attemptTimes == null || attemptTimes.isEmpty()) {
            return 0;
        }
        
        long firstAttempt = attemptTimes.get(0);
        long now = System.currentTimeMillis();
        long waitTime = WINDOW_MS - (now - firstAttempt);
        
        return (int)Math.ceil(waitTime / 1000.0);
    }
    
    /**
     * Reseta tentativas para um identificador (usar após sucesso)
     */
    public static void reset(String identifier) {
        attempts.remove(identifier);
    }
    
    /**
     * Limpa tentativas expiradas (executar periodicamente)
     */
    public static void cleanup() {
        long now = System.currentTimeMillis();
        attempts.forEach((key, times) -> {
            times.removeIf(time -> now - time > WINDOW_MS);
            if (times.isEmpty()) {
                attempts.remove(key);
            }
        });
    }
}
