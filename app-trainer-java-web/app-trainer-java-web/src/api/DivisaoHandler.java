package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class DivisaoHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String response = "{" +
            "\"divisao\": [" +
            "{\"id\": 1, \"nome\": \"ABC\", \"descricao\": \"Treino dividido em 3 grupos musculares." + "\"}," +
            "{\"id\": 2, \"nome\": \"Push/Pull/Legs\", \"descricao\": \"Treino dividido em empurrar, puxar e pernas." + "\"}" +
            "]}";
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
