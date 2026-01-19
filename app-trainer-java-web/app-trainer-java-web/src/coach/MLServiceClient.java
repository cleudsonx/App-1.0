package coach;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.*;

/**
 * Cliente para integração com serviço ML Python
 * Faz fallback para IA local quando serviço está offline
 */
public class MLServiceClient {

    private static final String ML_SERVICE_URL = "http://localhost:8001";
    private static final int TIMEOUT_SECONDS = 5;
    
    private final HttpClient httpClient;
    private final ExecutorService executor;
    
    // Cache de respostas para evitar chamadas repetidas
    private final Map<String, CachedResponse> cache = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
    
    // Status do serviço
    private volatile boolean serviceOnline = true;
    private volatile long lastHealthCheck = 0;
    private static final long HEALTH_CHECK_INTERVAL_MS = 30000; // 30 segundos

    public MLServiceClient() {
        this.httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(TIMEOUT_SECONDS))
            .build();
        this.executor = Executors.newCachedThreadPool();
    }

    /**
     * Consulta o coach ML para uma resposta mais inteligente
     */
    public CompletableFuture<MLResponse> consultarCoach(String pergunta, String nome, String objetivo, String nivel) {
        String cacheKey = "coach:" + pergunta + ":" + objetivo + ":" + nivel;
        CachedResponse cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired()) {
            return CompletableFuture.completedFuture(cached.response);
        }

        return CompletableFuture.supplyAsync(() -> {
            if (!isServiceOnline()) {
                return new MLResponse(false, null, "Serviço ML offline");
            }

            try {
                StringBuilder url = new StringBuilder(ML_SERVICE_URL + "/coach?");
                url.append("q=").append(encode(pergunta));
                if (nome != null && !nome.isEmpty()) url.append("&nome=").append(encode(nome));
                if (objetivo != null && !objetivo.isEmpty()) url.append("&objetivo=").append(encode(objetivo));
                if (nivel != null && !nivel.isEmpty()) url.append("&nivel=").append(encode(nivel));

                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url.toString()))
                    .timeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                    .GET()
                    .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() == 200) {
                    String body = response.body();
                    String answer = extrairCampoJson(body, "answer");
                    MLResponse mlResp = new MLResponse(true, answer, null);
                    cache.put(cacheKey, new CachedResponse(mlResp));
                    return mlResp;
                } else {
                    return new MLResponse(false, null, "HTTP " + response.statusCode());
                }
            } catch (Exception e) {
                serviceOnline = false;
                return new MLResponse(false, null, e.getMessage());
            }
        }, executor);
    }

    /**
     * Consulta sugestão de treino via ML
     */
    public CompletableFuture<MLSugestaoResponse> consultarSugestao(String objetivo, String nivel) {
        String cacheKey = "sugestao:" + objetivo + ":" + nivel;
        CachedResponse cached = cache.get(cacheKey);
        if (cached != null && !cached.isExpired() && cached.sugestaoResponse != null) {
            return CompletableFuture.completedFuture(cached.sugestaoResponse);
        }

        return CompletableFuture.supplyAsync(() -> {
            if (!isServiceOnline()) {
                return new MLSugestaoResponse(false, null, null, null, "Serviço ML offline");
            }

            try {
                String url = ML_SERVICE_URL + "/suggest?objetivo=" + encode(objetivo) + "&nivel=" + encode(nivel);

                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(TIMEOUT_SECONDS))
                    .GET()
                    .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                
                if (response.statusCode() == 200) {
                    String body = response.body();
                    String titulo = extrairCampoJson(body, "titulo");
                    String frequencia = extrairCampoJson(body, "frequencia");
                    List<String> exercicios = extrairArrayJson(body, "exercicios");
                    
                    MLSugestaoResponse mlResp = new MLSugestaoResponse(true, titulo, frequencia, exercicios, null);
                    cache.put(cacheKey, new CachedResponse(mlResp));
                    return mlResp;
                } else {
                    return new MLSugestaoResponse(false, null, null, null, "HTTP " + response.statusCode());
                }
            } catch (Exception e) {
                serviceOnline = false;
                return new MLSugestaoResponse(false, null, null, null, e.getMessage());
            }
        }, executor);
    }

    /**
     * Verifica se serviço ML está online (com cache)
     */
    public boolean isServiceOnline() {
        long now = System.currentTimeMillis();
        if (now - lastHealthCheck > HEALTH_CHECK_INTERVAL_MS) {
            lastHealthCheck = now;
            checkHealth();
        }
        return serviceOnline;
    }

    private void checkHealth() {
        executor.submit(() -> {
            try {
                HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ML_SERVICE_URL + "/docs"))
                    .timeout(Duration.ofSeconds(2))
                    .GET()
                    .build();
                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                serviceOnline = response.statusCode() < 500;
            } catch (Exception e) {
                serviceOnline = false;
            }
        });
    }

    /**
     * Força refresh do status
     */
    public void refreshStatus() {
        lastHealthCheck = 0;
        isServiceOnline();
    }

    private String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }

    private String extrairCampoJson(String json, String campo) {
        String pattern = "\"" + campo + "\"\\s*:\\s*\"([^\"]+)\"";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        return m.find() ? m.group(1) : "";
    }

    private List<String> extrairArrayJson(String json, String campo) {
        List<String> result = new ArrayList<>();
        String pattern = "\"" + campo + "\"\\s*:\\s*\\[([^\\]]+)\\]";
        java.util.regex.Matcher m = java.util.regex.Pattern.compile(pattern).matcher(json);
        if (m.find()) {
            String content = m.group(1);
            java.util.regex.Matcher itemMatcher = java.util.regex.Pattern.compile("\"([^\"]+)\"").matcher(content);
            while (itemMatcher.find()) {
                result.add(itemMatcher.group(1));
            }
        }
        return result;
    }

    public void shutdown() {
        executor.shutdown();
    }

    // Classes de resposta
    public static class MLResponse {
        public final boolean success;
        public final String answer;
        public final String error;

        public MLResponse(boolean success, String answer, String error) {
            this.success = success;
            this.answer = answer;
            this.error = error;
        }
    }

    public static class MLSugestaoResponse {
        public final boolean success;
        public final String titulo;
        public final String frequencia;
        public final List<String> exercicios;
        public final String error;

        public MLSugestaoResponse(boolean success, String titulo, String frequencia, List<String> exercicios, String error) {
            this.success = success;
            this.titulo = titulo;
            this.frequencia = frequencia;
            this.exercicios = exercicios;
            this.error = error;
        }
    }

    private static class CachedResponse {
        final MLResponse response;
        final MLSugestaoResponse sugestaoResponse;
        final long timestamp;

        CachedResponse(MLResponse response) {
            this.response = response;
            this.sugestaoResponse = null;
            this.timestamp = System.currentTimeMillis();
        }

        CachedResponse(MLSugestaoResponse response) {
            this.response = null;
            this.sugestaoResponse = response;
            this.timestamp = System.currentTimeMillis();
        }

        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > CACHE_TTL_MS;
        }
    }
}
