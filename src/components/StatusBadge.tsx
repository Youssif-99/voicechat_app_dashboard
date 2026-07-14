const STYLES: Record<string, string> = {
  PENDING: "bg-info/10 text-info border-info/30",
  APPROVED: "bg-success/10 text-success border-success/30",
  REJECTED: "bg-danger/10 text-danger border-danger/30",
  SUSPENDED: "bg-danger/10 text-danger border-danger/30",
  ACTIVE: "bg-success/10 text-success border-success/30",
  BANNED: "bg-danger/10 text-danger border-danger/30",
  SUCCESS: "bg-success/10 text-success border-success/30",
  FAILED: "bg-danger/10 text-danger border-danger/30",
  REFUNDED: "bg-gold/10 text-gold border-gold/30",
};

const LABELS: Record<string, string> = {
  PENDING: "قيد المراجعة",
  APPROVED: "مقبولة",
  REJECTED: "مرفوضة",
  SUSPENDED: "موقوفة",
  ACTIVE: "نشط",
  BANNED: "محظور",
  SUCCESS: "ناجحة",
  FAILED: "فاشلة",
  REFUNDED: "مستردة",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block text-xs font-medium border rounded-full px-2.5 py-1 ${
        STYLES[status] || "bg-base-surface2 text-text-muted border-base-border"
      }`}
    >
      {LABELS[status] || status}
    </span>
  );
}
