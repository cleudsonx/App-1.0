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

        // Permitir shaipados.com, subdomínios e localhost:5173/5174 (React)
        String allowedOrigin = null;
        if (origin != null) {
            if (origin.equals("https://shaipados.com") ||
                origin.equals("https://www.shaipados.com") ||
                origin.matches("https://([a-zA-Z0-9-]+\\.)?shaipados\\.com") ||
                origin.equals("http://localhost:5173") ||
                origin.equals("http://localhost:5174") ||
                origin.equals("http://127.0.0.1:5173") ||
                origin.equals("http://127.0.0.1:5174")
            ) {
                allowedOrigin = origin;
            }
        }
        if (allowedOrigin != null) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", allowedOrigin);
            exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
        }
        // Não adiciona header se origem não for permitida
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