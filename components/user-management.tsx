"use client";

import type { User } from "@/lib/types";

export function UserManagement({ users }: { users: User[] }) {
  return (
    <section className="panel">
      <div className="panelHead">
        <div>
          <h2>Management User</h2>
          <p>Modul admin untuk melihat pengguna dan peran sesuai kebutuhan PRD.</p>
        </div>
      </div>
      <div className="tableWrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.name}</strong></td>
                <td>{user.email}</td>
                <td><span className="badge">{user.role === "admin" ? "Administrator" : "User"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
