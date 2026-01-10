export function normalizeAuthKey(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\s+/g, "");
}

