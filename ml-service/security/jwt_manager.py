"""
JWTManager - JWT token generation and verification
Compatible with Java implementation
"""

import os
import json
import time
import hmac
import hashlib
import base64
from typing import Optional, Dict, Any, Tuple
from dataclasses import dataclass


@dataclass
class TokenPair:
    """Pair of access and refresh tokens"""
    access_token: str
    refresh_token: str
    expires_in: int  # seconds


@dataclass
class TokenPayload:
    """JWT token payload"""
    user_id: str
    email: str
    token_type: str  # "access" or "refresh"
    issued_at: int
    expires_at: int
    
    def is_expired(self) -> bool:
        """Check if token has expired"""
        return time.time() * 1000 > self.expires_at


class JWTManager:
    """
    JWT token manager compatible with Java implementation
    - Access token: 15 minutes
    - Refresh token: 7 days
    - HMAC-SHA256 signature
    """
    
    # ✅ SECRET_KEY agora vem de variável de ambiente (produção segura)
    SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "")
    ACCESS_TOKEN_EXPIRY_MINUTES = 15
    REFRESH_TOKEN_EXPIRY_DAYS = 7
    
    @staticmethod
    def _get_secret_key() -> str:
        """Obtém a chave secreta de variável de ambiente"""
        key = os.environ.get("JWT_SECRET_KEY", "")
        if key:
            return key
        # ⚠️ AVISO: Fallback apenas para desenvolvimento
        import warnings
        warnings.warn("JWT_SECRET_KEY não configurada! Usando chave padrão (NÃO USE EM PRODUÇÃO)")
        return f"shaipados-dev-key-change-in-production-{int(time.time()) % 10000}"
    
    @staticmethod
    def generate_tokens(user_id: str, email: str) -> TokenPair:
        """
        Generate access and refresh token pair
        
        Args:
            user_id: User identifier
            email: User email
            
        Returns:
            TokenPair with both tokens
        """
        now_ms = int(time.time() * 1000)
        
        access_expiry_ms = now_ms + (JWTManager.ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000)
        refresh_expiry_ms = now_ms + (JWTManager.REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        
        access_token = JWTManager._generate_token(user_id, email, "access", access_expiry_ms)
        refresh_token = JWTManager._generate_token(user_id, email, "refresh", refresh_expiry_ms)
        
        return TokenPair(
            access_token=access_token,
            refresh_token=refresh_token,
            expires_in=JWTManager.ACCESS_TOKEN_EXPIRY_MINUTES * 60
        )
    
    @staticmethod
    def generate_access_token(user_id: str, email: str) -> str:
        """
        Generate only an access token (for refresh endpoint)
        
        Args:
            user_id: User identifier
            email: User email
            
        Returns:
            JWT access token
        """
        now_ms = int(time.time() * 1000)
        access_expiry_ms = now_ms + (JWTManager.ACCESS_TOKEN_EXPIRY_MINUTES * 60 * 1000)
        return JWTManager._generate_token(user_id, email, "access", access_expiry_ms)
    
    @staticmethod
    def _generate_token(user_id: str, email: str, token_type: str, expiry_ms: int) -> str:
        """
        Generate a JWT token
        
        Args:
            user_id: User identifier
            email: User email
            token_type: "access" or "refresh"
            expiry_ms: Expiration timestamp in milliseconds
            
        Returns:
            JWT token string
        """
        now_ms = int(time.time() * 1000)
        
        # Header
        header = {"alg": "HS256", "typ": "JWT"}
        header_encoded = JWTManager._base64_url_encode(json.dumps(header).encode())
        
        # Payload
        payload = {
            "userId": user_id,
            "email": email,
            "type": token_type,
            "iat": now_ms,
            "exp": expiry_ms
        }
        payload_encoded = JWTManager._base64_url_encode(json.dumps(payload).encode())
        
        # Signature
        message = f"{header_encoded}.{payload_encoded}"
        signature = JWTManager._generate_signature(message)
        
        return f"{message}.{signature}"
    
    @staticmethod
    def verify_token(token: str) -> Optional[TokenPayload]:
        """
        Verify and parse a JWT token
        
        Args:
            token: JWT token string
            
        Returns:
            TokenPayload if valid, None if invalid
        """
        try:
            parts = token.split('.')
            if len(parts) != 3:
                return None
            
            header_encoded, payload_encoded, signature = parts
            
            # Verify signature
            message = f"{header_encoded}.{payload_encoded}"
            expected_signature = JWTManager._generate_signature(message)
            
            if not JWTManager._constant_time_compare(signature, expected_signature):
                return None
            
            # Decode payload
            payload_json = JWTManager._base64_url_decode(payload_encoded)
            payload = json.loads(payload_json)
            
            token_payload = TokenPayload(
                user_id=payload["userId"],
                email=payload["email"],
                token_type=payload["type"],
                issued_at=payload["iat"],
                expires_at=payload["exp"]
            )
            
            # Check expiration
            if token_payload.is_expired():
                return None
            
            return token_payload
            
        except Exception:
            return None
    
    @staticmethod
    def _generate_signature(message: str) -> str:
        """Generate HMAC-SHA256 signature"""
        signature = hmac.new(
            JWTManager.SECRET_KEY.encode(),
            message.encode(),
            hashlib.sha256
        ).digest()
        return JWTManager._base64_url_encode(signature)
    
    @staticmethod
    def _base64_url_encode(data: bytes) -> str:
        """Base64 URL-safe encoding without padding"""
        return base64.urlsafe_b64encode(data).decode().rstrip('=')
    
    @staticmethod
    def _base64_url_decode(data: str) -> bytes:
        """Base64 URL-safe decoding"""
        # Add padding if needed
        padding = 4 - (len(data) % 4)
        if padding != 4:
            data += '=' * padding
        return base64.urlsafe_b64decode(data)
    
    @staticmethod
    def _constant_time_compare(a: str, b: str) -> bool:
        """Constant-time string comparison"""
        if len(a) != len(b):
            return False
        
        result = 0
        for x, y in zip(a, b):
            result |= ord(x) ^ ord(y)
        
        return result == 0
