export type Role = "user" | "admin";

export type ReportStatus =
  | "Menunggu Validasi"
  | "Tervalidasi"
  | "Diproses"
  | "Selesai"
  | "Ditolak";

export type ValidationDecision = "Konfirmasi" | "Tolak";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

export type Validation = {
  id: string;
  reportId: string;
  userId: string;
  userName: string;
  severity: number;
  decision: ValidationDecision;
  createdAt: string;
};

export type Report = {
  id: string;
  userId: string;
  reporterName: string;
  title: string;
  category: string;
  initialDamage: number;
  description: string;
  location: string;
  photoName?: string;
  incidentDate: string;
  status: ReportStatus;
  duplicateCount: number;
  priorityScore: number;
  createdAt: string;
};

export type PriorityWeights = {
  damage: number;
  validation: number;
  duplication: number;
  time: number;
};
