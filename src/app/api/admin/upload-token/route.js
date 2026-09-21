import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import { getCurrentAdmin } from "@/lib/auth";

// Issues short-lived tokens so the admin's browser can upload straight to Vercel Blob
// (no 4.5MB serverless request limit). Only admins can obtain a token.
export async function POST(request) {
  const body = await request.json();

  // Vercel Blob also calls this URL back when an upload finishes (no admin cookie, signed instead).
  if (body?.type === "blob.generate-client-token") {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"],
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
      }),
    });
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json({ error: err.message || "Không thể tạo phiên tải lên" }, { status: 400 });
  }
}
