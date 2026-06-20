import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL atau DIRECT_URL belum diatur.");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const users = [
  { id: "usr-admin", name: "Administrator", email: "admin@fasilitaslapor.test", password: "demo", role: "ADMIN" },
  { id: "usr-user", name: "Pengguna Demo", email: "user@fasilitaslapor.test", password: "demo", role: "USER" },
  { id: "usr-validator-1", name: "Rina Mahasiswa", email: "rina@example.test", password: "demo", role: "USER" },
  { id: "usr-validator-2", name: "Bima Warga", email: "bima@example.test", password: "demo", role: "USER" }
];

const reports = [
  {
    id: "RPT-001",
    userId: "usr-user",
    title: "Rambu lalu lintas roboh setelah tertabrak",
    category: "Transportasi",
    initialDamage: 4,
    description: "Rambu peringatan roboh dan menutup sebagian bahu jalan.",
    location: "Simpang Jalan Merdeka",
    photoUrl: "rambu-roboh.jpg",
    incidentDate: new Date("2026-06-01"),
    status: "SELESAI",
    duplicateCount: 1
  },
  {
    id: "RPT-002",
    userId: "usr-validator-1",
    title: "Jalan berlubang besar di depan Pasar Minggu",
    category: "Jalan",
    initialDamage: 4,
    description: "Lubang jalan cukup dalam dan membahayakan pengendara motor.",
    location: "Depan Pasar Minggu",
    photoUrl: "jalan-berlubang.jpg",
    incidentDate: new Date("2026-06-07"),
    status: "TERVALIDASI",
    duplicateCount: 4
  },
  {
    id: "RPT-003",
    userId: "usr-validator-2",
    title: "Lampu PJU mati di dekat halte sekolah",
    category: "Penerangan",
    initialDamage: 3,
    description: "Area halte menjadi gelap pada malam hari dan rawan kecelakaan.",
    location: "Halte Sekolah Nusa Putra",
    photoUrl: "pju-mati.jpg",
    incidentDate: new Date("2026-06-09"),
    status: "DIPROSES",
    duplicateCount: 2
  }
];

const validations = [
  { id: "VAL-001", reportId: "RPT-002", userId: "usr-user", severity: 4, decision: "KONFIRMASI" },
  { id: "VAL-002", reportId: "RPT-002", userId: "usr-validator-2", severity: 4, decision: "KONFIRMASI" },
  { id: "VAL-003", reportId: "RPT-003", userId: "usr-user", severity: 3, decision: "KONFIRMASI" }
];

async function main() {
  const passwordHash = await bcrypt.hash("demo123", 12);
  const usersWithHash = users.map((user) => ({ ...user, password: passwordHash }));

  await prisma.priorityWeight.upsert({
    where: { id: "default-weights" },
    update: { damage: 10, validation: 1.2, duplication: 3, time: 0.7 },
    create: { id: "default-weights", damage: 10, validation: 1.2, duplication: 3, time: 0.7 }
  });

  for (const user of usersWithHash) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user
    });
  }

  for (const report of reports) {
    await prisma.report.upsert({
      where: { id: report.id },
      update: report,
      create: report
    });
  }

  for (const validation of validations) {
    await prisma.validation.upsert({
      where: { userId_reportId: { userId: validation.userId, reportId: validation.reportId } },
      update: validation,
      create: validation
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
