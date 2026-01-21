"""
RateLimiter - Protect against brute force attacks
Compatible with Java implementation
"""

import time
from typing import Dict, List
from threading import Lock


class RateLimiter:
    """
    Rate limiter to prevent brute force attacks
    - Max 5 attempts per 5 minutes
    - Thread-safe
    - Automatic cleanup of old attempts
    """
    
    MAX_ATTEMPTS = 5
    WINDOW_MS = 5 * 60 * 1000  # 5 minutes in milliseconds
    
    # Class-level storage (shared across instances)
    _attempts: Dict[str, List[int]] = {}
    _lock = Lock()
    
    @staticmethod
    def is_allowed(identifier: str) -> bool:
        """
        Check if request is allowed for this identifier
        
        Args:
            identifier: Email or IP address
            
        Returns:
            True if allowed, False if rate limited
        """
        with RateLimiter._lock:
            now = int(time.time() * 1000)
            
            # Initialize or get attempts list
            if identifier not in RateLimiter._attempts:
                RateLimiter._attempts[identifier] = []
            
            attempts = RateLimiter._attempts[identifier]
            
            # Remove attempts outside the window
            cutoff = now - RateLimiter.WINDOW_MS
            RateLimiter._attempts[identifier] = [
                attempt_time for attempt_time in attempts 
                if attempt_time > cutoff
            ]
            
            # Check if under limit
            if len(RateLimiter._attempts[identifier]) < RateLimiter.MAX_ATTEMPTS:
                RateLimiter._attempts[identifier].append(now)
                return True
            
            return False
    
    @staticmethod
    def reset(identifier: str):
        """
        Reset rate limit for identifier (e.g., after successful login)
        
        Args:
            identifier: Email or IP address
        """
        with RateLimiter._lock:
            if identifier in RateLimiter._attempts:
                del RateLimiter._attempts[identifier]
    
    @staticmethod
    def get_wait_time_seconds(identifier: str) -> int:
        """
        Get remaining wait time in seconds before next attempt allowed
        
        Args:
            identifier: Email or IP address
            
        Returns:
            Seconds to wait (0 if allowed immediately)
        """
        with RateLimiter._lock:
            if identifier not in RateLimiter._attempts:
                return 0
            
            attempts = RateLimiter._attempts[identifier]
            if len(attempts) < RateLimiter.MAX_ATTEMPTS:
                return 0
            
            # Find oldest attempt
            oldest_attempt = min(attempts)
            now = int(time.time() * 1000)
            
            # Calculate when window expires
            expires_at = oldest_attempt + RateLimiter.WINDOW_MS
            wait_ms = max(0, expires_at - now)
            
            return int(wait_ms / 1000)
