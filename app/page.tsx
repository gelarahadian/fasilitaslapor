"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthPanel } from "@/components/auth-panel";
import { Dashboard } from "@/components/dashboard";
import { ReportForm, type ReportFormPayload } from "@/components/report-form";
import { ReportsTable } from "@/components/reports-table";
import { ValidationPanel } from "@/components/validation-panel";
import { ScoringPanel } from "@/components/scoring-panel";
import { UserManagement } from "@/components/user-management";
import { seedReports, seedUsers, seedValidations, seedWeights } from "@/lib/seed";
import { recalculateReports } from "@/lib/scoring";
import type { PriorityWeights, Report, ReportStatus, User, Validation, ValidationDecision } from "@/lib/types";

type View = "dashboard" | "lapor" | "daftar" | "validasi" | "scoring" | "users";

type ApiValidation = {
  id: string;
  reportId: string;
  userId: string;
  severity: number;
  decision: "KONFIRMASI" | "TOLAK";
  createdAt: string;
  user?: { name: string };
};

type ApiReport = {
  id: string;
  userId: string;
  title: string;
  category: string;
  initialDamage: number;
  description: string;
  location: string;
  photoUrl?: string | null;
  incidentDate: string;
  status: "MENUNGGU_VALIDASI" | "TERVALIDASI" | "DIPROSES" | "SELESAI" | "DITOLAK";
  duplicateCount: number;
  priorityScore: string | number;
  createdAt: string;
  user?: { name: string };
  validations: ApiValidation[];
};

const storageKey = "fasilitaslapor.weights.v1";

const statusFromApi: Record<ApiReport["status"], ReportStatus> = {
  MENUNGGU_VALIDASI: "Menunggu Validasi",
  TERVALIDASI: "Tervalidasi",
  DIPROSES: "Diproses",
  SELESAI: "Selesai",
  DITOLAK: "Ditolak"
};

const statusToApi: Record<ReportStatus, ApiReport["status"]> = {
  "Menunggu Validasi": "MENUNGGU_VALIDASI",
  Tervalidasi: "TERVALIDASI",
  Diproses: "DIPROSES",
  Selesai: "SELESAI",
  Ditolak: "DITOLAK"
};

const decisionToApi: Record<ValidationDecision, string> = {
  Konfirmasi: "KONFIRMASI",
  Tolak: "TOLAK"
};

type AppState = {
  users: User[];
  reports: Report[];
  validations: Validation[];
  weights: PriorityWeights;
};

function initialState(): AppState {
  const reports = recalculateReports(seedReports, seedValidations, seedWeights);
  return { users: seedUsers, reports, validations: seedValidations, weights: seedWeights };
}

function mapReports(apiReports: ApiReport[]) {
  const reports: Report[] = apiReports.map((report) => ({
    id: report.id,
    userId: report.userId,
    reporterName: report.user?.name || "Pengguna",
    title: report.title,
    category: report.category,
    initialDamage: report.initialDamage,
    description: report.description,
    location: report.location,
    photoName: report.photoUrl || "",
    incidentDate: report.incidentDate.slice(0, 10),
    status: statusFromApi[report.status],
    duplicateCount: report.duplicateCount,
    priorityScore: Number(report.priorityScore),
    createdAt: report.createdAt
  }));

  const validations: Validation[] = apiReports.flatMap((report) =>
    report.validations.map((validation) => ({
      id: validation.id,
      reportId: validation.reportId,
      userId: validation.userId,
      userName: validation.user?.name || "Validator",
      severity: validation.severity,
      decision: validation.decision === "TOLAK" ? "Tolak" : "Konfirmasi",
      createdAt: validation.createdAt
    }))
  );

  return { reports, validations };
}

