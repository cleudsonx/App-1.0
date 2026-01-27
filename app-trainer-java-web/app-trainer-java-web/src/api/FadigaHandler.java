package api;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import java.io.IOException;
import java.io.OutputStream;

public class FadigaHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String response = "{" +
            "\"fadiga\": {" +
            "\"nivel\": \"moderado\"," +
            "\"sintomas\": [" +
            "\"cansaço persistente\", \"queda de performance\", \"irritabilidade\"" +
            "]}" +
            "}";
        exchange.getResponseHeaders().add("Content-Type", "application/json; charset=UTF-8");
        exchange.sendResponseHeaders(200, response.getBytes().length);
        OutputStream os = exchange.getResponseBody();
        os.write(response.getBytes());
        os.close();
    }
}
