export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { requireAdmin, normalizeRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";

type UserListItem = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export async function GET() {
  try {
    await requireAdmin();
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true },
      orderBy: { createdAt: "desc" }
    }) as UserListItem[];

    return NextResponse.json({
      users: users.map((user: UserListItem) => ({ ...user, role: normalizeRole(user.role) }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return jsonError("Anda harus login", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return jsonError("Akses hanya untuk administrator", 403);
    return jsonError(error instanceof Error ? error.message : "Data pengguna gagal dimuat");
  }
}
