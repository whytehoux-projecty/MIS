export interface QRGenerateRequest {
    service_id: number;
    service_api_key: string;
}

export interface QRGenerateResponse {
    qr_token: string;
    qr_image: string;
    expires_in_seconds: number;
}

export interface PINVerifyRequest {
    qr_token: string;
    pin: string;
}

export interface UserInfo {
    user_id: number;
    username: string;
    full_name: string;
    email: string;
}

export interface PINVerifyResponse {
    success: boolean;
    session_token: string;
    user_info: UserInfo;
    expires_in_seconds: number;
}

export interface SessionStatus {
    valid: boolean;
    user_id?: number;
    service_id?: number;
    expires_at?: string;
}
