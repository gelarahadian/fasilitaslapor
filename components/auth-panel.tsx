"use client";

import { FormEvent, useState } from "react";
import type { User } from "@/lib/types";

type Props = {
  onLogin: (payload: { email: string; password: string; mode: "login" | "register"; name?: string }) => Promise<void>;
};

export function AuthPanel({ onLogin }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = new FormData(event.currentTarget);
      await onLogin({
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
        name: String(data.get("name") || ""),
        mode
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Autentikasi gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <section className="authHero">
        <p className="eyebrow">Platform Penelitian</p>
        <h1>FasilitasLapor</h1>
        <p>
          Web pelaporan kerusakan fasilitas umum dengan validasi kolektif,
          priority scoring otomatis, dan dashboard monitoring administrator.
        </p>
        <div className="authStats">
          <span>Login</span>
          <span>Pelaporan</span>
          <span>Validasi</span>
          <span>DSS</span>
        </div>
      </section>

      <section className="authCard">
        <div className="segmented">
          <button className={mode === "login" ? "active" : ""} onClick={() => setMode("login")} type="button">
            Login
          </button>
          <button className={mode === "register" ? "active" : ""} onClick={() => setMode("register")} type="button">
            Registrasi
          </button>
        </div>

        <form onSubmit={submit} className="formStack">
          {mode === "register" && (
            <label>
              Nama
              <input name="name" required placeholder="Nama pengguna" />
            </label>
          )}
          <label>
            Email
            <input name="email" required type="email" placeholder="admin@fasilitaslapor.test" />
          </label>
          <label>
            Password
            <input name="password" required type="password" placeholder="Minimal 6 karakter" />
          </label>
          {error && <p className="errorText">{error}</p>}
          <button className="primaryButton" type="submit" disabled={loading}>
            {loading ? "Memproses..." : mode === "login" ? "Masuk" : "Buat Akun"}
          </button>
        </form>

        <div className="demoBox">
          <strong>Akun demo</strong>
          <span>Admin: admin@fasilitaslapor.test</span>
          <span>User: user@fasilitaslapor.test</span>
          <span>Password: demo123</span>
        </div>
      </section>
    </main>
  );
}
