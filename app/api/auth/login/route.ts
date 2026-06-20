export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ZodError } from "zod";
import { setSessionCookie, normalizeRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonError } from "@/lib/api-utils";
import { getClientIp, checkRateLimit } from "@/lib/rate-limit";
import { loginSchema, validationMessage } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = checkRateLimit(`login:${ip}`, 10, 60_000);
    if (!rate.allowed) return jsonError(`Terlalu banyak percobaan login. Coba lagi dalam ${rate.retryAfter} detik.`, 429);

    const body = loginSchema.parse(await request.json());
    const userRecord = await prisma.user.findUnique({ where: { email: body.email } });
    if (!userRecord) return jsonError("Email atau password salah", 401);

    const validPassword = await bcrypt.compare(body.password, userRecord.password);
    if (!validPassword) return jsonError("Email atau password salah", 401);

    const user = {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
      role: normalizeRole(userRecord.role)
    };

    await setSessionCookie(user);
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof ZodError) return jsonError(validationMessage(error));
    return jsonError(error instanceof Error ? error.message : "Login gagal");
  }
}
