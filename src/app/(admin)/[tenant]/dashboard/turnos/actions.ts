"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { BookingStatus } from "@prisma/client";

export async function updateBookingStatus(
  bookingId: string,
  newStatus: BookingStatus,
  tenantSlug: string
) {
  const session = await requireAuth();

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { tenant: true },
  });

  if (!booking) return { error: "Turno no encontrado" };

  // Verificar que el usuario es admin del tenant
  const member = await prisma.tenantMember.findUnique({
    where: {
      userId_tenantId: { userId: session.user.id, tenantId: booking.tenantId },
    },
  });

  if (!member || member.role !== "ADMIN") return { error: "No autorizado" };

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: newStatus },
  });

  revalidatePath(`/${tenantSlug}/dashboard/turnos`);
  revalidatePath(`/${tenantSlug}/dashboard`);
  return { success: true };
}
