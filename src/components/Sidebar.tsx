import Link from "next/link";

const NAV_ITEMS = [
  { href: "/dashboard", label: "نظرة عامة", icon: "◈" },
  { href: "/agencies", label: "طلبات الوكالات", icon: "🛡" },
  { href: "/payments", label: "المدفوعات والأرباح", icon: "◎" },
  { href: "/users", label: "المستخدمون", icon: "◍" },
  { href: "/rooms", label: "الغرف", icon: "◌" },
  { href: "/admins", label: "المشرفون", icon: "⬡", superOnly: true },
];

export function Sidebar({ role }: { role: string }) {
  return (
    <aside className="w-64 shrink-0 bg-base-surface border-l border-base-border flex flex-col h-screen sticky top-0">
      <div className="px-5 py-6 border-b border-base-border">
        <div className="seat-ring w-16 mb-3">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className={`seat-dot ${i < 14 ? "filled" : ""}`} />
          ))}
        </div>
        <h1 className="font-display font-extrabold text-lg text-text-primary leading-tight">
          لوحة تحكم
          <br />
          التطبيق
        </h1>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.filter((item) => !item.superOnly || role === "SUPER_ADMIN").map(
          (item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-base-surface2 transition text-sm font-medium"
            >
              <span className="text-gold">{item.icon}</span>
              {item.label}
            </Link>
          )
        )}
      </nav>

      <div className="px-5 py-4 border-t border-base-border text-xs text-text-muted">
        الدور الحالي:{" "}
        <span className="text-gold font-medium">
          {role === "SUPER_ADMIN" ? "سوبر أدمن" : "أدمن"}
        </span>
      </div>
    </aside>
  );
}
