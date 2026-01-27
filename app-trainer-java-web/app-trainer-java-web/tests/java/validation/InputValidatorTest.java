package validation;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class InputValidatorTest {
    @Test
    public void testValidEmail() {
        assertTrue(InputValidator.isValidEmail("teste@email.com"));
        assertFalse(InputValidator.isValidEmail("email-invalido"));
        assertFalse(InputValidator.isValidEmail(""));
        assertFalse(InputValidator.isValidEmail(null));
    }

    @Test
    public void testStrongPassword() {
        assertTrue(InputValidator.isStrongPassword("SenhaForte@2026"));
        assertFalse(InputValidator.isStrongPassword("senha"));
        assertFalse(InputValidator.isStrongPassword("12345678"));
        assertFalse(InputValidator.isStrongPassword("Senha123"));
    }

    @Test
    public void testSafeString() {
        assertTrue(InputValidator.isSafeString("Nome123"));
        assertFalse(InputValidator.isSafeString("DROP TABLE"));
        assertFalse(InputValidator.isSafeString("Robert'); DROP TABLE Students;--"));
    }
}
