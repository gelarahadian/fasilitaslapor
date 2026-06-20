import type { Report, User, Validation } from "./types";
import { defaultWeights } from "./scoring";

export const seedUsers: User[] = [
  { id: "usr-admin", name: "Administrator", email: "admin@fasilitaslapor.test", role: "admin" },
  { id: "usr-user", name: "Pengguna Demo", email: "user@fasilitaslapor.test", role: "user" },
  { id: "usr-validator-1", name: "Rina Mahasiswa", email: "rina@example.test", role: "user" },
  { id: "usr-validator-2", name: "Bima Warga", email: "bima@example.test", role: "user" }
];

export const seedReports: Report[] = [
  {
    id: "RPT-001",
    userId: "usr-user",
    reporterName: "Pengguna Demo",
    title: "Rambu lalu lintas roboh setelah tertabrak",
    category: "Transportasi",
    initialDamage: 4,
    description: "Rambu peringatan roboh dan menutup sebagian bahu jalan.",
    location: "Simpang Jalan Merdeka",
    photoName: "rambu-roboh.jpg",
    incidentDate: "2026-06-01",
    status: "Selesai",
    duplicateCount: 1,
    priorityScore: 0,
    createdAt: "2026-06-01T04:00:00.000Z"
  },
  {
    id: "RPT-002",
    userId: "usr-validator-1",
    reporterName: "Rina Mahasiswa",
    title: "Jalan berlubang besar di depan Pasar Minggu",
    category: "Jalan",
    initialDamage: 4,
    description: "Lubang jalan cukup dalam dan membahayakan pengendara motor.",
    location: "Depan Pasar Minggu",
    photoName: "jalan-berlubang.jpg",
    incidentDate: "2026-06-07",
    status: "Tervalidasi",
    duplicateCount: 4,
    priorityScore: 0,
    createdAt: "2026-06-07T04:00:00.000Z"
  },
  {
    id: "RPT-003",
    userId: "usr-validator-2",
    reporterName: "Bima Warga",
    title: "Lampu PJU mati di dekat halte sekolah",
    category: "Penerangan",
    initialDamage: 3,
    description: "Area halte menjadi gelap pada malam hari dan rawan kecelakaan.",
    location: "Halte Sekolah Nusa Putra",
    photoName: "pju-mati.jpg",
    incidentDate: "2026-06-09",
    status: "Diproses",
    duplicateCount: 2,
    priorityScore: 0,
    createdAt: "2026-06-09T04:00:00.000Z"
  },
  {
    id: "RPT-004",
    userId: "usr-user",
    reporterName: "Pengguna Demo",
    title: "Drainase tersumbat menyebabkan banjir lokal",
    category: "Drainase",
    initialDamage: 3,
    description: "Air menggenang saat hujan karena saluran tertutup sampah.",
    location: "Jalan Melati Blok C",
    photoName: "drainase.jpg",
    incidentDate: "2026-06-11",
    status: "Menunggu Validasi",
    duplicateCount: 3,
    priorityScore: 0,
    createdAt: "2026-06-11T04:00:00.000Z"
  },
  {
    id: "RPT-005",
    userId: "usr-validator-1",
    reporterName: "Rina Mahasiswa",
    title: "Bangku taman rusak dan patah",
    category: "Taman",
    initialDamage: 1,
    description: "Bangku tidak dapat digunakan dan bagian kayu patah.",
    location: "Taman Kota Utara",
    photoName: "bangku-rusak.jpg",
    incidentDate: "2026-06-12",
    status: "Ditolak",
    duplicateCount: 0,
    priorityScore: 0,
    createdAt: "2026-06-12T04:00:00.000Z"
  }
];

export const seedValidations: Validation[] = [
  { id: "VAL-001", reportId: "RPT-002", userId: "usr-user", userName: "Pengguna Demo", severity: 4, decision: "Konfirmasi", createdAt: "2026-06-08T05:00:00.000Z" },
  { id: "VAL-002", reportId: "RPT-002", userId: "usr-validator-2", userName: "Bima Warga", severity: 4, decision: "Konfirmasi", createdAt: "2026-06-08T07:00:00.000Z" },
  { id: "VAL-003", reportId: "RPT-003", userId: "usr-user", userName: "Pengguna Demo", severity: 3, decision: "Konfirmasi", createdAt: "2026-06-10T05:00:00.000Z" },
  { id: "VAL-004", reportId: "RPT-004", userId: "usr-validator-1", userName: "Rina Mahasiswa", severity: 3, decision: "Konfirmasi", createdAt: "2026-06-12T05:00:00.000Z" },
  { id: "VAL-005", reportId: "RPT-005", userId: "usr-user", userName: "Pengguna Demo", severity: 1, decision: "Tolak", createdAt: "2026-06-13T05:00:00.000Z" }
];

export const seedWeights = defaultWeights;
