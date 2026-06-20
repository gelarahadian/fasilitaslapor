import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.SUPABASE_REPORT_PHOTO_BUCKET || "report-photos";

if (!url || !serviceRoleKey) {
  console.error("NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi di .env");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();

if (listError) {
  console.error(listError.message);
  process.exit(1);
}

const exists = buckets.some((item) => item.name === bucket);

if (!exists) {
  const { error } = await supabase.storage.createBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Bucket ${bucket} berhasil dibuat.`);
} else {
  const { error } = await supabase.storage.updateBucket(bucket, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  });

  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Bucket ${bucket} sudah ada dan dikonfigurasi public.`);
}
