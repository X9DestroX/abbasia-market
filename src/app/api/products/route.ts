import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { status: "ACTIVE", stock: { gt: 0 }, seller: { isApproved: true } },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true, name: true, description: true, price: true, currency: true, stock: true, sku: true,
      slug: true, imageUrl: true,
      category: { select: { name: true, slug: true } },
      seller: { select: { storeName: true, slug: true } },
      images: { orderBy: { position: "asc" }, take: 8, select: { id: true, url: true, altText: true } },
    },
  });
  return NextResponse.json({ products });
}
