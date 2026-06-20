"use client";

import { useState } from "react";
import type { Report, User, Validation, ValidationDecision } from "@/lib/types";

type Props = {
  reports: Report[];
  validations: Validation[];
  currentUser: User;
  onValidate: (reportId: string, severity: number, decision: ValidationDecision) => void;
};

export function ValidationPanel({ reports, validations, currentUser, onValidate }: Props) {
  const [severity, setSeverity] = useState(3);

  return (
    <section className="panel">
      <div className="panelHead">
        <div>
          <h2>Crowdsourcing Validation</h2>
          <p>Pengguna lain dapat menilai tingkat kerusakan dan mengonfirmasi atau menolak laporan.</p>
        </div>
      </div>
      <div className="validationGrid">
        {reports
          .filter((report) => report.userId !== currentUser.id && report.status !== "Selesai")
          .map((report) => {
            const userValidation = validations.find((item) => item.reportId === report.id && item.userId === currentUser.id);
            return (
              <article className="validationCard" key={report.id}>
                <div>
                  <span className="badge">{report.status}</span>
                  <h3>{report.title}</h3>
                  <p>{report.description}</p>
                  <small>{report.location}</small>
                </div>
                <div className="validationActions">
                  <label>
                    Tingkat Keparahan
                    <select defaultValue={userValidation?.severity || severity} onChange={(event) => setSeverity(Number(event.target.value))}>
                      <option value="1">1 - Ringan</option>
                      <option value="2">2 - Sedang</option>
                      <option value="3">3 - Berat</option>
                      <option value="4">4 - Kritis</option>
                    </select>
                  </label>
                  <div className="buttonRow">
                    <button className="primaryButton" onClick={() => onValidate(report.id, severity, "Konfirmasi")}>Konfirmasi</button>
                    <button className="secondaryButton" onClick={() => onValidate(report.id, severity, "Tolak")}>Tolak</button>
                  </div>
                  {userValidation && <span className="savedText">Validasi Anda: {userValidation.decision}</span>}
                </div>
              </article>
            );
          })}
      </div>
    </section>
  );
}
