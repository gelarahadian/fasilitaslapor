export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toPrismaStatus } from "@/lib/api-utils";
import { statusUpdateSchema, validationMessage } from "@/lib/validators";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = statusUpdateSchema.parse(await request.json());
    const status = toPrismaStatus(body.status) as "MENUNGGU_VALIDASI" | "TERVALIDASI" | "DIPROSES" | "SELESAI" | "DITOLAK";

    const report = await prisma.report.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: { select: { id: true, name: true, email: true } },
        validations: true
      }
    });

    return NextResponse.json({ report });
  } catch (error) {
    if (error instanceof ZodError) return jsonError(validationMessage(error));
    if (error instanceof Error && error.message === "UNAUTHORIZED") return jsonError("Anda harus login", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return jsonError("Akses hanya untuk administrator", 403);
    return jsonError(error instanceof Error ? error.message : "Status gagal diperbarui");
  }
}
