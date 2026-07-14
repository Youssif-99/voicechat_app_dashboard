export function StatCard({
  label,
  value,
  hint,
  accent = "gold",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: "gold" | "success" | "danger" | "info";
}) {
  const accentClass = {
    gold: "text-gold",
    success: "text-success",
    danger: "text-danger",
    info: "text-info",
  }[accent];

  return (
    <div className="bg-base-surface border border-base-border rounded-card shadow-card p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className={`font-mono text-3xl font-semibold mt-2 ${accentClass}`}>{value}</p>
      {hint && <p className="text-xs text-text-muted mt-2">{hint}</p>}
    </div>
  );
}
