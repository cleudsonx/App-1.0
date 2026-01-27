package log;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class AppLoggerSanitizeTest {
    @Test
    public void testSanitizeLog() throws Exception {
        AppLogger logger = AppLogger.getInstance();
        String msg = "senha=123456 password=abc123 refresh_token=eyJabc.def.ghi JWT=eyJxyz.uvw.rst";
        String sanitized = logger.sanitizeLog(msg);
        assertFalse(sanitized.contains("123456"));
        assertFalse(sanitized.contains("abc123"));
        assertFalse(sanitized.contains("eyJabc.def.ghi"));
        assertFalse(sanitized.contains("eyJxyz.uvw.rst"));
        assertTrue(sanitized.contains("senha=[REMOVIDA]"));
        assertTrue(sanitized.contains("password=[REMOVIDA]"));
        assertTrue(sanitized.contains("refresh_token=[REMOVIDO]"));
        assertTrue(sanitized.contains("[TOKEN_REMOVIDO]"));
    }
}
