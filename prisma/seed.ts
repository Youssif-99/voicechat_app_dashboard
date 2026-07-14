import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // -- حساب السوبر أدمن الأول --
  const passwordHash = await bcrypt.hash("admin123", 10);
  await prisma.admin.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "مدير النظام",
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // -- وكالات تجريبية --
  const agencyGold = await prisma.agency.create({
    data: {
      name: "وكالة النجوم الذهبية",
      ownerName: "أحمد سالم",
      phone: "+201000000001",
      email: "gold-agency@example.com",
      status: "APPROVED",
      level: "ذهبي",
      commissionRate: 0.4,
      totalEarnings: 12500.5,
      reviewedAt: new Date(),
    },
  });

  const agencyPending1 = await prisma.agency.create({
    data: {
      name: "وكالة الأمل",
      ownerName: "منى فريد",
      phone: "+201000000002",
      email: "hope-agency@example.com",
      status: "PENDING",
    },
  });

  await prisma.agency.create({
    data: {
      name: "وكالة الصقور",
      ownerName: "خالد يوسف",
      phone: "+201000000003",
      status: "PENDING",
      notes: "لديهم خبرة سابقة في تطبيقات مشابهة",
    },
  });

  // -- مستخدمون تجريبيون --
  const host1 = await prisma.user.create({
    data: {
      username: "sara_voice",
      displayName: "سارة",
      phone: "+201111111111",
      coins: 45000,
      vipLevel: 3,
      isAgent: false,
      isHost: true,
      agencyId: agencyGold.id,
    },
  });

  const host2 = await prisma.user.create({
    data: {
      username: "omar_live",
      displayName: "عمر",
      phone: "+201111111112",
      coins: 12000,
      vipLevel: 1,
      isHost: true,
      agencyId: agencyGold.id,
    },
  });

  await prisma.user.create({
    data: {
      username: "layla_chat",
      displayName: "ليلى",
      phone: "+201111111113",
      coins: 3000,
      agencyId: agencyPending1.id,
    },
  });

  const bannedUser = await prisma.user.create({
    data: {
      username: "troll_2024",
      displayName: "مستخدم مخالف",
      phone: "+201111111114",
      status: "BANNED",
      banType: "DAY_3",
      banReason: "إساءة داخل الغرفة",
      banExpiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const regularUser = await prisma.user.create({
    data: {
      username: "user_normal",
      displayName: "مستخدم عادي",
      phone: "+201111111115",
      coins: 500,
    },
  });

  // -- غرف تجريبية --
  await prisma.room.create({
    data: {
      name: "غرفة الأصدقاء",
      ownerId: host1.id,
      type: "PUBLIC",
      seatsLimit: 20,
    },
  });

  await prisma.room.create({
    data: {
      name: "سهرة VIP",
      ownerId: host2.id,
      type: "PRIVATE",
      seatsLimit: 20,
      status: "ACTIVE",
    },
  });

  // -- معاملات مالية تجريبية --
  await prisma.payment.createMany({
    data: [
      {
        userId: regularUser.id,
        type: "COIN_PURCHASE",
        amount: 9.99,
        description: "باقة 1000 عملة",
      },
      {
        userId: host1.id,
        type: "VIP_SUBSCRIPTION",
        amount: 29.99,
        description: "اشتراك VIP شهري - مستوى 3",
      },
      {
        userId: host2.id,
        type: "GIFT",
        amount: 4.5,
        description: "هدية وردة داخل الغرفة",
      },
      {
        userId: host1.id,
        type: "FRAME_PURCHASE",
        amount: 6.0,
        description: "إطار بروفايل ذهبي",
      },
      {
        userId: bannedUser.id,
        type: "ENTRANCE_PURCHASE",
        amount: 3.0,
        description: "دخولية مميزة",
        status: "REFUNDED",
      },
      {
        userId: host1.id,
        type: "AGENT_COMMISSION",
        amount: 120.0,
        description: "عمولة نشاط شهري - وكالة النجوم الذهبية",
      },
    ],
  });

  console.log("تمت تهيئة قاعدة البيانات ببيانات تجريبية بنجاح ✅");
  console.log("بيانات الدخول: admin@example.com / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
