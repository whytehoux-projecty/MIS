from fastapi import HTTPException, Request
from collections import defaultdict
from datetime import datetime, timedelta
import asyncio

class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)
        self._lock = asyncio.Lock()
    
    async def check_rate_limit(self, request: Request):
        client_ip = request.client.host
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=self.window_seconds)
        
        async with self._lock:
            # Clean old requests
            self.requests[client_ip] = [
                t for t in self.requests[client_ip] 
                if t > window_start
            ]
            
            if len(self.requests[client_ip]) >= self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests. Try again in {self.window_seconds} seconds."
                )
            
            self.requests[client_ip].append(now)

# Create instances for different endpoints
login_rate_limiter = RateLimiter(max_requests=5, window_seconds=60)
register_rate_limiter = RateLimiter(max_requests=3, window_seconds=300)
qr_rate_limiter = RateLimiter(max_requests=20, window_seconds=60)