export default function Home() {
  const [state, setState] = useState<AppState>(initialState);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [view, setView] = useState<View>("dashboard");

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      setState((previous) => ({ ...previous, weights: JSON.parse(saved) }));
    }

    fetch("/api/auth/me")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.user) setCurrentUser(payload.user);
      })
      .finally(() => setAuthChecking(false));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(state.weights));
  }, [state.weights]);

  useEffect(() => {
    if (currentUser) void loadRemoteData(currentUser);
  }, [currentUser]);

  async function loadRemoteData(user = currentUser) {
    if (!user) return;
    setDataLoading(true);

    try {
      const [reportsResponse, usersResponse] = await Promise.all([
        fetch("/api/reports"),
        user.role === "admin" ? fetch("/api/users") : Promise.resolve(null)
      ]);

      if (reportsResponse.ok) {
        const payload = await reportsResponse.json();
        const mapped = mapReports(payload.reports || []);
        setState((previous) => ({ ...previous, reports: mapped.reports, validations: mapped.validations }));
      }

      if (usersResponse && usersResponse.ok) {
        const payload = await usersResponse.json();
        setState((previous) => ({ ...previous, users: payload.users || previous.users }));
      }
    } finally {
      setDataLoading(false);
    }
  }

  const rankedReports = useMemo(
    () => [...state.reports].sort((a, b) => b.priorityScore - a.priorityScore),
    [state.reports]
  );

  function persistWeights(weights: PriorityWeights) {
    setState((previous) => ({ ...previous, weights }));
  }

  async function handleLogin(payload: { email: string; password: string; mode: "login" | "register"; name?: string }) {
    const endpoint = payload.mode === "register" ? "/api/auth/register" : "/api/auth/login";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Autentikasi gagal");
    }

    setCurrentUser(result.user);
    setState((previous) => ({
      ...previous,
      users: previous.users.some((user) => user.id === result.user.id) ? previous.users : [...previous.users, result.user]
    }));
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
  }

  async function addReport(report: ReportFormPayload) {
    let photoUrl: string | null = null;

    if (report.photoFile) {
      const uploadData = new FormData();
      uploadData.append("file", report.photoFile);
      const uploadResponse = await fetch("/api/uploads/report-photo", {
        method: "POST",
        body: uploadData
      });
      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        throw new Error(uploadResult.error || "Upload foto gagal");
      }

      photoUrl = uploadResult.url;
    }

    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...report, photoFile: undefined, photoUrl })
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Laporan gagal disimpan");
    }

    await loadRemoteData();
    setView("daftar");
  }

  async function addValidation(reportId: string, severity: number, decision: ValidationDecision) {
    const response = await fetch("/api/validations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reportId, severity, decision: decisionToApi[decision] })
    });

    if (response.ok) await loadRemoteData();
  }

  async function updateStatus(reportId: string, status: ReportStatus) {
    const response = await fetch(`/api/reports/${reportId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: statusToApi[status] })
    });

    if (response.ok) await loadRemoteData();
  }

  if (authChecking) {
    return <main className="loadingPage">Memuat sesi...</main>;
  }

  if (!currentUser) {
    return <AuthPanel onLogin={handleLogin} />;
  }

  const navigation: Array<{ id: View; label: string; adminOnly?: boolean }> = [
    { id: "dashboard", label: "Dashboard" },
    { id: "lapor", label: "Input Laporan" },
    { id: "daftar", label: "Daftar Laporan" },
    { id: "validasi", label: "Validasi" },
    { id: "scoring", label: "Priority Scoring" },
    { id: "users", label: "Management User", adminOnly: true }
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brandMark">FL</div>
          <div>
            <strong>FasilitasLapor</strong>
            <span>Crowdsourcing DSS</span>
          </div>
        </div>
        <nav className="nav">
          {navigation
            .filter((item) => !item.adminOnly || currentUser.role === "admin")
            .map((item) => (
              <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => setView(item.id)}>
                {item.label}
              </button>
            ))}
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">PRD FasilitasLapor</p>
            <h1>Pelaporan Kerusakan Fasilitas Umum</h1>
          </div>
          <div className="account">
            <span>{currentUser.name}</span>
            <strong>{currentUser.role === "admin" ? "Administrator" : "Pengguna"}</strong>
            <button onClick={handleLogout}>Keluar</button>
          </div>
        </header>

        {dataLoading && <div className="syncNotice">Menyinkronkan data database...</div>}
        {view === "dashboard" && <Dashboard reports={rankedReports} validations={state.validations} />}
        {view === "lapor" && <ReportForm onSubmit={addReport} />}
        {view === "daftar" && (
          <ReportsTable
            reports={rankedReports}
            validations={state.validations}
            isAdmin={currentUser.role === "admin"}
            onStatusChange={updateStatus}
          />
        )}
        {view === "validasi" && (
          <ValidationPanel reports={rankedReports} validations={state.validations} currentUser={currentUser} onValidate={addValidation} />
        )}
        {view === "scoring" && <ScoringPanel reports={rankedReports} validations={state.validations} weights={state.weights} onWeightsChange={persistWeights} />}
        {view === "users" && <UserManagement users={state.users} />}
      </section>
    </main>
  );
}
