"""
PasswordHasher - PBKDF2 implementation for secure password hashing
Compatible with Java implementation
"""

import hashlib
import os
import base64
from typing import Tuple


class PasswordHasher:
    """
    Hashes passwords using PBKDF2 with SHA-256
    Compatible with Java security.PasswordHasher
    
    Format: "iterations$salt$hash"
    - 10,000 iterations (matches Java)
    - 32-byte salt
    - SHA-256 algorithm
    """
    
    ITERATIONS = 10000
    SALT_LENGTH = 32
    HASH_LENGTH = 32
    
    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using PBKDF2
        
        Args:
            password: Plain text password
            
        Returns:
            String in format "iterations$salt$hash"
        """
        # Generate random salt
        salt = os.urandom(PasswordHasher.SALT_LENGTH)
        
        # Hash password with PBKDF2
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt,
            PasswordHasher.ITERATIONS,
            dklen=PasswordHasher.HASH_LENGTH
        )
        
        # Encode to base64 for storage
        salt_b64 = base64.b64encode(salt).decode('ascii')
        hash_b64 = base64.b64encode(password_hash).decode('ascii')
        
        return f"{PasswordHasher.ITERATIONS}${salt_b64}${hash_b64}"
    
    @staticmethod
    def verify_password(password: str, stored_hash: str) -> bool:
        """
        Verify a password against stored hash
        
        Args:
            password: Plain text password to verify
            stored_hash: Stored hash in format "iterations$salt$hash"
            
        Returns:
            True if password matches, False otherwise
        """
        try:
            # Parse stored hash
            parts = stored_hash.split('$')
            if len(parts) != 3:
                return False
            
            iterations = int(parts[0])
            salt = base64.b64decode(parts[1])
            expected_hash = base64.b64decode(parts[2])
            
            # Hash provided password with same salt
            password_hash = hashlib.pbkdf2_hmac(
                'sha256',
                password.encode('utf-8'),
                salt,
                iterations,
                dklen=len(expected_hash)
            )
            
            # Constant-time comparison to prevent timing attacks
            return PasswordHasher._constant_time_compare(password_hash, expected_hash)
            
        except Exception:
            return False
    
    @staticmethod
    def _constant_time_compare(a: bytes, b: bytes) -> bool:
        """
        Constant-time comparison to prevent timing attacks
        """
        if len(a) != len(b):
            return False
        
        result = 0
        for x, y in zip(a, b):
            result |= x ^ y
        
        return result == 0
