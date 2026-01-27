package api;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import java.net.HttpURLConnection;
import java.net.URL;

public class AuthPermissionTest {
    @Test
    public void testAcessoSemToken() throws Exception {
        URL url = new URL("http://localhost:8081/api/aluno");
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");
        int code = con.getResponseCode();
        assertTrue(code == 401 || code == 403);
    }

    @Test
    public void testAcessoComTokenInvalido() throws Exception {
        URL url = new URL("http://localhost:8081/api/aluno");
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("GET");
        con.setRequestProperty("Authorization", "Bearer token_invalido");
        int code = con.getResponseCode();
        assertTrue(code == 401 || code == 403);
    }
}
