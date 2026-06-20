import { NextResponse } from "next/server";
import type { ReportStatus, ValidationDecision } from "@/lib/types";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function requiredString(value: unknown, field: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${field} wajib diisi`);
  }
  return value.trim();
}

export function requiredNumber(value: unknown, field: string) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`${field} harus berupa angka`);
  }
  return number;
}

export function toPrismaStatus(status: ReportStatus | string) {
  const map: Record<string, string> = {
    "Menunggu Validasi": "MENUNGGU_VALIDASI",
    Tervalidasi: "TERVALIDASI",
    Diproses: "DIPROSES",
    Selesai: "SELESAI",
    Ditolak: "DITOLAK",
    MENUNGGU_VALIDASI: "MENUNGGU_VALIDASI",
    TERVALIDASI: "TERVALIDASI",
    DIPROSES: "DIPROSES",
    SELESAI: "SELESAI",
    DITOLAK: "DITOLAK"
  };
  return map[status] || "MENUNGGU_VALIDASI";
}

export function fromPrismaStatus(status: string): ReportStatus {
  const map: Record<string, ReportStatus> = {
    MENUNGGU_VALIDASI: "Menunggu Validasi",
    TERVALIDASI: "Tervalidasi",
    DIPROSES: "Diproses",
    SELESAI: "Selesai",
    DITOLAK: "Ditolak"
  };
  return map[status] || "Menunggu Validasi";
}

export function toPrismaDecision(decision: ValidationDecision | string) {
  return decision === "Tolak" || decision === "TOLAK" ? "TOLAK" : "KONFIRMASI";
}

export function fromPrismaDecision(decision: string): ValidationDecision {
  return decision === "TOLAK" ? "Tolak" : "Konfirmasi";
}
