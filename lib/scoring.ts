import type { PriorityWeights, Report, Validation } from "./types";

export const defaultWeights: PriorityWeights = {
  damage: 10,
  validation: 1.2,
  duplication: 3,
  time: 0.7
};

export function averageSeverity(report: Report, validations: Validation[]) {
  const related = validations.filter((validation) => validation.reportId === report.id && validation.decision === "Konfirmasi");
  if (!related.length) return report.initialDamage;

  const total = related.reduce((sum, validation) => sum + validation.severity, 0);
  return Number((total / related.length).toFixed(2));
}

export function reportAgeDays(report: Report) {
  const created = new Date(report.createdAt).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - created) / 86400000));
  return days;
}

export function calculatePriority(report: Report, validations: Validation[], weights: PriorityWeights) {
  if (report.status === "Ditolak" || report.status === "Selesai") return 0;

  const validationCount = validations.filter((validation) => validation.reportId === report.id && validation.decision === "Konfirmasi").length;
  const score =
    weights.damage * averageSeverity(report, validations) +
    weights.validation * validationCount +
    weights.duplication * report.duplicateCount +
    weights.time * reportAgeDays(report);

  return Number(score.toFixed(2));
}

export function recalculateReports(reports: Report[], validations: Validation[], weights: PriorityWeights) {
  return reports.map((report) => ({
    ...report,
    priorityScore: calculatePriority(report, validations, weights)
  }));
}
