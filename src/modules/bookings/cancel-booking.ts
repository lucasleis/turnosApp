"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/session";
import { timeToMinutes } from "@/modules/availability/get-slots";

type State = { error: string } | { success: true } | null;

export async function cancelarTurno(
  _prevState: State,
  formData: FormData
): Promise<State> {
  const session = await requireAuth();

  const bookingId = formData.get("bookingId") as string;
  const tenantSlug = formData.get("tenantSlug") as string;

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking || booking.clientId !== session.user.id) {
    return { error: "Turno no encontrado" };
  }
  if (!["PENDING", "CONFIRMED"].includes(booking.status)) {
    return { error: "Este turno ya no puede cancelarse" };
  }

  // Regla: no se puede cancelar con menos de 2 horas de anticipación
  const bookingDate = new Date(booking.date);
  const [h, m] = booking.startTime.split(":").map(Number);
  bookingDate.setHours(h, m, 0, 0);

  const diffHours = (bookingDate.getTime() - Date.now()) / (1000 * 60 * 60);
  if (diffHours < 2) {
    return { error: "No podés cancelar con menos de 2 horas de anticipación" };
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });

  revalidatePath(`/${tenantSlug}/mis-turnos`);
  return { success: true };
}
