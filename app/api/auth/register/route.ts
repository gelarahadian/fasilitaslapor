export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { setSessionCookie } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { registerSchema, validationMessage } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`register:${ip}`, 5, 60_000);
    if (!rate.allowed) return jsonError(`Terlalu banyak percobaan registrasi. Coba lagi dalam ${rate.retryAfter} detik.`, 429);

    const body = registerSchema.parse(await request.json());
    const existing = await prisma.user.findUnique({ where: { email: body.email }, select: { id: true } });
    if (existing) return jsonError("Email sudah terdaftar", 409);

    const passwordHash = await bcrypt.hash(body.password, 12);
    const userRecord = await prisma.user.create({
      data: { name: body.name, email: body.email, password: passwordHash, role: "USER" }
    });

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: "user" as const
    };

    await setSessionCookie(user);
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) return jsonError(validationMessage(error));
    return jsonError(error instanceof Error ? error.message : "Registrasi gagal");
  }
}
