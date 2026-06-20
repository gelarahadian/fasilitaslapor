"use client";

import { FormEvent } from "react";
import { averageSeverity, reportAgeDays } from "@/lib/scoring";
import type { PriorityWeights, Report, Validation } from "@/lib/types";

type Props = {
  reports: Report[];
  validations: Validation[];
  weights: PriorityWeights;
  onWeightsChange: (weights: PriorityWeights) => void;
};

export function ScoringPanel({ reports, validations, weights, onWeightsChange }: Props) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onWeightsChange({
      damage: Number(data.get("damage")),
      validation: Number(data.get("validation")),
      duplication: Number(data.get("duplication")),
      time: Number(data.get("time"))
    });
  }

  return (
    <div className="pageStack">
      <section className="panel">
        <div className="panelHead">
          <div>
            <h2>Konfigurasi Bobot Priority Scoring</h2>
            <p>Bobot dibuat konfigurabel karena PRD menyatakan angka W1, W2, W3, dan W4 belum final.</p>
          </div>
        </div>
        <form className="weightsForm" onSubmit={submit}>
          <label>W1 Kerusakan<input name="damage" type="number" step="0.1" defaultValue={weights.damage} /></label>
          <label>W2 Validasi<input name="validation" type="number" step="0.1" defaultValue={weights.validation} /></label>
          <label>W3 Duplikasi<input name="duplication" type="number" step="0.1" defaultValue={weights.duplication} /></label>
          <label>W4 Waktu<input name="time" type="number" step="0.1" defaultValue={weights.time} /></label>
          <button className="primaryButton" type="submit">Hitung Ulang</button>
        </form>
      </section>

      <section className="panel">
        <div className="panelHead">
          <div>
            <h2>Detail Perhitungan</h2>
            <p>Formula: Priority = W1 x Tingkat Kerusakan + W2 x Jumlah Validasi + W3 x Duplikasi + W4 x Waktu.</p>
          </div>
        </div>
        <div className="tableWrap">
          <table>
            <thead>
              <tr>
                <th>Laporan</th>
                <th>Kerusakan</th>
                <th>Validasi</th>
                <th>Duplikasi</th>
                <th>Waktu</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td><strong>{report.title}</strong></td>
                  <td>{averageSeverity(report, validations)}</td>
                  <td>{validations.filter((item) => item.reportId === report.id && item.decision === "Konfirmasi").length}</td>
                  <td>{report.duplicateCount}</td>
                  <td>{reportAgeDays(report)} hari</td>
                  <td><strong>{report.priorityScore}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
