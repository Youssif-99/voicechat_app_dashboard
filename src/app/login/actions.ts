"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, verifyPassword } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    return { error: "من فضلك أدخل البريد الإلكتروني وكلمة المرور" };
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    return { error: "بيانات الدخول غير صحيحة" };
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    return { error: "بيانات الدخول غير صحيحة" };
  }

  await createSession({
    adminId: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  });

  redirect("/dashboard");
}
