import { DayOfWeek } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function getJsDayOfWeek(date: Date): DayOfWeek {
  const map: DayOfWeek[] = [
    "SUNDAY",
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ];
  return map[date.getDay()];
}

function slotsOverlap(
  slotStart: number,
  slotEnd: number,
  blockStart: number,
  blockEnd: number
): boolean {
  return slotStart < blockEnd && slotEnd > blockStart;
}

export async function getAvailableSlots(
  barberProfileId: string,
  date: Date,
  serviceDurationMinutes: number
): Promise<string[]> {
  const dayOfWeek = getJsDayOfWeek(date);

  // 1. Verificar schedule del barbero para ese día
  const schedule = await prisma.schedule.findUnique({
    where: { barberProfileId_dayOfWeek: { barberProfileId, dayOfWeek } },
  });
  if (!schedule) return [];

  // 2. Buscar bloqueos en esa fecha
  const dateStr = date.toISOString().split("T")[0];
  const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
  const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

  const blockedSlots = await prisma.blockedSlot.findMany({
    where: { barberProfileId, date: { gte: startOfDay, lte: endOfDay } },
  });

  // Día completo bloqueado
  if (blockedSlots.some((b) => !b.startTime && !b.endTime)) return [];

  // 3. Turnos existentes ese día
  const existingBookings = await prisma.booking.findMany({
    where: {
      barberProfileId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ["PENDING", "CONFIRMED"] },
    },
  });

  // 4. Generar todos los slots posibles
  const scheduleStart = timeToMinutes(schedule.startTime);
  const scheduleEnd = timeToMinutes(schedule.endTime);
  const allSlots: string[] = [];
  for (let t = scheduleStart; t + serviceDurationMinutes <= scheduleEnd; t += serviceDurationMinutes) {
    allSlots.push(minutesToTime(t));
  }

  // 5. Filtrar slots no disponibles
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  return allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + serviceDurationMinutes;

    // Slots pasados
    if (isToday && slotStart <= nowMinutes) return false;

    // Bloques parciales
    for (const blocked of blockedSlots) {
      if (blocked.startTime && blocked.endTime) {
        const bStart = timeToMinutes(blocked.startTime);
        const bEnd = timeToMinutes(blocked.endTime);
        if (slotsOverlap(slotStart, slotEnd, bStart, bEnd)) return false;
      }
    }

    // Turnos existentes
    for (const booking of existingBookings) {
      const bStart = timeToMinutes(booking.startTime);
      const bEnd = timeToMinutes(booking.endTime);
      if (slotsOverlap(slotStart, slotEnd, bStart, bEnd)) return false;
    }

    return true;
  });
}
