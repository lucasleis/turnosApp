import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getTenantBySlug = cache(async (slug: string) => {
  return prisma.tenant.findUnique({
    where: { slug },
    include: {
      branches: { where: { isActive: true } },
      services: { where: { isActive: true }, orderBy: { name: "asc" } },
    },
  });
});

export const getTenantBarbers = cache(async (tenantId: string) => {
  return prisma.barberProfile.findMany({
    where: { tenantMember: { tenantId } },
    include: {
      tenantMember: { include: { user: true } },
      branch: true,
      schedules: true,
    },
  });
});
