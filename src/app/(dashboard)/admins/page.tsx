import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { ActionButton } from "@/components/ActionButton";
import { createAdmin, deleteAdmin } from "./actions";

export default async function AdminsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "SUPER_ADMIN") redirect("/dashboard");

  const admins = await prisma.admin.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <>
      <Header
        title="المشرفون"
        subtitle="إدارة حسابات السوبر أدمن والأدمن على اللوحة"
        adminName={session.name}
      />

      <div className="p-8 space-y-6">
        <details className="bg-base-surface border border-base-border rounded-card shadow-card">
          <summary className="cursor-pointer px-6 py-4 font-display font-bold text-text-primary list-none">
            + إضافة مشرف جديد
          </summary>
          <form action={createAdmin} className="px-6 pb-6 grid md:grid-cols-4 gap-3">
            <input
              name="name"
              required
              placeholder="الاسم"
              className="rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
            />
            <input
              name="email"
              type="email"
              required
              dir="ltr"
              placeholder="البريد الإلكتروني"
              className="rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
            />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              dir="ltr"
              placeholder="كلمة المرور (6 أحرف على الأقل)"
              className="rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary placeholder:text-text-muted/50"
            />
            <select
              name="role"
              className="rounded-lg bg-base-surface2 border border-base-border px-3 py-2 text-sm text-text-primary"
            >
              <option value="ADMIN">أدمن</option>
              <option value="SUPER_ADMIN">سوبر أدمن</option>
            </select>
            <button
              type="submit"
              className="md:col-span-4 bg-gold text-base-bg font-bold rounded-lg py-2 text-sm"
            >
              إضافة المشرف
            </button>
          </form>
        </details>

        <div className="bg-base-surface border border-base-border rounded-card shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-base-border text-text-muted text-xs">
                <th className="text-right font-medium px-5 py-3">الاسم</th>
                <th className="text-right font-medium px-5 py-3">البريد الإلكتروني</th>
                <th className="text-right font-medium px-5 py-3">الدور</th>
                <th className="text-right font-medium px-5 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id} className="border-b border-base-border/60 last:border-0">
                  <td className="px-5 py-4 text-text-primary">{a.name}</td>
                  <td className="px-5 py-4 text-text-muted font-mono" dir="ltr">
                    {a.email}
                  </td>
                  <td className="px-5 py-4 text-text-muted">
                    {a.role === "SUPER_ADMIN" ? "سوبر أدمن" : "أدمن"}
                  </td>
                  <td className="px-5 py-4">
                    {a.id !== session.adminId && (
                      <form action={deleteAdmin}>
                        <input type="hidden" name="id" value={a.id} />
                        <ActionButton
                          variant="danger"
                          confirmMessage="هل تريد حذف هذا المشرف؟"
                        >
                          حذف
                        </ActionButton>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
