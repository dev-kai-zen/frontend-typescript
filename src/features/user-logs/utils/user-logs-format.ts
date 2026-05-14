export function formatJsonPreview(value: unknown, maxLen = 72): string {
  if (value === null || value === undefined) return "—";
  try {
    const s = JSON.stringify(value);
    if (s.length <= maxLen) return s;
    return `${s.slice(0, maxLen - 1)}…`;
  } catch {
    return String(value);
  }
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}
