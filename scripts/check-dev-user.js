const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkDevUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "dev@notes-app.local" },
    });

    if (user) {
      console.log("✅ Dev user found:");
      console.log("   Email:", user.email);
      console.log("   Name:", user.name);
      console.log("   Has Password:", user.password ? "Yes" : "No");
      console.log("   Password Length:", user.password?.length);
    } else {
      console.log("❌ Dev user NOT found!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDevUser();
