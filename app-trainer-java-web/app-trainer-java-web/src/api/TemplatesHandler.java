package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class TemplatesHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String response = "{" +
            "\"templates\": [" +
            "{\"id\": 1, \"nome\": \"Hipertrofia\", \"descricao\": \"Treino para ganho de massa muscular." + "\"}," +
            "{\"id\": 2, \"nome\": \"Emagrecimento\", \"descricao\": \"Treino para perda de gordura." + "\"}" +
            "]}";
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
