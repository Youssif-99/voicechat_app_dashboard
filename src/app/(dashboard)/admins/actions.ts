"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { hashPassword, getSession } from "@/lib/auth";

async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    throw new Error("غير مصرح لك بهذا الإجراء");
  }
}

export async function createAdmin(formData: FormData) {
  await requireSuperAdmin();

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "ADMIN");

  if (!name || !email || password.length < 6) return;

  const passwordHash = await hashPassword(password);

  await prisma.admin.create({
    data: { name, email, passwordHash, role },
  });
  revalidatePath("/admins");
}

export async function deleteAdmin(formData: FormData) {
  await requireSuperAdmin();
  const id = String(formData.get("id"));
  await prisma.admin.delete({ where: { id } });
  revalidatePath("/admins");
}
