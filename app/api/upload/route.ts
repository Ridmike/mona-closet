// app/api/upload/route.ts
// Signed upload — uses SHA-1 HMAC signature with API Secret server-side.
// Credentials are kept server-side only (not exposed to the browser).
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
    const apiKey    = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { error: "Cloudinary credentials are missing from .env" },
        { status: 500 }
      );
    }

    const timestamp = Math.round(Date.now() / 1000).toString();
    const folder    = "monas_closet";

    // Params must be in alphabetical order before signing
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    // Build the multipart payload for Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    const payload = new FormData();
    payload.append("file",      blob,      file.name);
    payload.append("api_key",   apiKey);
    payload.append("timestamp", timestamp);
    payload.append("folder",    folder);
    payload.append("signature", signature);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: payload }
    );

    const data = await response.json();

    if (data.error) {
      console.error("Cloudinary error:", data.error);
      return NextResponse.json(
        { error: data.error.message || "Cloudinary upload failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({ url: data.secure_url });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      { error: err.message || "Unexpected server error" },
      { status: 500 }
    );
  }
}
