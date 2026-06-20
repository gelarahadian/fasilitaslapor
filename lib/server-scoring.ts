import type { Prisma } from "@prisma/client";

type ReportForScore = {
  id: string;
  initialDamage: number;
  duplicateCount: number;
  createdAt: Date;
  status: string;
  validations: Array<{
    severity: number;
    decision: string;
  }>;
};

type WeightForScore = {
  damage: Prisma.Decimal | number;
  validation: Prisma.Decimal | number;
  duplication: Prisma.Decimal | number;
  time: Prisma.Decimal | number;
};

function numberValue(value: Prisma.Decimal | number) {
  return typeof value === "number" ? value : value.toNumber();
}

export function calculateServerPriority(report: ReportForScore, weights: WeightForScore) {
  if (report.status === "DITOLAK" || report.status === "SELESAI") return 0;

  const confirmations = report.validations.filter((validation) => validation.decision === "KONFIRMASI");
  const severity = confirmations.length
    ? confirmations.reduce((sum, validation) => sum + validation.severity, 0) / confirmations.length
    : report.initialDamage;
  const ageDays = Math.max(0, Math.floor((Date.now() - report.createdAt.getTime()) / 86400000));

  return Number((
    numberValue(weights.damage) * severity +
    numberValue(weights.validation) * confirmations.length +
    numberValue(weights.duplication) * report.duplicateCount +
    numberValue(weights.time) * ageDays
  ).toFixed(2));
}
