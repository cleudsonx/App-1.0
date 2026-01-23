import com.sun.net.httpserver.HttpServer;
import java.net.InetSocketAddress;
import java.nio.file.*;
import java.util.concurrent.Executors;
import java.io.OutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;

import api.*;
import storage.DataStorage;

public class WebServer {

    private static final String VERSION = "2.0.0";

    public static void main(String[] args) throws Exception {
        String portEnv = System.getenv("PORT");
        int port = (portEnv != null && portEnv.matches("\\d+")) ? Integer.parseInt(portEnv) : 8081;

        Path currentDir = Path.of(".").toAbsolutePath().normalize();
        Path webDir;
        Path dataDir;

        if (currentDir.endsWith("src")) {
            webDir = currentDir.getParent().resolve("web");
            dataDir = currentDir.getParent().resolve("data");
        } else if (Files.exists(Path.of("web"))) {
            webDir = Path.of("web");
            dataDir = Path.of("data");
        } else if (Files.exists(Path.of("app-trainer-java-web/web"))) {
            webDir = Path.of("app-trainer-java-web/web");
            dataDir = Path.of("app-trainer-java-web/data");
        } else {
            webDir = Path.of("../web");
            dataDir = Path.of("../data");
        }

        System.out.println("[Config] webDir: " + webDir.toAbsolutePath());
        System.out.println("[Config] dataDir: " + dataDir.toAbsolutePath());

        if (!Files.exists(webDir)) {
            System.err.println("[ERRO] Diretório web não encontrado: " + webDir.toAbsolutePath());
            return;
        }

        DataStorage storage = new DataStorage(dataDir);

        HttpServer server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.setExecutor(Executors.newFixedThreadPool(10));

        // ==================== ENDPOINTS ESTÁTICOS ====================
        server.createContext("/", new CORSHandler(new StaticHandler(webDir)));

        // ==================== API REST ====================
        AuthHandler authHandler = new AuthHandler(storage);
        server.createContext("/auth/login", new CORSHandler(authHandler));
        server.createContext("/auth/registro", new CORSHandler(authHandler));
        server.createContext("/auth/verificar", new CORSHandler(authHandler));

        AlunoHandler alunoHandler = new AlunoHandler(storage);
        server.createContext("/api/alunos", new CORSHandler(alunoHandler));

        ProfessorHandler profHandler = new ProfessorHandler(storage);
        server.createContext("/api/professores", new CORSHandler(profHandler));
        server.createContext("/api/profs", new CORSHandler(profHandler));

        CoachHandler coachHandler = new CoachHandler(storage);
        server.createContext("/api/coach", new CORSHandler(coachHandler));

        SugestaoHandler sugestaoHandler = new SugestaoHandler(storage);
        server.createContext("/api/sugestao", new CORSHandler(sugestaoHandler));
        server.createContext("/api/treino/gerar", new CORSHandler(sugestaoHandler));

        // Health check
        server.createContext("/api/health", new CORSHandler(ex -> {
            String json = "{\"status\":\"ok\",\"version\":\"" + VERSION + "\"}";
            sendJson(ex, 200, json);
        }));

        // Proxy para serviço ML Python
        final String mlServiceUrlFinal;
        String mlServiceUrlTmp = System.getenv("ML_SERVICE_URL");
        if (mlServiceUrlTmp == null || mlServiceUrlTmp.isBlank()) {
            mlServiceUrlFinal = "http://localhost:8001";
        } else {
            mlServiceUrlFinal = mlServiceUrlTmp;
        }
        server.createContext("/api/sugestao-ml", new CORSHandler(ex -> Proxy.forward(ex, mlServiceUrlFinal + "/suggest")));
        server.createContext("/api/coach-ml", new CORSHandler(ex -> Proxy.forward(ex, mlServiceUrlFinal + "/coach")));

        System.out.println("╔════════════════════════════════════════════════════╗");
        System.out.println("║         APP TRAINER - Servidor Web v" + VERSION + "        ║");
        System.out.println("╠════════════════════════════════════════════════════╣");
        System.out.println("║  🌐 Web:            http://localhost:" + port + "          ║");
        System.out.println("║  📱 API:            http://localhost:" + port + "/api      ║");
        System.out.println("╠════════════════════════════════════════════════════╣");
        System.out.println("║ Endpoints disponíveis:                             ║");
        System.out.println("║ • POST       /auth/login                           ║");
        System.out.println("║ • POST       /auth/registro                        ║");
        System.out.println("║ • GET        /auth/verificar/{user_id}             ║");
        System.out.println("║ • GET/POST   /api/alunos                           ║");
        System.out.println("║ • GET/POST   /api/professores                      ║");
        System.out.println("║ • GET/POST   /api/coach?q=pergunta                 ║");
        System.out.println("║ • GET/POST   /api/sugestao?objetivo=&nivel=        ║");
        System.out.println("║ • GET        /api/health                           ║");
        System.out.println("╚════════════════════════════════════════════════════╝");

        server.start();
    }

    private static void sendJson(com.sun.net.httpserver.HttpExchange ex, int status, String json) throws IOException {
        ex.getResponseHeaders().add("Content-Type", "application/json; charset=utf-8");
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        ex.sendResponseHeaders(status, bytes.length);
        try (OutputStream os = ex.getResponseBody()) {
            os.write(bytes);
        }
    }
}