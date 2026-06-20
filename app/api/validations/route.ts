export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError, toPrismaDecision } from "@/lib/api-utils";
import { calculateServerPriority } from "@/lib/server-scoring";
import { validationCreateSchema, validationMessage } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return jsonError("Anda harus login untuk memberi validasi", 401);

    const body = validationCreateSchema.parse(await request.json());
    const decision = toPrismaDecision(body.decision) as "KONFIRMASI" | "TOLAK";

    const reportOwner = await prisma.report.findUnique({ where: { id: body.reportId }, select: { userId: true } });
    if (!reportOwner) return jsonError("Laporan tidak ditemukan", 404);
    if (reportOwner.userId === sessionUser.id) return jsonError("Pelapor tidak dapat memvalidasi laporannya sendiri", 403);

    const validation = await prisma.validation.upsert({
      where: { userId_reportId: { userId: sessionUser.id, reportId: body.reportId } },
      update: { severity: body.severity, decision },
      create: { userId: sessionUser.id, reportId: body.reportId, severity: body.severity, decision }
    });

    const weights = await prisma.priorityWeight.findFirst({ orderBy: { createdAt: "desc" } });
    const report = await prisma.report.findUnique({
      where: { id: body.reportId },
      include: { validations: true }
    });

    if (report && weights) {
      await prisma.report.update({
        where: { id: report.id },
        data: { priorityScore: calculateServerPriority(report, weights) }
      });
    }

    return NextResponse.json({ validation }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return jsonError(validationMessage(error));
    return jsonError(error instanceof Error ? error.message : "Validasi gagal disimpan");
  }
}
