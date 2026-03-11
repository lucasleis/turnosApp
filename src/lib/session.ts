import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

export async function requireRole(tenantId: string, role: Role) {
  const session = await requireAuth();

  const member = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: session.user.id, tenantId },
    },
    include: {
      tenant: { include: { branches: true } },
      barberProfile: true,
    },
  });

  if (!member || member.role !== role) {
    redirect("/no-autorizado");
  }

  return { session, member };
}
