export function formatPin(pin: string): string {
  const digits = pin.replace(/\D/g, "");
  if (!digits) return "—";
  return digits;
}

