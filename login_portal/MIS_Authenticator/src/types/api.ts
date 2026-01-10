export type UserInfo = {
  id: number;
  username: string;
  full_name: string;
  email: string;
};

export type ValidateKeyResponse = {
  valid: boolean;
  user?: UserInfo;
  error?: string;
};

export type QRScanResponse =
  | {
      success: true;
      pin: string;
      expires_in?: number;
      service_name?: string;
    }
  | {
      success: false;
      error: string;
    };

export type SystemStatusResponse = {
  status: "open" | "closed";
  warning: boolean;
  message: string;
  closes_at?: string;
  opens_at?: string;
};

