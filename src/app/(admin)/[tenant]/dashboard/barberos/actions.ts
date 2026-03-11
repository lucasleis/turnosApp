"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { DayOfWeek } from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";

async function assertAdmin(userId: string, tenantId: string) {
  const member = await prisma.tenantMember.findUnique({
    where: { userId_tenantId: { userId, tenantId } },
  });
  if (!member || member.role !== "ADMIN") throw new Error("No autorizado");
}

type State = { error: string } | { success: true; inviteToken?: string } | null;

export async function createBarber(
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
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const branchId = formData.get("branchId") as string;

  if (!name || !email || !branchId) return { error: "Todos los campos son requeridos" };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Email inválido" };

  // Verificar si ya existe en este tenant
  const existingMember = await prisma.user.findUnique({
    where: { email },
    include: { tenants: { where: { tenantId } } },
  });

  if (existingMember?.tenants.length) {
    return { error: "Este email ya pertenece al negocio" };
  }

  // Token de invitación para setear contraseña
  const inviteToken = randomBytes(32).toString("hex");
  const tempPassword = await bcrypt.hash(inviteToken, 12);

  const user = existingMember ?? await prisma.user.create({
    data: { name, email, password: tempPassword },
  });

  if (existingMember && !existingMember.name) {
    await prisma.user.update({ where: { id: user.id }, data: { name } });
  }

  const member = await prisma.tenantMember.create({
    data: { userId: user.id, tenantId, role: "BARBER" },
  });

  await prisma.barberProfile.create({
    data: { tenantMemberId: member.id, branchId },
  });

  revalidatePath(`/${tenantSlug}/dashboard/barberos`);
  // El token se mostraría en la UI para que el admin lo comparta
  // (en módulo 6 esto se envía por email)
  return { success: true, inviteToken };
}

export async function updateSchedule(
  barberProfileId: string,
  dayOfWeek: DayOfWeek,
  startTime: string | null,
  endTime: string | null,
  tenantSlug: string
) {
  const session = await requireAuth();

  const profile = await prisma.barberProfile.findUnique({
    where: { id: barberProfileId },
    include: { tenantMember: true },
  });
  if (!profile) return { error: "Barbero no encontrado" };

  await assertAdmin(session.user.id, profile.tenantMember.tenantId).catch(
    () => { throw new Error("No autorizado"); }
  );

  if (!startTime || !endTime) {
    // Eliminar el día del schedule
    await prisma.schedule.deleteMany({
      where: { barberProfileId, dayOfWeek },
    });
  } else {
    await prisma.schedule.upsert({
      where: { barberProfileId_dayOfWeek: { barberProfileId, dayOfWeek } },
      update: { startTime, endTime },
      create: { barberProfileId, dayOfWeek, startTime, endTime },
    });
  }

  revalidatePath(`/${tenantSlug}/dashboard/barberos`);
  return { success: true };
}

export async function addBlockedSlot(
  _prev: State,
  formData: FormData
): Promise<State> {
  const session = await requireAuth();
  const barberProfileId = formData.get("barberProfileId") as string;
  const tenantSlug = formData.get("tenantSlug") as string;
  const date = formData.get("date") as string;
  const startTime = (formData.get("startTime") as string) || null;
  const endTime = (formData.get("endTime") as string) || null;
  const reason = (formData.get("reason") as string) || null;

  if (!date) return { error: "La fecha es requerida" };

  const profile = await prisma.barberProfile.findUnique({
    where: { id: barberProfileId },
    include: { tenantMember: true },
  });
  if (!profile) return { error: "Barbero no encontrado" };

  try {
    await assertAdmin(session.user.id, profile.tenantMember.tenantId);
  } catch {
    return { error: "No autorizado" };
  }

  await prisma.blockedSlot.create({
    data: {
      barberProfileId,
      date: new Date(`${date}T00:00:00.000Z`),
      startTime,
      endTime,
      reason,
    },
  });

  revalidatePath(`/${tenantSlug}/dashboard/barberos`);
  return { success: true };
}

export async function deleteBlockedSlot(id: string, tenantSlug: string) {
  const session = await requireAuth();

  const slot = await prisma.blockedSlot.findUnique({
    where: { id },
    include: { barberProfile: { include: { tenantMember: true } } },
  });
  if (!slot) return { error: "Bloqueo no encontrado" };

  await assertAdmin(session.user.id, slot.barberProfile.tenantMember.tenantId).catch(
    () => { throw new Error("No autorizado"); }
  );

  await prisma.blockedSlot.delete({ where: { id } });
  revalidatePath(`/${tenantSlug}/dashboard/barberos`);
  return { success: true };
}
