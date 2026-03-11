"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";

async function assertAdmin(userId: string, tenantId: string) {
  const member = await prisma.tenantMember.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  if (!member || member.role !== "ADMIN") throw new Error("No autorizado");
}

type State = { error: string } | { success: true } | null;

export async function createBranch(
  _prev: State,
  formData: FormData
): Promise<State> {
  const session = await requireAuth();
  const tenantId = formData.get("tenantId") as string;
  const tenantSlug = formData.get("tenantSlug") as string;

  try {
    await assertAdmin(session.user.id, tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name) return { error: "El nombre es requerido" };

  await prisma.branch.create({ data: { tenantId, name, address, phone } });

  revalidatePath(`/${tenantSlug}/dashboard/sucursales`);
  return { success: true };
}

export async function updateBranch(
  _prev: State,
  formData: FormData
): Promise<State> {
  const session = await requireAuth();
  const tenantId = formData.get("tenantId") as string;
  const branchId = formData.get("branchId") as string;
  const tenantSlug = formData.get("tenantSlug") as string;

  try {
    await assertAdmin(session.user.id, tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  if (!name) return { error: "El nombre es requerido" };

  await prisma.branch.update({ where: { id: branchId }, data: { name, address, phone } });

  revalidatePath(`/${tenantSlug}/dashboard/sucursales`);
  return { success: true };
}

export async function toggleBranch(branchId: string, tenantId: string, tenantSlug: string) {
  const session = await requireAuth();

  try {
    await assertAdmin(session.user.id, tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) return { error: "Sucursal no encontrada" };

  await prisma.branch.update({
    where: { id: branchId },
    data: { isActive: !branch.isActive },
  });

  revalidatePath(`/${tenantSlug}/dashboard/sucursales`);
  return { success: true };
}
