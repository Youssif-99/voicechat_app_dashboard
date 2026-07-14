"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function approveAgency(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.agency.update({
    where: { id },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });
  revalidatePath("/agencies");
  revalidatePath("/dashboard");
}

export async function rejectAgency(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.agency.update({
    where: { id },
    data: { status: "REJECTED", reviewedAt: new Date() },
  });
  revalidatePath("/agencies");
  revalidatePath("/dashboard");
}

export async function suspendAgency(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.agency.update({
    where: { id },
    data: { status: "SUSPENDED", reviewedAt: new Date() },
  });
  revalidatePath("/agencies");
}

export async function reactivateAgency(formData: FormData) {
  const id = String(formData.get("id"));
  await prisma.agency.update({
    where: { id },
    data: { status: "APPROVED", reviewedAt: new Date() },
  });
  revalidatePath("/agencies");
}

export async function updateAgencyLevel(formData: FormData) {
  const id = String(formData.get("id"));
  const level = String(formData.get("level"));
  const commissionRate = Number(formData.get("commissionRate"));
  await prisma.agency.update({
    where: { id },
    data: { level, commissionRate },
  });
  revalidatePath("/agencies");
}

export async function createAgencyRequest(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const ownerName = String(formData.get("ownerName") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const email = String(formData.get("email") || "").trim() || null;
  const notes = String(formData.get("notes") || "").trim() || null;

  if (!name || !ownerName || !phone) return;

  await prisma.agency.create({
    data: { name, ownerName, phone, email, notes, status: "PENDING" },
  });
  revalidatePath("/agencies");
}
