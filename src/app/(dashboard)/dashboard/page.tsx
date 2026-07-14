import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";

export default async function DashboardPage() {
  const session = await getSession();

  const [
    totalUsers,
    activeAgencies,
    pendingAgencies,
    bannedUsers,
    totalRooms,
    revenueAgg,
    recentPayments,
    recentAgencies,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.agency.count({ where: { status: "APPROVED" } }),
    prisma.agency.count({ where: { status: "PENDING" } }),
    prisma.user.count({ where: { status: "BANNED" } }),
    prisma.room.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }),
    prisma.payment.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    prisma.agency.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const totalRevenue = revenueAgg._sum.amount || 0;

  return (
    <>
      <Header
        title="نظرة عامة"
        subtitle="ملخص أداء التطبيق اليوم"
        adminName={session?.name || ""}
      />

      <div className="p-8 space-y-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <StatCard label="إجمالي المستخدمين" value={totalUsers.toLocaleString("en-US")} accent="info" />
          <StatCard label="الوكالات النشطة" value={activeAgencies.toLocaleString("en-US")} accent="success" />
          <StatCard
            label="طلبات وكالات معلّقة"
            value={pendingAgencies.toLocaleString("en-US")}
            hint="بحاجة لمراجعتك"
            accent="gold"
          />
          <StatCard label="مستخدمون محظورون" value={bannedUsers.toLocaleString("en-US")} accent="danger" />
          <StatCard label="إجمالي الغرف" value={totalRooms.toLocaleString("en-US")} accent="info" />
        </div>

        <div className="bg-base-surface border border-base-border rounded-card shadow-card p-6">
          <p className="text-sm text-text-muted">إجمالي الإيرادات (المعاملات الناجحة)</p>
          <p className="font-mono text-4xl font-bold text-gold mt-2">
            ${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-base-surface border border-base-border rounded-card shadow-card p-6">
            <h3 className="font-display font-bold text-text-primary mb-4">
              أحدث المعاملات المالية
            </h3>
            <div className="space-y-3">
              {recentPayments.length === 0 && (
                <p className="text-sm text-text-muted">لا توجد معاملات بعد</p>
              )}
              {recentPayments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-sm border-b border-base-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-text-primary">{p.user.displayName}</p>
                    <p className="text-text-muted text-xs">{p.description || p.type}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-mono text-gold">${p.amount.toFixed(2)}</p>
                    <StatusBadge status={p.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-base-surface border border-base-border rounded-card shadow-card p-6">
            <h3 className="font-display font-bold text-text-primary mb-4">
              أحدث طلبات الوكالات
            </h3>
            <div className="space-y-3">
              {recentAgencies.length === 0 && (
                <p className="text-sm text-text-muted">لا توجد طلبات بعد</p>
              )}
              {recentAgencies.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-sm border-b border-base-border/60 pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-text-primary">{a.name}</p>
                    <p className="text-text-muted text-xs">{a.ownerName}</p>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
