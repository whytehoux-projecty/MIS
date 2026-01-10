from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio
from typing import Dict, List
from app.core.audit_logger import audit, AuditEventType

class RateLimiter:
    """
    Enhanced Rate Limiter with Temporary IP Blocking
    """
    def __init__(self, max_requests: int = 10, window_seconds: int = 60, block_duration_seconds: int = 300):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.block_duration = block_duration_seconds
        
        self.requests: Dict[str, List[datetime]] = defaultdict(list)
        self.blocked_ips: Dict[str, datetime] = {}  # IP -> unblock_time
        self._lock = asyncio.Lock()
    
    async def check_rate_limit(self, request: Request):
        try:
            client_ip = request.client.host or "unknown"
        except AttributeError:
            client_ip = "unknown"
            
        now = datetime.utcnow()
        
        async with self._lock:
            # 1. Check if IP is currently blocked
            if client_ip in self.blocked_ips:
                unblock_time = self.blocked_ips[client_ip]
                if now < unblock_time:
                    remaining = int((unblock_time - now).total_seconds())
                    
                    # Log attempt during block (optional, maybe too noisy?)
                    # audit.log(AuditEventType.RATE_LIMIT, success=False, ip_address=client_ip, details={"status": "already_blocked"})
                    
                    raise HTTPException(
                        status_code=429,
                        detail=f"Too many requests. You are blocked for {remaining} seconds."
                    )
                else:
                    # Block expired
                    del self.blocked_ips[client_ip]
                    # Also clear request history to give a fresh start? 
                    # Or keep them to prevent immediate re-block?
                    # Let's clear requests to be fair.
                    if client_ip in self.requests:
                         del self.requests[client_ip]

            # 2. Clean old requests from history
            window_start = now - timedelta(seconds=self.window_seconds)
            self.requests[client_ip] = [
                t for t in self.requests[client_ip] 
                if t > window_start
            ]
            
            # 3. Check against limit
            if len(self.requests[client_ip]) >= self.max_requests:
                # Exceeded limit -> Block IP
                self.blocked_ips[client_ip] = now + timedelta(seconds=self.block_duration)
                
                # Audit log the blocking event
                audit.log(
                    AuditEventType.RATE_LIMIT, 
                    success=False, 
                    ip_address=client_ip,
                    details={
                        "limit": self.max_requests, 
                        "window": self.window_seconds,
                        "action": "blocked",
                        "duration": self.block_duration
                    }
                )
                
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests. You are blocked for {self.block_duration} seconds."
                )
            
            # 4. Record this request
            self.requests[client_ip].append(now)

# Create instances optimized for different endpoints
# Login: Strict (5 attempts / min) -> 5 mins block
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=60, block_duration_seconds=300)

# Register: Very Strict (3 attempts / 5 mins) -> 15 mins block
register_rate_limiter = RateLimiter(max_requests=3, window_seconds=300, block_duration_seconds=900)

# QR Gen: Moderate (20 / min) - Services usually call this, might need higher if shared IP
# But specific service IPs should be whitelistable eventually. For now, 20/min per IP is reasonable.
qr_rate_limiter = RateLimiter(max_requests=20, window_seconds=60, block_duration_seconds=300)
