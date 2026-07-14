import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { Header } from "@/components/Header";
import { StatusBadge } from "@/components/StatusBadge";
import { ActionButton } from "@/components/ActionButton";
import { banRoom, unbanRoom, updateRoomProfile } from "./actions";

export default async function RoomsPage() {
  const session = await getSession();

  const rooms = await prisma.room.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { owner: true },
  });

  return (
    <>
      <Header
        title="إدارة الغرف"
        subtitle="الحد الأقصى 20 مقعدًا لكل غرفة — تعديل الاسم والصورة أو الحظر"
        adminName={session?.name || ""}
      />

      <div className="p-8">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {rooms.map((r) => (
            <div
              key={r.id}
              className="bg-base-surface border border-base-border rounded-card shadow-card p-5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-text-primary font-display font-bold">{r.name}</p>
                  <p className="text-text-muted text-xs mt-0.5">
                    المالك: {r.owner.displayName}
                  </p>
                </div>
                <StatusBadge status={r.status} />
              </div>

              <div className="seat-ring w-full my-4">
                {Array.from({ length: r.seatsLimit }).map((_, i) => (
                  <div key={i} className={`seat-dot ${i < 12 ? "filled" : ""}`} />
                ))}
              </div>
              <p className="text-xs text-text-muted mb-4">
                الحد الأقصى {r.seatsLimit} مقعد · نوع الغرفة:{" "}
                {r.type === "PUBLIC" ? "عامة" : "خاصة"}
              </p>

              <div className="flex items-center gap-2">
                {r.status === "ACTIVE" ? (
                  <form action={banRoom}>
                    <input type="hidden" name="id" value={r.id} />
                    <ActionButton
                      variant="danger"
                      confirmMessage="هل تريد حظر هذه الغرفة؟"
                    >
                      حظر الغرفة
                    </ActionButton>
                  </form>
                ) : (
                  <form action={unbanRoom}>
                    <input type="hidden" name="id" value={r.id} />
                    <ActionButton variant="success">رفع الحظر</ActionButton>
                  </form>
                )}

                <details className="relative">
                  <summary className="cursor-pointer list-none text-xs font-medium border rounded-lg px-3 py-1.5 bg-base-surface2 text-text-primary border-base-border hover:bg-base-border">
                    تعديل الاسم / الصورة
                  </summary>
                  <form
                    action={updateRoomProfile}
                    className="absolute z-20 mt-2 w-56 bg-base-surface2 border border-base-border rounded-lg p-3 space-y-2 shadow-card"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <input
                      name="name"
                      defaultValue={r.name}
                      placeholder="اسم الغرفة"
                      className="w-full text-xs bg-base-bg border border-base-border rounded-md px-2 py-1.5 text-text-primary"
                    />
                    <input
                      name="coverUrl"
                      defaultValue={r.coverUrl || ""}
                      placeholder="رابط صورة الغلاف"
                      dir="ltr"
                      className="w-full text-xs bg-base-bg border border-base-border rounded-md px-2 py-1.5 text-text-primary placeholder:text-text-muted/50"
                    />
                    <ActionButton variant="gold">حفظ</ActionButton>
                  </form>
                </details>
              </div>
            </div>
          ))}
          {rooms.length === 0 && (
            <p className="text-text-muted col-span-full text-center py-10">
              لا توجد غرف بعد
            </p>
          )}
        </div>
      </div>
    </>
  );
}
