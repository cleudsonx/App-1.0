"""
InputValidator - Validação de entrada compatível com Java
Previne SQL Injection, XSS e valida inputs
"""

import re
from typing import Tuple, Optional
from dataclasses import dataclass


@dataclass
class ValidationResult:
    """Resultado de validação"""
    valid: bool
    message: str
    
    def __bool__(self) -> bool:
        return self.valid


class InputValidator:
    """
    Validador de entrada - Previne SQL Injection, XSS, input inválido
    Compatível com Java InputValidator
    """
    
    # Padrões de validação
    EMAIL_PATTERN = re.compile(
        r"^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
    )
    
    SAFE_STRING_PATTERN = re.compile(
        r"^[a-zA-Z0-9_\-. \u00C0-\u024F]*$"  # Inclui caracteres latinos acentuados
    )
    
    SQL_INJECTION_PATTERN = re.compile(
        r".*['\";\\].*|.*(--|;|/\*|\*/).*|.*(DROP|DELETE|INSERT|UPDATE|SELECT|CREATE).*",
        re.IGNORECASE
    )
    
    # Objetivos válidos
    VALID_OBJETIVOS = {"hipertrofia", "perda_peso", "resistencia"}
    
    # Níveis válidos
    VALID_NIVEIS = {"iniciante", "intermediario", "avancado"}
    
    # Especialidades válidas
    VALID_ESPECIALIDADES = {"musculacao", "cardio", "funcional", "alongamento"}
    
    @staticmethod
    def is_valid_email(email: Optional[str]) -> bool:
        """
        Valida email conforme RFC 5322
        
        Args:
            email: Endereço de email a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if not email or not email.strip():
            return False
        if len(email) > 254:
            return False
        return bool(InputValidator.EMAIL_PATTERN.match(email))
    
    @staticmethod
    def validate_password(password: Optional[str]) -> ValidationResult:
        """
        Valida força de senha
        Requer: 8+ chars, 1 maiúscula, 1 minúscula, 1 número, 1 símbolo
        
        Args:
            password: Senha a validar
            
        Returns:
            ValidationResult com status e mensagem
        """
        if password is None:
            return ValidationResult(False, "Senha não pode ser nula")
        
        if len(password) < 8:
            return ValidationResult(False, "Senha deve ter no mínimo 8 caracteres")
        
        if not re.search(r"[A-Z]", password):
            return ValidationResult(False, "Senha deve conter pelo menos 1 letra maiúscula")
        
        if not re.search(r"[a-z]", password):
            return ValidationResult(False, "Senha deve conter pelo menos 1 letra minúscula")
        
        if not re.search(r"[0-9]", password):
            return ValidationResult(False, "Senha deve conter pelo menos 1 número")
        
        if not re.search(r"[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>?/]", password):
            return ValidationResult(False, "Senha deve conter pelo menos 1 símbolo (!@#$%^&* etc)")
        
        return ValidationResult(True, "Senha válida")
    
    @staticmethod
    def sanitize_string(input_str: Optional[str]) -> str:
        """
        Sanitiza string para evitar SQL Injection
        
        Args:
            input_str: String a sanitizar
            
        Returns:
            String sanitizada
            
        Raises:
            ValueError: Se input contém padrão suspeito de SQL Injection
        """
        if input_str is None:
            return ""
        
        # Detecta SQL injection patterns
        if InputValidator.SQL_INJECTION_PATTERN.match(input_str):
            raise ValueError("Input contém padrão suspeito de SQL Injection")
        
        # Remove caracteres de controle
        return re.sub(r"[\x00-\x1f\x7f]", "", input_str)
    
    @staticmethod
    def sanitize_html(input_str: Optional[str]) -> str:
        """
        Sanitiza para HTML (XSS prevention)
        
        Args:
            input_str: String a sanitizar
            
        Returns:
            String com caracteres HTML escapados
        """
        if input_str is None:
            return ""
        
        return (input_str
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace('"', "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;"))
    
    @staticmethod
    def is_valid_name(name: Optional[str]) -> bool:
        """
        Valida nome (apenas letras, números, espaço, hífen)
        
        Args:
            name: Nome a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if not name or not name.strip():
            return False
        if len(name) > 255:
            return False
        return bool(InputValidator.SAFE_STRING_PATTERN.match(name))
    
    @staticmethod
    def is_valid_objetivo(objetivo: Optional[str]) -> bool:
        """
        Valida objetivo (hipertrofia, perda_peso, resistencia)
        
        Args:
            objetivo: Objetivo a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if objetivo is None:
            return False
        return objetivo in InputValidator.VALID_OBJETIVOS
    
    @staticmethod
    def is_valid_nivel(nivel: Optional[str]) -> bool:
        """
        Valida nível (iniciante, intermediario, avancado)
        
        Args:
            nivel: Nível a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if nivel is None:
            return False
        return nivel in InputValidator.VALID_NIVEIS
    
    @staticmethod
    def is_valid_especialidade(especialidade: Optional[str]) -> bool:
        """
        Valida especialidade (musculacao, cardio, funcional, alongamento)
        
        Args:
            especialidade: Especialidade a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if especialidade is None:
            return False
        return especialidade in InputValidator.VALID_ESPECIALIDADES
    
    @staticmethod
    def is_valid_int(value: Optional[str]) -> bool:
        """
        Valida número (inteiro positivo)
        
        Args:
            value: Valor a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if value is None or value == "":
            return False
        try:
            num = int(value)
            return num >= 0
        except ValueError:
            return False
    
    @staticmethod
    def is_valid_double(value: Optional[str]) -> bool:
        """
        Valida número (decimal positivo)
        
        Args:
            value: Valor a validar
            
        Returns:
            True se válido, False caso contrário
        """
        if value is None or value == "":
            return False
        try:
            num = float(value)
            return num >= 0
        except ValueError:
            return False
    
    @staticmethod
    def is_valid_request_size(size: int, max_bytes: int) -> bool:
        """
        Valida request size (proteção contra payload grande)
        
        Args:
            size: Tamanho do request em bytes
            max_bytes: Tamanho máximo permitido
            
        Returns:
            True se válido, False caso contrário
        """
        return 0 < size <= max_bytes
