export function formatISTTimestamp(dateStr?: string | null, includeSeconds = false): string {
  if (!dateStr) return "";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return (
      d.toLocaleString("en-US", {
        timeZone: "Asia/Kolkata",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        ...(includeSeconds ? { second: "2-digit" } : {}),
        hour12: true,
      }) + " IST"
    );
  } catch {
    return "";
  }
}
