
import "server-only";

import type { User as AuthUser } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function syncProfile(authUser: AuthUser) {
  const email = authUser.email ?? null;

  const metadataName = authUser.user_metadata?.full_name;
  const name =
    typeof metadataName === "string" && metadataName.trim()
      ? metadataName.trim().slice(0, 100)
      : email?.split("@")[0] ?? "Client ABBASIA";

  return prisma.user.upsert({
    where: { id: authUser.id },
    create: {
      id: authUser.id,
      name,
      email,
      role: "CUSTOMER",
      status: "ACTIVE",
    },
    update: {
      name,
      email,
    },
  });
}
