import unittest
from security.app_logger import AppLogger

class TestAppLoggerSanitize(unittest.TestCase):
    def test_sanitize_log(self):
        logger = AppLogger.get_instance()
        msg = "senha=123456 password=abc123 refresh_token=eyJabc.def.ghi JWT=eyJxyz.uvw.rst"
        sanitized = logger.sanitize_log(msg)
        self.assertNotIn("123456", sanitized)
        self.assertNotIn("abc123", sanitized)
        self.assertNotIn("eyJabc.def.ghi", sanitized)
        self.assertNotIn("eyJxyz.uvw.rst", sanitized)
        self.assertIn("senha=[REMOVIDA]", sanitized)
        self.assertIn("password=[REMOVIDA]", sanitized)
        self.assertIn("refresh_token=[REMOVIDO]", sanitized)
        self.assertIn("[TOKEN_REMOVIDO]", sanitized)

if __name__ == "__main__":
    unittest.main()
