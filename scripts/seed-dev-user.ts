#!/usr/bin/env ts-node

/**
 * Seed script to create a dev user for testing
 *
 * Usage: npx ts-node scripts/seed-dev-user.ts
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seedDevUser() {
  try {
    console.log("🌱 Seeding dev user...");

    // Check if dev user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: "dev@notes-app.local" },
    });

    if (existingUser) {
      console.log("✅ Dev user already exists!");
      console.log("📧 Email: dev@notes-app.local");
      console.log("🔑 Password: dev123456");
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash("dev123456", 10);

    // Create dev user
    const devUser = await prisma.user.create({
      data: {
        email: "dev@notes-app.local",
        password: hashedPassword,
        name: "Dev User",
      },
    });

    console.log("✅ Dev user created successfully!");
    console.log("📧 Email: dev@notes-app.local");
    console.log("🔑 Password: dev123456");
    console.log("👤 User ID:", devUser.id);
  } catch (error) {
    console.error("❌ Error seeding dev user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDevUser();
