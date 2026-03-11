"use server";

import { getAvailableSlots } from "./get-slots";

export async function getAvailableSlotsAction(
  barberProfileId: string,
  dateStr: string,
  serviceDuration: number
): Promise<string[]> {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  return getAvailableSlots(barberProfileId, date, serviceDuration);
}
