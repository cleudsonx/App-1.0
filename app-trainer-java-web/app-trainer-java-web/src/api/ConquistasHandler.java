package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class ConquistasHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String response = "{" +
            "\"conquistas\": [" +
            "{\"id\": 1, \"nome\": \"Primeiro treino\", \"descricao\": \"Parabéns pelo primeiro treino!\"}," +
            "{\"id\": 2, \"nome\": \"Meta atingida\", \"descricao\": \"Você atingiu sua meta semanal!\"}" +
            "]}";
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
