import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

public class CORSHandler implements HttpHandler {
    private final HttpHandler next;

    public CORSHandler(HttpHandler next) {
        this.next = next;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String origin = exchange.getRequestHeaders().getFirst("Origin");

        // Lista de origens permitidas
        String allowedOrigin = "*"; // fallback
        if (origin != null) {
            if (origin.equals("https://shaipados.com") || origin.startsWith("http://localhost")) {
                allowedOrigin = origin;
            }
        }

        exchange.getResponseHeaders().add("Access-Control-Allow-Origin", allowedOrigin);
        exchange.getResponseHeaders().add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().add("Access-Control-Allow-Headers", "Content-Type, Authorization");

        // Trata requisições preflight (OPTIONS)
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(200, -1);
            return;
        }

        // Continua para o handler real
        next.handle(exchange);
    }
}
