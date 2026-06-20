"use client";

import type { Report, Validation } from "@/lib/types";

type Props = {
  reports: Report[];
  validations: Validation[];
};

export function Dashboard({ reports, validations }: Props) {
  const activeReports = reports.filter((report) => report.status !== "Selesai" && report.status !== "Ditolak");
  const categories = reports.reduce<Record<string, number>>((result, report) => {
    result[report.category] = (result[report.category] || 0) + 1;
    return result;
  }, {});
  const maxCategory = Math.max(...Object.values(categories), 1);

  return (
    <div className="pageStack">
      <section className="statsGrid">
        <Stat title="Total Laporan" value={reports.length} />
        <Stat title="Menunggu Validasi" value={reports.filter((report) => report.status === "Menunggu Validasi").length} />
        <Stat title="Tervalidasi" value={reports.filter((report) => report.status === "Tervalidasi").length} />
        <Stat title="Total Validasi" value={validations.length} />
      </section>

      <section className="gridTwo">
        <div className="panel">
          <div className="panelHead">
            <div>
              <h2>Prioritas Tertinggi</h2>
              <p>Laporan diurutkan berdasarkan nilai priority score.</p>
            </div>
          </div>
          <div className="cardList">
            {activeReports.slice(0, 5).map((report, index) => (
              <article className="priorityCard" key={report.id}>
                <div className="rank">{index + 1}</div>
                <div>
                  <strong>{report.title}</strong>
                  <p>{report.location}</p>
                  <div className="metaRow">
                    <span className="badge">{report.status}</span>
                    <span>Score {report.priorityScore}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panelHead">
            <div>
              <h2>Ringkasan Kategori</h2>
              <p>Monitoring jumlah laporan per kategori.</p>
            </div>
          </div>
          <div className="barList">
            {Object.entries(categories).map(([category, count]) => (
              <div className="barItem" key={category}>
                <div>
                  <span>{category}</span>
                  <strong>{count}</strong>
                </div>
                <progress value={count} max={maxCategory} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: number }) {
  return (
    <article className="statCard">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}
