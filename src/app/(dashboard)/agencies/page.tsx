import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionButton } from "@/components/ActionButton";
import {
  approveAgency,
  rejectAgency,
  suspendAgency,
  reactivateAgency,
  updateAgencyLevel,
  createAgencyRequest,
} from "./actions";

export default async function AgenciesPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getSession();
  const statusFilter = searchParams.status;

  const agencies = await prisma.agency.findMany({
    where: statusFilter ? { status: statusFilter as any } : undefined,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { hosts: true } } },
  });

  const tabs = [
    { key: undefined, label: "الكل" },
    { key: "PENDING", label: "قيد المراجعة" },
    { key: "APPROVED", label: "مقبولة" },
    { key: "REJECTED", label: "مرفوضة" },
    { key: "SUSPENDED", label: "موقوفة" },
  ];

  return (
    <>
      <Header
        title="طلبات الوكالات"
        subtitle="مراجعة طلبات التسجيل كوكالة والتحكم في مستوى كل وكالة"
        adminName={session?.name || ""}
      />

      <div className="p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2">
            {tabs.map((t) => (
              <a
                key={t.label}
                href={t.key ? `/agencies?status=${t.key}` : "/agencies"}
                className={`text-sm px-3 py-1.5 rounded-lg border transition ${
                  statusFilter === t.key
                    ? "bg-gold/10 text-gold border-gold/30"
                    : "text-text-muted border-base-border hover:text-text-primary"
                }`}
              >
                {t.label}
              </a>
            ))}
          </div>

          <details className="relative">
            <summary className="cursor-pointer text-sm bg-gold text-base-bg font-bold rounded-lg px-4 py-2 list-none">
              + طلب وكالة جديد
            </summary>
            <form
              action={createAgencyRequest}
              className="absolute left-0 mt-2 w-80 bg-base-surface border border-base-border rounded-card shadow-card p-4 space-y-3 z-20"
            >
              <input
                name="name"
                required
                placeholder="اسم الوكالة"
                className="w-full rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
              />
              <input
                name="ownerName"
                required
                placeholder="اسم صاحب الوكالة"
                className="w-full rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
              />
              <input
                name="phone"
                required
                dir="ltr"
                placeholder="رقم الهاتف"
                className="w-full rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
              />
              <input
                name="email"
                dir="ltr"
                placeholder="البريد الإلكتروني (اختياري)"
                className="w-full rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
              />
              <textarea
                name="notes"
                placeholder="ملاحظات (اختياري)"
                className="w-full rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
              />
              <button
                type="submit"
                className="w-full bg-gold text-base-bg font-bold rounded-lg py-2 text-sm"
              >
                إضافة الطلب
              </button>
            </form>
          </details>
        </div>

        <div className="bg-base-surface border border-base-border rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-border text-text-muted text-xs">
                <th className="text-right font-medium px-5 py-3">الوكالة</th>
                <th className="text-right font-medium px-5 py-3">المالك</th>
                <th className="text-right font-medium px-5 py-3">الهاتف</th>
                <th className="text-right font-medium px-5 py-3">المضيفون</th>
                <th className="text-right font-medium px-5 py-3">المستوى</th>
                <th className="text-right font-medium px-5 py-3">نسبة العمولة</th>
                <th className="text-right font-medium px-5 py-3">إجمالي الأرباح</th>
                <th className="text-right font-medium px-5 py-3">الحالة</th>
                <th className="text-right font-medium px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((a) => (
                <tr key={a.id} className="border-b border-base-border/60 last:border-0">
                  <td className="px-5 py-4 text-text-primary font-medium">{a.name}</td>
                  <td className="px-5 py-4 text-text-muted">{a.ownerName}</td>
                  <td className="px-5 py-4 text-text-muted font-mono" dir="ltr">
                    {a.phone}
                  </td>
                  <td className="px-5 py-4 text-text-muted font-mono">{a._count.hosts}</td>
                  <td className="px-5 py-4">
                    <form action={updateAgencyLevel} className="flex items-center gap-1.5">
                      <input type="hidden" name="id" value={a.id} />
                      <select
                        name="level"
                        defaultValue={a.level}
                        className="bg-base-surface2 border border-base-border rounded-md text-xs px-2 py-1 text-text-primary"
                      >
                        <option value="عادي">عادي</option>
                        <option value="فضي">فضي</option>
                        <option value="ذهبي">ذهبي</option>
                        <option value="ماسي">ماسي</option>
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="1"
                        name="commissionRate"
                        defaultValue={a.commissionRate}
                        className="hidden"
                      />
                      <button
                        type="submit"
                        className="text-[11px] text-gold underline decoration-dotted"
                      >
                        حفظ
                      </button>
                    </form>
                  </td>
                  <td className="px-5 py-4 text-text-muted font-mono">
                    {(a.commissionRate * 100).toFixed(0)}%
                  </td>
                  <td className="px-5 py-4 font-mono text-gold">
                    ${a.totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {a.status === "PENDING" && (
                        <>
                          <form action={approveAgency}>
                            <input type="hidden" name="id" value={a.id} />
                            <ActionButton variant="success">قبول</ActionButton>
                          </form>
                          <form action={rejectAgency}>
                            <input type="hidden" name="id" value={a.id} />
                            <ActionButton variant="danger">رفض</ActionButton>
                          </form>
                        </>
                      )}
                      {a.status === "APPROVED" && (
                        <form action={suspendAgency}>
                          <input type="hidden" name="id" value={a.id} />
                          <ActionButton
                            variant="danger"
                            confirmMessage="هل تريد إيقاف هذه الوكالة؟"
                          >
                            إيقاف
                          </ActionButton>
                        </form>
                      )}
                      {a.status === "SUSPENDED" && (
                        <form action={reactivateAgency}>
                          <input type="hidden" name="id" value={a.id} />
                          <ActionButton variant="success">إعادة تفعيل</ActionButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {agencies.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-10 text-center text-text-muted">
                    لا توجد طلبات في هذا التصنيف
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
