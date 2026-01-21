import java.net.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.sql.*;

public class TestRunner {
    private static String JAVA_URL = "http://localhost:8081";
    private static String DB_URL = System.getenv("DB_URL");
    private static String DB_USER = System.getenv("DB_USER");
    private static String DB_PASSWORD = System.getenv("DB_PASSWORD");

    public static void main(String[] args) throws Exception {
        System.out.println("=== Java Integration Tests ===");
        int fails = 0;

        fails += assertTrue(checkDbConnection(), "DB connection");
        fails += assertTrue(registerUser(), "Auth registro");
        fails += assertTrue(loginUser(), "Auth login");
        fails += assertTrue(callCoach(), "ML coach via Java");
        fails += assertTrue(callSuggest(), "ML suggest via Java");

        if (fails > 0) {
            System.out.println("=== Tests FAILED: " + fails + " ===");
            System.exit(1);
        } else {
            System.out.println("=== Tests PASSED ===");
        }
    }

    static int assertTrue(boolean ok, String name) {
        if (ok) { System.out.println("[PASS] " + name); return 0; }
        else { System.out.println("[FAIL] " + name); return 1; }
    }

    static boolean checkDbConnection() {
        try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
            return conn != null && !conn.isClosed();
        } catch (Exception e) { return false; }
    }

    static boolean registerUser() {
        try {
            String body = "{\"email\":\"java.test@local.com\",\"senha\":\"SenhaForte@2026\",\"nome\":\"Java Test\"}";
            HttpURLConnection c = post(JAVA_URL + "/auth/registro", body);
            int code = c.getResponseCode();
            return code == 201 || code == 409;
        } catch (Exception e) { return false; }
    }

    static boolean loginUser() {
        try {
            String body = "{\"email\":\"java.test@local.com\",\"senha\":\"SenhaForte@2026\"}";
            HttpURLConnection c = post(JAVA_URL + "/auth/login", body);
            int code = c.getResponseCode();
            String resp = read(c);
            if (code == 200 && resp.contains("access_token")) return true;
            // retry simples (rate limit ou atraso)
            Thread.sleep(1500);
            c = post(JAVA_URL + "/auth/login", body);
            code = c.getResponseCode();
            resp = read(c);
            return code == 200 && resp.contains("access_token");
        } catch (Exception e) { return false; }
    }

    static boolean callCoach() {
        try {
            URL url = new URL(JAVA_URL + "/ml/coach?q=como+fazer+agachamento&nome=Java&objetivo=hipertrofia&nivel=iniciante");
            HttpURLConnection c = (HttpURLConnection) url.openConnection();
            c.setRequestMethod("GET");
            int code = c.getResponseCode();
            String resp = read(c);
            return code == 200 && resp.contains("answer");
        } catch (Exception e) { return false; }
    }

    static boolean callSuggest() {
        try {
            URL url = new URL(JAVA_URL + "/ml/suggest?objetivo=hipertrofia&nivel=intermediario&diasSemana=4");
            HttpURLConnection c = (HttpURLConnection) url.openConnection();
            c.setRequestMethod("GET");
            int code = c.getResponseCode();
            String resp = read(c);
            return code == 200 && resp.contains("treinos");
        } catch (Exception e) { return false; }
    }

    static HttpURLConnection post(String url, String body) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
        c.setRequestMethod("POST");
        c.setRequestProperty("Content-Type", "application/json");
        c.setDoOutput(true);
        try (OutputStream os = c.getOutputStream()) {
            os.write(body.getBytes(StandardCharsets.UTF_8));
        }
        return c;
    }

    static String read(HttpURLConnection c) throws Exception {
        InputStream is = (c.getResponseCode() >= 200 && c.getResponseCode() < 300) ? c.getInputStream() : c.getErrorStream();
        BufferedReader br = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        String line; while ((line = br.readLine()) != null) sb.append(line);
        br.close();
        return sb.toString();
    }
}
