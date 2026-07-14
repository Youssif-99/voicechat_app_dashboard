import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="flex min-h-screen">
      <Sidebar role={session?.role || "ADMIN"} />
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
