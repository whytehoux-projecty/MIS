from pydantic import BaseModel
from typing import Optional, Dict, Any

class QRGenerateRequest(BaseModel):
    service_id: int
    service_api_key: str

class QRGenerateResponse(BaseModel):
    qr_token: str
    qr_image: str
    expires_in_seconds: int

class QRScanRequest(BaseModel):
    qr_token: str
    user_auth_key: str
    device_info: Optional[Dict[str, Any]] = None

class QRScanResponse(BaseModel):
    success: bool
    pin: str
    message: str

class PINVerifyRequest(BaseModel):
    qr_token: str
    pin: str

class PINVerifyResponse(BaseModel):
    success: bool
    session_token: str
    user_info: dict
    expires_in_seconds: int