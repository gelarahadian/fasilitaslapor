"use client";

import { useMemo, useState } from "react";
import type { Report, ReportStatus, Validation } from "@/lib/types";

type Props = {
  reports: Report[];
  validations: Validation[];
  isAdmin: boolean;
  onStatusChange: (reportId: string, status: ReportStatus) => void;
};

const statuses: ReportStatus[] = ["Menunggu Validasi", "Tervalidasi", "Diproses", "Selesai", "Ditolak"];

export function ReportsTable({ reports, validations, isAdmin, onStatusChange }: Props) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Semua");

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const text = `${report.title} ${report.category} ${report.location} ${report.reporterName}`.toLowerCase();
      const matchQuery = text.includes(query.toLowerCase());
      const matchStatus = status === "Semua" || report.status === status;
      return matchQuery && matchStatus;
    });
  }, [query, reports, status]);

  return (
    <section className="panel">
      <div className="panelHead tableTools">
        <div>
          <h2>Daftar Laporan</h2>
          <p>Status, jumlah validasi, duplikasi, dan skor ditampilkan untuk monitoring.</p>
        </div>
        <div className="filters">
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari laporan" />
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>Semua</option>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>

      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Laporan</th>
              <th>Kategori</th>
              <th>Status</th>
              <th>Foto</th>
              <th>Validasi</th>
              <th>Duplikasi</th>
              <th>Score</th>
              {isAdmin && <th>Aksi Admin</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((report, index) => (
              <tr key={report.id}>
                <td>#{index + 1}</td>
                <td>
                  <strong>{report.title}</strong>
                  <span>{report.location}</span>
                </td>
                <td>{report.category}</td>
                <td><span className="badge">{report.status}</span></td>
                <td>
                  {report.photoName ? (
                    <a className="photoLink" href={report.photoName} target="_blank" rel="noreferrer">Buka foto</a>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td>{validations.filter((item) => item.reportId === report.id).length}</td>
                <td>{report.duplicateCount}</td>
                <td><strong>{report.priorityScore}</strong></td>
                {isAdmin && (
                  <td>
                    <select value={report.status} onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)}>
                      {statuses.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
