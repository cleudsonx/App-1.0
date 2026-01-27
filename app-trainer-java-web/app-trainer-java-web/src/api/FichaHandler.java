package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class FichaHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String response = "{" +
            "\"ficha\": {" +
            "\"id\": 1," +
            "\"nome\": \"Ficha de Treino\"," +
            "\"exercicios\": [" +
            "{\"nome\": \"Supino\", \"series\": 4, \"repeticoes\": 10}," +
            "{\"nome\": \"Agachamento\", \"series\": 3, \"repeticoes\": 12}" +
            "]}" +
            "}";
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
