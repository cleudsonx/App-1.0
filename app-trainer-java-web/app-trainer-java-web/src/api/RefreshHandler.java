package api;

import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

public class RefreshHandler extends BaseHandler {
    @Override
    protected void processRequest(HttpExchange ex) throws IOException {
        // Retorna 501 Not Implemented para qualquer método
        String json = "{\"error\":\"refresh token não implementado\"}";
        ex.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        ex.sendResponseHeaders(501, json.getBytes(StandardCharsets.UTF_8).length);
        ex.getResponseBody().write(json.getBytes(StandardCharsets.UTF_8));
        ex.getResponseBody().close();
    }
}
