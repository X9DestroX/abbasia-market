import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentification requise." }, { status: 401 });

  const seller = await prisma.sellerProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, isApproved: true },
  });
  if (!seller?.isApproved) return NextResponse.json({ error: "Boutique vendeur approuvée requise." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "Fichier image manquant." }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Formats acceptés : JPG, PNG et WEBP." }, { status: 415 });
  if (file.size <= 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "Chaque image doit faire moins de 5 Mo." }, { status: 413 });

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isWebp = String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  const signatureMatches =
    (file.type === "image/jpeg" && isJpeg) ||
    (file.type === "image/png" && isPng) ||
    (file.type === "image/webp" && isWebp);
  if (!signatureMatches) return NextResponse.json({ error: "Le contenu du fichier ne correspond pas à une image JPG, PNG ou WEBP valide." }, { status: 415 });

  const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
  const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) {
    console.error("Product image upload failed:", error);
    return NextResponse.json({ error: "Téléversement impossible. Vérifiez le bucket product-images et ses politiques." }, { status: 500 });
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl, storagePath: path });
}
