export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { calculateServerPriority } from "@/lib/server-scoring";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";
import { reportCreateSchema, validationMessage } from "@/lib/validators";

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return jsonError("Anda harus login", 401);

  const reports = await prisma.report.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      validations: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      }
    },
    orderBy: [{ priorityScore: "desc" }, { createdAt: "desc" }]
  });

  return NextResponse.json({ reports });
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return jsonError("Anda harus login untuk membuat laporan", 401);

    const body = reportCreateSchema.parse(await request.json());
    const weights = await prisma.priorityWeight.findFirst({ orderBy: { createdAt: "desc" } });
    const report = await prisma.report.create({
      data: {
        userId: sessionUser.id,
        title: body.title,
        category: body.category,
        initialDamage: body.initialDamage,
        description: body.description,
        location: body.location,
        photoUrl: body.photoUrl || null,
        incidentDate: new Date(body.incidentDate),
        duplicateCount: body.duplicateCount
      },
      include: { validations: true }
    });

    const priorityScore = weights ? calculateServerPriority(report, weights) : 0;
    const updated = await prisma.report.update({
      where: { id: report.id },
      data: { priorityScore },
      include: {
        user: { select: { id: true, name: true, email: true } },
        validations: true
      }
    });

    return NextResponse.json({ report: updated }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return jsonError(validationMessage(error));
    return jsonError(error instanceof Error ? error.message : "Laporan gagal disimpan");
  }
}
