import { logoutAction } from "@/app/(dashboard)/actions";

export function Header({
  title,
  subtitle,
  adminName,
}: {
  title: string;
  subtitle?: string;
  adminName: string;
}) {
  return (
    <header className="flex items-center justify-between px-8 py-5 border-b border-base-border bg-base-bg/80 backdrop-blur sticky top-0 z-10">
      <div>
        <h2 className="font-display font-bold text-xl text-text-primary">{title}</h2>
        {subtitle && <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-text-muted">
          مرحبًا، <span className="text-text-primary font-medium">{adminName}</span>
        </span>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-danger hover:text-danger/80 border border-danger/30 rounded-lg px-3 py-1.5 transition"
          >
            تسجيل الخروج
          </button>
        </form>
      </div>
    </header>
  );
}
