import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class Proxy {
    private static final HttpClient client = HttpClient.newHttpClient();

    public static void forward(HttpExchange ex, String targetBaseUrl) throws IOException {
        try {
            String query = ex.getRequestURI().getQuery();
            String target = targetBaseUrl + (query != null && !query.isEmpty() ? ("?" + query) : "");
            HttpRequest req = HttpRequest.newBuilder(URI.create(target)).GET().build();
            HttpResponse<byte[]> res = client.send(req, HttpResponse.BodyHandlers.ofByteArray());
            String contentType = res.headers().firstValue("content-type").orElse("application/json; charset=utf-8");
            ex.getResponseHeaders().add("Content-Type", contentType);
            ex.sendResponseHeaders(res.statusCode(), res.body().length);
            try (OutputStream os = ex.getResponseBody()) { os.write(res.body()); }
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
            String json = "{\"error\":\"interrupted\"}";
            ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            byte[] b = json.getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(500, b.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(b); }
        } catch (Exception e) {
            String json = "{\"error\":\"" + e.getMessage().replace("\"", "'") + "\"}";
            ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
            byte[] b = json.getBytes(StandardCharsets.UTF_8);
            ex.sendResponseHeaders(502, b.length);
            try (OutputStream os = ex.getResponseBody()) { os.write(b); }
        }
    }
}
