export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { jsonError } from "@/lib/api-utils";
import { createSupabaseAdmin, reportPhotoBucket } from "@/lib/supabase-server";

const maxFileSize = 5 * 1024 * 1024;
const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

function extensionFromType(type: string) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) return jsonError("Anda harus login untuk upload foto", 401);

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) return jsonError("File foto wajib diunggah");
    if (!allowedTypes.has(file.type)) return jsonError("Format foto harus JPG, PNG, atau WebP");
    if (file.size > maxFileSize) return jsonError("Ukuran foto maksimal 5 MB");

    const supabase = createSupabaseAdmin();
    const extension = extensionFromType(file.type);
    const path = `${sessionUser.id}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const bytes = await file.arrayBuffer();

    const { error } = await supabase.storage
      .from(reportPhotoBucket)
      .upload(path, bytes, {
        contentType: file.type,
        upsert: false
      });

    if (error) return jsonError(error.message, 500);

    const { data } = supabase.storage.from(reportPhotoBucket).getPublicUrl(path);

    return NextResponse.json({
      path,
      url: data.publicUrl
    }, { status: 201 });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Upload foto gagal");
  }
}
