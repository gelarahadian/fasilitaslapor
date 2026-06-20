import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(1, "Password wajib diisi")
});

export const registerSchema = z.object({
  name: z.string().trim().min(3, "Nama minimal 3 karakter").max(80, "Nama terlalu panjang"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter").max(128, "Password terlalu panjang")
});

export const reportCreateSchema = z.object({
  title: z.string().trim().min(5, "Judul minimal 5 karakter").max(140, "Judul terlalu panjang"),
  category: z.string().trim().min(2, "Kategori wajib diisi").max(60, "Kategori terlalu panjang"),
  initialDamage: z.coerce.number().int().min(1, "Tingkat kerusakan minimal 1").max(4, "Tingkat kerusakan maksimal 4"),
  description: z.string().trim().min(10, "Deskripsi minimal 10 karakter").max(2000, "Deskripsi terlalu panjang"),
  location: z.string().trim().min(3, "Lokasi wajib diisi").max(240, "Lokasi terlalu panjang"),
  incidentDate: z.string().refine((value) => !Number.isNaN(Date.parse(value)), "Tanggal kejadian tidak valid"),
  photoUrl: z.string().trim().max(500, "URL foto terlalu panjang").optional().nullable(),
  duplicateCount: z.coerce.number().int().min(0).max(999).optional().default(0)
});

export const validationCreateSchema = z.object({
  reportId: z.string().min(1, "Report ID wajib diisi"),
  severity: z.coerce.number().int().min(1, "Tingkat keparahan minimal 1").max(4, "Tingkat keparahan maksimal 4"),
  decision: z.enum(["KONFIRMASI", "TOLAK", "Konfirmasi", "Tolak"])
});

export const statusUpdateSchema = z.object({
  status: z.enum(["MENUNGGU_VALIDASI", "TERVALIDASI", "DIPROSES", "SELESAI", "DITOLAK", "Menunggu Validasi", "Tervalidasi", "Diproses", "Selesai", "Ditolak"])
});

export function validationMessage(error: z.ZodError) {
  return error.issues.map((issue) => issue.message).join(", ");
}
