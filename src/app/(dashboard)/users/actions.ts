"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function banExpiryFor(type: string): Date | null {
  const now = new Date();
  if (type === "DAY_1") return new Date(now.getTime() + 24 * 60 * 60 * 1000);
  if (type === "DAY_3") return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  return null; // PERMANENT / NETWORK have no expiry
}

export async function banUser(formData: FormData) {
  const id = String(formData.get("id"));
  const banType = String(formData.get("banType"));
  const banReason = String(formData.get("banReason") || "").trim() || null;

  await prisma.user.update({
    where: { id },
    data: {
      status: "BANNED",
      banType,
      banReason,
      banExpiresAt: banExpiryFor(banType),
    },
  });
  revalidatePath("/users");
  revalidatePath("/dashboard");
}

export async function unbanUser(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.user.update({
    where: { id },
    data: { status: "ACTIVE", banType: null, banReason: null, banExpiresAt: null },
  });
  revalidatePath("/users");
  revalidatePath("/dashboard");
}

export async function updateUserProfile(formData: FormData) {
  const id = String(formData.get("id"));
  const displayName = String(formData.get("displayName") || "").trim();
  const avatarUrl = String(formData.get("avatarUrl") || "").trim() || null;

  if (!displayName) return;

  await prisma.user.update({
    where: { id },
    data: { displayName, avatarUrl },
  });
  revalidatePath("/users");
}
