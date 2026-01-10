const ERROR_MESSAGES: Record<string, string> = {
  QR_NOT_FOUND: "This QR code is invalid or has already been used.",
  QR_EXPIRED: "This QR code has expired. Please request a new one.",
  QR_ALREADY_USED: "This QR code has already been scanned.",
  USER_NOT_FOUND:
    "Your account could not be found. Please re-link your account.",
  USER_INACTIVE: "Your account is not active. Contact support.",
  SYSTEM_CLOSED: "Authentication is currently unavailable. Please try later.",
  "Mock API is enabled. Network requests are disabled.":
    "Mock mode is enabled. Network requests are disabled.",
  UNKNOWN: "Something went wrong. Please try again.",
  "Network error - please check your connection":
    "Network error. Please check your connection and try again.",
  "Server error": "Server error. Please try again.",
};

export function getUserFriendlyError(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "Something went wrong. Please try again.";
  return ERROR_MESSAGES[trimmed] || trimmed;
}
