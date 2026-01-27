"""
AppLogger - Logging estruturado para ML Service
Compatível com Java AppLogger
"""

import os
import sys
import logging
from datetime import datetime
from pathlib import Path
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from typing import Optional


class AppLogger:
    """
    Logger centralizado para aplicação
    Escreve logs em arquivo de forma thread-safe com rotation
    Compatível com Java AppLogger
    """
    
    _instance: Optional['AppLogger'] = None
    MAX_LOG_SIZE = 10 * 1024 * 1024  # 10MB
    MAX_LOG_FILES = 7  # Manter 7 dias
    
    def __init__(self, log_dir: Path = Path("logs")):
        """
        Inicializa o logger
        
        Args:
            log_dir: Diretório para arquivos de log
        """
        self.log_dir = log_dir
        log_dir.mkdir(parents=True, exist_ok=True)
        
        # Configurar logger principal
        self.logger = logging.getLogger("APP_TRAINER")
        self.logger.setLevel(logging.DEBUG)
        
        # Evitar duplicação de handlers
        if not self.logger.handlers:
            self._setup_handlers()
    
    def _setup_handlers(self):
        """Configura handlers de arquivo e console"""
        
        # Formato do log (compatível com Java)
        formatter = logging.Formatter(
            '%(asctime)s.%(msecs)03d [%(levelname)s] [%(context)s] %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        
        # Handler de arquivo com rotação diária
        log_file = self.log_dir / f"ml_service_{datetime.now().strftime('%Y-%m-%d')}.log"
        file_handler = TimedRotatingFileHandler(
            filename=log_file,
            when='midnight',
            interval=1,
            backupCount=self.MAX_LOG_FILES,
            encoding='utf-8'
        )
        file_handler.setLevel(logging.DEBUG)
        file_handler.setFormatter(formatter)
        
        # Handler de console
        console_handler = logging.StreamHandler(sys.stdout)
        console_handler.setLevel(logging.INFO)
        console_handler.setFormatter(formatter)
        
        self.logger.addHandler(file_handler)
        self.logger.addHandler(console_handler)
    
    @classmethod
    def get_instance(cls, log_dir: Optional[Path] = None) -> 'AppLogger':
        """
        Obtém instância singleton do logger
        
        Args:
            log_dir: Diretório para logs (opcional)
            
        Returns:
            Instância do AppLogger
        """
        if cls._instance is None:
            cls._instance = cls(log_dir or Path("logs"))
        return cls._instance
    
    def _log(self, level: int, message: str, context: str = "ML_SERVICE", exception: Optional[Exception] = None):
        """
        Log interno
        
        Args:
            level: Nível do log (logging.INFO, etc)
            message: Mensagem
            context: Contexto/módulo
            exception: Exceção opcional
        """

        extra = {'context': context}
        sanitized = self.sanitize_log(message)
        if exception:
            self.logger.log(level, f"{sanitized} - {str(exception)}", extra=extra, exc_info=True)
        else:
            self.logger.log(level, sanitized, extra=extra)

        def sanitize_log(self, msg: str) -> str:
            if not msg:
                return msg
            import re
            # Remove JWT tokens
            msg = re.sub(r"eyJ[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+\.[a-zA-Z0-9-_]+", "[TOKEN_REMOVIDO]", msg)
            # Remove campos de senha
            msg = re.sub(r"(?i)senha=([^&\s]+)", "senha=[REMOVIDA]", msg)
            msg = re.sub(r"(?i)password=([^&\s]+)", "password=[REMOVIDA]", msg)
            # Remove refresh_token
            msg = re.sub(r"(?i)refresh_token=([^&\s]+)", "refresh_token=[REMOVIDO]", msg)
            return msg
    
    def info(self, message: str, context: str = "ML_SERVICE"):
        """
        Log de informação
        
        Args:
            message: Mensagem
            context: Contexto/módulo
        """
        self._log(logging.INFO, message, context)
    
    def warn(self, message: str, context: str = "ML_SERVICE"):
        """
        Log de aviso
        
        Args:
            message: Mensagem
            context: Contexto/módulo
        """
        self._log(logging.WARNING, message, context)
    
    def error(self, message: str, context: str = "ML_SERVICE", exception: Optional[Exception] = None):
        """
        Log de erro
        
        Args:
            message: Mensagem
            context: Contexto/módulo
            exception: Exceção opcional
        """
        self._log(logging.ERROR, message, context, exception)
    
    def debug(self, message: str, context: str = "ML_SERVICE"):
        """
        Log de debug
        
        Args:
            message: Mensagem
            context: Contexto/módulo
        """
        self._log(logging.DEBUG, message, context)
    
    def auth_attempt(self, email: str, success: bool, ip: str = "unknown"):
        """
        Log de tentativa de autenticação
        
        Args:
            email: Email do usuário
            success: Se foi bem sucedido
            ip: IP do cliente
        """
        status = "SUCCESS" if success else "FAILED"
        self.info(f"Auth attempt: {email} - {status} - IP: {ip}", "AUTH")
    
    def request(self, method: str, path: str, status_code: int, duration_ms: float):
        """
        Log de requisição HTTP
        
        Args:
            method: Método HTTP
            path: Caminho da requisição
            status_code: Código de status
            duration_ms: Duração em milissegundos
        """
        self.info(f"{method} {path} - {status_code} - {duration_ms:.2f}ms", "HTTP")
    
    def security_event(self, event_type: str, details: str):
        """
        Log de evento de segurança
        
        Args:
            event_type: Tipo do evento (rate_limit, sql_injection, etc)
            details: Detalhes do evento
        """
        self.warn(f"Security Event [{event_type}]: {details}", "SECURITY")


# Instância global para fácil acesso
logger = AppLogger.get_instance()
