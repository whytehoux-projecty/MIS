export function extractQrToken(data: string): string | null {
  const raw = data.trim();
  if (!raw) return null;

  try {
    const asUrl = new URL(raw);
    const token = asUrl.searchParams.get("qr_token") || asUrl.searchParams.get("token");
    if (token) return token;
  } catch {
  }

  if (/^[0-9a-fA-F-]{20,}$/.test(raw)) return raw;
  return null;
}

