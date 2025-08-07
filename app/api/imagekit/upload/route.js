import { auth } from "@clerk/nextjs/server";
import ImageKit from "imagekit";
import { NextResponse } from "next/server";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privatekey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const fileName = formData.get("filename");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const timestamp = Date.now();
    const sanitizedFilename =
      fileName?.replace(/[^a-zA-Z0-9.-]/g, "_") || "upload";
    //(/[^a-zA-Z0-9.-]/g, "_") are regular expression pattern used sanitize filenames. ex:- "My File!.jpg" becomes "My_File_.jpg" "user@photo#1.png" becomes "user_photo_1.png"
    const uniqueFileName = `${userId}/${timestamp}_${sanitizedFilename}`;

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: uniqueFileName,
      folder: "/img-projects",
    });

    const thumbnailUrl = imagekit.url({
      src: uploadResponse.url,
      transformation: [
        {
            width: 400,
            height: 300,
            cropMode: "maintain_ar",
            quality: 80,
        },
      ],
    });

    return NextResponse.json({
        success:true,
        url: uploadResponse.url,
        thumbnailUrl: thumbnailUrl,
        fileId: uploadResponse.fileId,
        width: uploadResponse.width,
        height: uploadResponse.height,
        size: uploadResponse.size,
        name: uploadResponse.name,
    });


  } catch (error) {
    console.error("Imagekit upload error:", error);
    return NextResponse.json(
        {
            success: false,
            error: "Failed to upload image",
            details: error.message,
        },
        {status: 500} 
        // These are part of HTTP status codes where:
        // 2xx means success (like 200 OK)
        // 4xx means client errors (like 400, 401)
        // 5xx means server errors (like 500)
    )    
  }
}
