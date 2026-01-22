import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;

/**
 * Wrapper para adicionar CORS headers
 * Restrito a: shaipados.com, localhost, 192.168.x.x
 */
public class CORSHandler implements HttpHandler {
    
    private final HttpHandler delegate;
    private static final String[] ALLOWED_ORIGINS = {
        "shaipados.com",
        "cleudsonx.github.io"
    };
    
    public CORSHandler(HttpHandler delegate) {
        this.delegate = delegate;
    }
    
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String origin = exchange.getRequestHeaders().getFirst("Origin");
        
        // Validar origem (permitir localhost, 192.168.x.x, shaipados.com, shaipados..com, cleudsonx.github.io)
        boolean isAllowed = false;
        if (origin != null) {
            isAllowed = origin.contains("localhost") || 
                       origin.contains("127.0.0.1") ||
                       origin.contains("192.168");
            if (!isAllowed) {
                for (String allowed : ALLOWED_ORIGINS) {
                    if (origin.contains(allowed)) {
                        isAllowed = true;
                        break;
                    }
                }
            }
        }
        
        // Adicionar headers CORS
        if (isAllowed) {
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", origin != null ? origin : "shaipados.com");
        }
        
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
        exchange.getResponseHeaders().set("Access-Control-Allow-Credentials", "true");
        exchange.getResponseHeaders().set("Access-Control-Max-Age", "86400");
        
        // Handle preflight requests
        if ("OPTIONS".equals(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }
        
        // Delegar para o handler real
        delegate.handle(exchange);
    }
}
