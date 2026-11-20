import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
  if (!body || typeof body !== "object") return NextResponse.json({ error: "Invalid request body." }, { status: 400 });

  const input = body as Record<string, unknown>;
  const fullName = typeof input.fullName === "string" ? input.fullName.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";
  const city = typeof input.city === "string" ? input.city.trim() : "";
  const district = typeof input.district === "string" ? input.district.trim() : "";
  const addressLine = typeof input.addressLine === "string" ? input.addressLine.trim() : "";
  const instructions = typeof input.instructions === "string" ? input.instructions.trim() : "";
  const isDefault = input.isDefault === true;

  if (!fullName || !phone || !city || !addressLine) {
    return NextResponse.json({ error: "Name, phone, city and address are required." }, { status: 400 });
  }
  if (fullName.length > 100 || phone.length > 30 || city.length > 100 || district.length > 100 || addressLine.length > 300 || instructions.length > 500) {
    return NextResponse.json({ error: "One or more address fields are too long." }, { status: 400 });
  }

  try {
    const address = await prisma.$transaction(async (tx) => {
      if (isDefault) await tx.address.updateMany({ where: { userId: user.id }, data: { isDefault: false } });
      return tx.address.create({
        data: {
          userId: user.id,
          fullName,
          phone,
          city,
          district: district || null,
          addressLine,
          instructions: instructions || null,
          isDefault,
        },
        select: {
          id: true, fullName: true, phone: true, city: true, district: true,
          addressLine: true, instructions: true, isDefault: true,
        },
      });
    });
    return NextResponse.json({ address }, { status: 201 });
  } catch (cause) {
    console.error("Address creation failed:", cause);
    return NextResponse.json({ error: "Could not save address." }, { status: 500 });
  }
}
