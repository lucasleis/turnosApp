"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { getAvailableSlots } from "@/modules/availability/get-slots";
import { minutesToTime, timeToMinutes } from "@/modules/availability/get-slots";

type State = { error: string } | null;

async function getOrCreateClientMembership(userId: string, tenantId: string) {
  return prisma.tenantMember.upsert({
    where: { userId_tenantId: { userId, tenantId } },
    update: {},
    create: { userId, tenantId, role: "CLIENT" },
  });
}

export async function confirmarReserva(
  _prevState: State,
  formData: FormData
): Promise<State> {
  const session = await requireAuth();

  const tenantId = formData.get("tenantId") as string;
  const tenantSlug = formData.get("tenantSlug") as string;
  const branchId = formData.get("branchId") as string;
  const serviceId = formData.get("serviceId") as string;
  const barberProfileId = formData.get("barberProfileId") as string;
  const fecha = formData.get("fecha") as string;
  const hora = formData.get("hora") as string;

  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return { error: "Servicio no encontrado" };

  const [year, month, day] = fecha.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  // Verificar que el slot sigue disponible (race condition)
  const available = await getAvailableSlots(barberProfileId, date, service.duration);
  if (!available.includes(hora)) {
    return { error: "Este horario ya no está disponible. Por favor elegí otro." };
  }

  const endTime = minutesToTime(timeToMinutes(hora) + service.duration);

  await getOrCreateClientMembership(session.user.id, tenantId);

  await prisma.booking.create({
    data: {
      tenantId,
      branchId,
      clientId: session.user.id,
      barberProfileId,
      serviceId,
      date: new Date(`${fecha}T00:00:00.000Z`),
      startTime: hora,
      endTime,
      status: "PENDING",
    },
  });

  redirect(`/${tenantSlug}/mis-turnos`);
}
