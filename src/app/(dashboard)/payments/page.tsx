import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

const TYPE_LABELS: Record<string, string> = {
  COIN_PURCHASE: "شراء عملات",
  VIP_SUBSCRIPTION: "اشتراك VIP",
  GIFT: "هدية افتراضية",
  AGENT_COMMISSION: "عمولة وكيل",
  FRAME_PURCHASE: "شراء إطار",
  ENTRANCE_PURCHASE: "شراء دخولية",
};

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await getSession();
  const typeFilter = searchParams.type;

  const [payments, byType] = await Promise.all([
    prisma.payment.findMany({
      where: typeFilter ? { type: typeFilter as any } : undefined,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: true },
    }),
    prisma.payment.groupBy({
      by: ["type"],
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
  ]);

  const totals = Object.fromEntries(byType.map((b) => [b.type, b._sum.amount || 0]));
  const grandTotal = byType.reduce((sum, b) => sum + (b._sum.amount || 0), 0);

  return (
    <>
      <Header
        title="المدفوعات والأرباح"
        subtitle="سجل كل المعاملات المالية داخل التطبيق"
        adminName={session?.name || ""}
      />

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard label="الإجمالي" value={`$${grandTotal.toFixed(0)}`} accent="gold" />
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <StatCard
              key={key}
              label={label}
              value={`$${(totals[key] || 0).toFixed(0)}`}
              accent="info"
            />
          ))}
        </div>

        <div className="flex gap-2 flex-wrap">
          <a
            href="/payments"
            className={`text-sm px-3 py-1.5 rounded-lg border transition ${
              !typeFilter
                ? "bg-gold/10 text-gold border-gold/30"
                : "text-text-muted border-base-border hover:text-text-primary"
            }`}
          >
            الكل
          </a>
          {Object.entries(TYPE_LABELS).map(([key, label]) => (
            <a
              key={key}
              href={`/payments?type=${key}`}
              className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                typeFilter === key
                  ? "bg-gold/10 text-gold border-gold/30"
                  : "text-text-muted border-base-border hover:text-text-primary"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="bg-base-surface border border-base-border rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-border text-text-muted text-xs">
                <th className="text-right font-medium px-5 py-3">المستخدم</th>
                <th className="text-right font-medium px-5 py-3">النوع</th>
                <th className="text-right font-medium px-5 py-3">الوصف</th>
                <th className="text-right font-medium px-5 py-3">المبلغ</th>
                <th className="text-right font-medium px-5 py-3">الحالة</th>
                <th className="text-right font-medium px-5 py-3">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-base-border/60 last:border-0">
                  <td className="px-5 py-3 text-text-primary">{p.user.displayName}</td>
                  <td className="px-5 py-3 text-text-muted">{TYPE_LABELS[p.type]}</td>
                  <td className="px-5 py-3 text-text-muted">{p.description || "—"}</td>
                  <td className="px-5 py-3 font-mono text-gold">${p.amount.toFixed(2)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-5 py-3 text-text-muted text-xs">
                    {p.createdAt.toLocaleString("ar-EG")}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-text-muted">
                    لا توجد معاملات
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
