"use client";

import { FormEvent, useState } from "react";
import type { Report } from "@/lib/types";

export type ReportFormPayload = Omit<Report, "id" | "userId" | "reporterName" | "priorityScore" | "createdAt" | "status"> & {
  photoFile?: File;
};

type Props = {
  onSubmit: (report: ReportFormPayload) => Promise<void> | void;
};

export function ReportForm({ onSubmit }: Props) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const form = event.currentTarget;
      const data = new FormData(form);
      const file = data.get("photoFile");

      await onSubmit({
        title: String(data.get("title")),
        category: String(data.get("category")),
        initialDamage: Number(data.get("initialDamage")),
        description: String(data.get("description")),
        location: String(data.get("location")),
        photoName: file instanceof File ? file.name : "",
        photoFile: file instanceof File && file.size > 0 ? file : undefined,
        incidentDate: String(data.get("incidentDate")),
        duplicateCount: Number(data.get("duplicateCount") || 0)
      });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Laporan gagal dikirim");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="panel">
      <div className="panelHead">
        <div>
          <h2>Input Laporan Kerusakan</h2>
          <p>Form mengikuti kebutuhan FR-03 pada PRD: judul, kategori, tingkat kerusakan, deskripsi, lokasi, tanggal, dan foto.</p>
        </div>
      </div>

      <form className="reportForm" onSubmit={submit}>
        <label>
          Judul Laporan
          <input name="title" required placeholder="Contoh: Jalan berlubang di depan pasar" />
        </label>
        <label>
          Kategori
          <select name="category" required>
            <option>Jalan</option>
            <option>Drainase</option>
            <option>Penerangan</option>
            <option>Transportasi</option>
            <option>Taman</option>
            <option>Fasilitas Umum</option>
          </select>
        </label>
        <label>
          Tingkat Kerusakan Awal
          <select name="initialDamage" required>
            <option value="1">1 - Ringan</option>
            <option value="2">2 - Sedang</option>
            <option value="3">3 - Berat</option>
            <option value="4">4 - Kritis</option>
          </select>
        </label>
        <label>
          Jumlah Duplikasi / Laporan Serupa
          <input name="duplicateCount" type="number" min="0" defaultValue="0" />
        </label>
        <label>
          Lokasi / Alamat
          <input name="location" required placeholder="Lokasi kejadian" />
        </label>
        <label>
          Tanggal Kejadian
          <input name="incidentDate" required type="date" />
        </label>
        <label className="spanTwo">
          Foto Dokumentasi
          <input name="photoFile" type="file" accept="image/jpeg,image/png,image/webp" required />
        </label>
        <label className="spanTwo">
          Deskripsi
          <textarea name="description" required rows={5} placeholder="Jelaskan kondisi kerusakan dan dampaknya." />
        </label>
        {error && <p className="errorText spanTwo">{error}</p>}
        <div className="formActions spanTwo">
          <button className="secondaryButton" type="reset" disabled={submitting}>Reset</button>
          <button className="primaryButton" type="submit" disabled={submitting}>{submitting ? "Mengirim..." : "Kirim Laporan"}</button>
        </div>
      </form>
    </section>
  );
}
