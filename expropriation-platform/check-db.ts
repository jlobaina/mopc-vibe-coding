import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkDb() {
  try {
    const departments = await prisma.department.findMany();
    console.log("Departments:");
    departments.forEach(d => console.log(`- ${d.id}: ${d.name}`));

    const users = await prisma.user.findMany();
    console.log("\nUsers:");
    users.forEach(u => console.log(`- ${u.id}: ${u.email}`));

    const cases = await prisma.case.findMany();
    console.log("\nCases:");
    cases.forEach(c => console.log(`- ${c.id}: ${c.fileNumber}`));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDb();