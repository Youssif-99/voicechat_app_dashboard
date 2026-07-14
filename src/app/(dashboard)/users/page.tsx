import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionButton } from "@/components/ActionButton";
import { banUser, unbanUser, updateUserProfile } from "./actions";

const BAN_LABELS: Record<string, string> = {
  DAY_1: "يوم واحد",
  DAY_3: "3 أيام",
  PERMANENT: "دائم",
  NETWORK: "حظر شبكة (الجهاز)",
};

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { q?: string; status?: string };
}) {
  const session = await getSession();
  const q = searchParams.q?.trim();
  const status = searchParams.status;

  const users = await prisma.user.findMany({
    where: {
      AND: [
        status ? { status: status as any } : {},
        q
          ? {
              OR: [
                { username: { contains: q } },
                { displayName: { contains: q } },
                { phone: { contains: q } },
              ],
            }
          : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { agency: true },
  });

  return (
    <>
      <Header
        title="إدارة المستخدمين"
        subtitle="بحث، حظر (يوم / 3 أيام / دائم / شبكة)، وتعديل البروفايل"
        adminName={session?.name || ""}
      />

      <div className="p-8 space-y-6">
        <form className="flex flex-wrap gap-2 items-center" action="/users">
          <input
            name="q"
            defaultValue={q}
            placeholder="ابحث بالاسم أو رقم الهاتف..."
            className="w-64 rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
          />
          <select
            name="status"
            defaultValue={status || ""}
            className="rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary"
          >
            <option value="">كل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="BANNED">محظور</option>
          </select>
          <button className="text-sm bg-gold text-base-bg font-bold rounded-lg px-4 py-2">
            بحث
          </button>
        </form>

        <div className="bg-base-surface border border-base-border rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-border text-text-muted text-xs">
                <th className="text-right font-medium px-5 py-3">المستخدم</th>
                <th className="text-right font-medium px-5 py-3">الهاتف</th>
                <th className="text-right font-medium px-5 py-3">الوكالة</th>
                <th className="text-right font-medium px-5 py-3">VIP</th>
                <th className="text-right font-medium px-5 py-3">الرصيد</th>
                <th className="text-right font-medium px-5 py-3">الحالة</th>
                <th className="text-right font-medium px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-base-border/60 last:border-0 align-top">
                  <td className="px-5 py-4">
                    <p className="text-text-primary font-medium">{u.displayName}</p>
                    <p className="text-text-muted text-xs" dir="ltr">
                      @{u.username}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-text-muted font-mono" dir="ltr">
                    {u.phone || "—"}
                  </td>
                  <td className="px-5 py-4 text-text-muted">{u.agency?.name || "—"}</td>
                  <td className="px-5 py-4">
                    {u.vipLevel > 0 ? (
                      <span className="text-gold font-mono text-xs">VIP {u.vipLevel}</span>
                    ) : (
                      <span className="text-text-muted text-xs">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-text-primary">
                    {u.coins.toLocaleString("en-US")}
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={u.status} />
                    {u.status === "BANNED" && u.banType && (
                      <p className="text-[11px] text-text-muted mt-1">
                        {BAN_LABELS[u.banType]}
                        {u.banExpiresAt &&
                          ` — حتى ${u.banExpiresAt.toLocaleDateString("ar-EG")}`}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 max-w-xs">
                      {u.status === "ACTIVE" ? (
                        <details className="relative">
                          <summary className="cursor-pointer list-none text-xs font-medium border rounded-lg px-3 py-1.5 bg-danger/10 text-danger border-danger/30 hover:bg-danger/20">
                            حظر
                          </summary>
                          <form
                            action={banUser}
                            className="absolute z-20 mt-2 w-56 bg-base-surface2 border border-base-border rounded-lg p-3 space-y-2 shadow-card"
                          >
                            <input type="hidden" name="id" value={u.id} />
                            <select
                              name="banType"
                              required
                              className="w-full text-xs bg-base-bg border border-base-border rounded-md px-2 py-1.5 text-text-primary"
                            >
                              <option value="DAY_1">حظر يوم واحد</option>
                              <option value="DAY_3">حظر 3 أيام</option>
                              <option value="PERMANENT">حظر دائم</option>
                              <option value="NETWORK">حظر شبكة (الجهاز)</option>
                            </select>
                            <input
                              name="banReason"
                              placeholder="سبب الحظر (اختياري)"
                              className="w-full text-xs bg-base-bg border border-base-border rounded-md px-2 py-1.5 text-text-primary placeholder:text-text-muted/50"
                            />
                            <ActionButton variant="danger">تأكيد الحظر</ActionButton>
                          </form>
                        </details>
                      ) : (
                        <form action={unbanUser}>
                          <input type="hidden" name="id" value={u.id} />
                          <ActionButton variant="success">رفع الحظر</ActionButton>
                        </form>
                      )}

                      <details className="relative">
                        <summary className="cursor-pointer list-none text-xs font-medium border rounded-lg px-3 py-1.5 bg-base-surface2 text-text-primary border-base-border hover:bg-base-border">
                          تعديل
                        </summary>
                        <form
                          action={updateUserProfile}
                          className="absolute z-20 mt-2 w-56 bg-base-surface2 border border-base-border rounded-lg p-3 space-y-2 shadow-card"
                        >
                          <input type="hidden" name="id" value={u.id} />
                          <input
                            name="displayName"
                            defaultValue={u.displayName}
                            placeholder="الاسم"
                            className="w-full text-xs bg-base-bg border border-base-border rounded-md px-2 py-1.5 text-text-primary"
                          />
                          <input
                            name="avatarUrl"
                            defaultValue={u.avatarUrl || ""}
                            placeholder="رابط الصورة"
                            dir="ltr"
                            className="w-full text-xs bg-base-bg border border-base-border rounded-md px-2 py-1.5 text-text-primary placeholder:text-text-muted/50"
                          />
                          <ActionButton variant="gold">حفظ</ActionButton>
                        </form>
                      </details>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-muted">
                    لا يوجد مستخدمون مطابقون
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
