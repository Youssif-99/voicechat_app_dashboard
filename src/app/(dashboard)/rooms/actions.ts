"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function banRoom(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.room.update({ where: { id }, data: { status: "BANNED" } });
  revalidatePath("/rooms");
}

export async function unbanRoom(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.room.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath("/rooms");
}

export async function updateRoomProfile(formData: FormData) {
  const id = String(formData.get("id"));
  const name = String(formData.get("name") || "").trim();
  const coverUrl = String(formData.get("coverUrl") || "").trim() || null;

  if (!name) return;

  await prisma.room.update({ where: { id }, data: { name, coverUrl } });
  revalidatePath("/rooms");
}
