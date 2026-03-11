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

type ServiceState = { error: string } | { success: true } | null;

export async function createService(
  _prev: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const session = await requireAuth();
  const tenantId = formData.get("tenantId") as string;

  try {
    await assertAdmin(session.user.id, tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const duration = parseInt(formData.get("duration") as string);
  const price = parseFloat(formData.get("price") as string);
  const tenantSlug = formData.get("tenantSlug") as string;

  if (!name) return { error: "El nombre es requerido" };
  if (!duration || duration < 5) return { error: "La duración mínima es 5 minutos" };
  if (!price || price < 0) return { error: "El precio no es válido" };

  await prisma.service.create({
    data: { tenantId, name, description, duration, price },
  });

  revalidatePath(`/${tenantSlug}/dashboard/servicios`);
  return { success: true };
}

export async function updateService(
  _prev: ServiceState,
  formData: FormData
): Promise<ServiceState> {
  const session = await requireAuth();
  const tenantId = formData.get("tenantId") as string;
  const serviceId = formData.get("serviceId") as string;
  const tenantSlug = formData.get("tenantSlug") as string;

  try {
    await assertAdmin(session.user.id, tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  const name = (formData.get("name") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const duration = parseInt(formData.get("duration") as string);
  const price = parseFloat(formData.get("price") as string);

  if (!name) return { error: "El nombre es requerido" };
  if (!duration || duration < 5) return { error: "La duración mínima es 5 minutos" };
  if (!price || price < 0) return { error: "El precio no es válido" };

  await prisma.service.update({
    where: { id: serviceId },
    data: { name, description, duration, price },
  });

  revalidatePath(`/${tenantSlug}/dashboard/servicios`);
  return { success: true };
}

export async function toggleService(serviceId: string, tenantSlug: string) {
  const session = await requireAuth();

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { error: "Servicio no encontrado" };

  try {
    await assertAdmin(session.user.id, service.tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  await prisma.service.update({
    where: { id: serviceId },
    data: { isActive: !service.isActive },
  });

  revalidatePath(`/${tenantSlug}/dashboard/servicios`);
  return { success: true };
}
