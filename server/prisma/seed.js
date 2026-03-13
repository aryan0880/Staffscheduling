import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const staffUsers = [
  { name: "Alice Brown", email: "alice@ssms.com", department: "Operations", initials: "AB", contact: "+1-555-0101", availability: "Full-time" },
  { name: "Bob Kumar", email: "bob@ssms.com", department: "Security", initials: "BK", contact: "+1-555-0102", availability: "Part-time" },
  { name: "Carol Lee", email: "carol@ssms.com", department: "Maintenance", initials: "CL", contact: "+1-555-0103", availability: "Full-time" },
  { name: "David Patel", email: "david@ssms.com", department: "Reception", initials: "DP", contact: "+1-555-0104", availability: "Full-time" },
  { name: "Emma Wilson", email: "emma@ssms.com", department: "Operations", initials: "EW", contact: "+1-555-0105", availability: "On-call" },
  { name: "Frank Davis", email: "frank@ssms.com", department: "IT", initials: "FD", contact: "+1-555-0106", availability: "Full-time" },
  { name: "Grace Kim", email: "grace@ssms.com", department: "HR", initials: "GK", contact: "+1-555-0107", availability: "Part-time" },
  { name: "Henry Johnson", email: "henry@ssms.com", department: "Finance", initials: "HJ", contact: "+1-555-0108", availability: "Full-time" },
  { name: "Isla Martinez", email: "isla@ssms.com", department: "Operations", initials: "IM", contact: "+1-555-0109", availability: "On-call" },
  { name: "James Carter", email: "james@ssms.com", department: "Security", initials: "JC", contact: "+1-555-0110", availability: "Full-time" }
];

const shifts = [
  { name: "Morning Shift", startTime: "06:00", endTime: "14:00", type: "Regular", staffCount: 12 },
  { name: "Afternoon Shift", startTime: "14:00", endTime: "22:00", type: "Regular", staffCount: 10 },
  { name: "Night Shift", startTime: "22:00", endTime: "06:00", type: "Regular", staffCount: 6 },
  { name: "Weekend Morning", startTime: "07:00", endTime: "15:00", type: "Weekend", staffCount: 5 },
  { name: "Split Shift A", startTime: "08:00", endTime: "12:00", type: "Split", staffCount: 4 },
  { name: "Late Evening", startTime: "18:00", endTime: "00:00", type: "Regular", staffCount: 7 }
];

function atMidnight(dateStr) {
  // dateStr = YYYY-MM-DD
  return new Date(`${dateStr}T00:00:00.000Z`);
}

async function main() {
  const adminHash = await bcrypt.hash("admin123", 10);
  const staffHash = await bcrypt.hash("staff123", 10);

  await prisma.user.upsert({
    where: { email: "admin@ssms.com" },
    update: {},
    create: {
      role: "admin",
      name: "Admin User",
      email: "admin@ssms.com",
      passwordHash: adminHash,
      department: "Administration"
    }
  });

  for (const s of staffUsers) {
    await prisma.user.upsert({
      where: { email: s.email },
      update: { name: s.name, department: s.department, contact: s.contact, availability: s.availability },
      create: {
        role: "staff",
        name: s.name,
        email: s.email,
        passwordHash: staffHash,
        department: s.department,
        contact: s.contact,
        availability: s.availability
      }
    });
  }

  for (const sh of shifts) {
    await prisma.shift.upsert({
      where: { name: sh.name },
      update: { startTime: sh.startTime, endTime: sh.endTime, type: sh.type, staffCount: sh.staffCount },
      create: sh
    });
  }

  // A few demo leave requests + assignments for dashboards
  const alice = await prisma.user.findUnique({ where: { email: "alice@ssms.com" } });
  const bob = await prisma.user.findUnique({ where: { email: "bob@ssms.com" } });
  const morning = await prisma.shift.findUnique({ where: { name: "Morning Shift" } });
  const afternoon = await prisma.shift.findUnique({ where: { name: "Afternoon Shift" } });

  if (alice && morning) {
    await prisma.leaveRequest.upsert({
      where: { id: 1 },
      update: {},
      create: {
        userId: alice.id,
        fromDate: atMidnight("2025-03-10"),
        toDate: atMidnight("2025-03-12"),
        reason: "Medical appointment",
        status: "pending"
      }
    }).catch(() => {});

    await prisma.assignment.upsert({
      where: { userId_date: { userId: alice.id, date: atMidnight("2025-02-26") } },
      update: { shiftId: morning.id },
      create: { userId: alice.id, shiftId: morning.id, date: atMidnight("2025-02-26") }
    });
  }

  if (bob && afternoon) {
    await prisma.assignment.upsert({
      where: { userId_date: { userId: bob.id, date: atMidnight("2025-02-26") } },
      update: { shiftId: afternoon.id },
      create: { userId: bob.id, shiftId: afternoon.id, date: atMidnight("2025-02-26") }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

