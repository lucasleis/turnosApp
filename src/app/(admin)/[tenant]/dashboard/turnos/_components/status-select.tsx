"use client";

import { useTransition } from "react";
import { BookingStatus } from "@prisma/client";
import { updateBookingStatus } from "../actions";
import { cn } from "@/lib/utils";

const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["COMPLETED", "NO_SHOW", "CANCELLED"],
  CANCELLED: [],
  COMPLETED: [],
  NO_SHOW: [],
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
  NO_SHOW: "No asistió",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  COMPLETED: "bg-zinc-100 text-zinc-600",
  NO_SHOW: "bg-orange-100 text-orange-800",
};

export function StatusSelect({
  bookingId,
  currentStatus,
  tenantSlug,
}: {
  bookingId: string;
  currentStatus: BookingStatus;
  tenantSlug: string;
}) {
  const [isPending, startTransition] = useTransition();
  const available = TRANSITIONS[currentStatus];

  if (available.length === 0) {
    return (
      <span className={cn("px-2.5 py-1 rounded-full text-xs font-medium", STATUS_COLORS[currentStatus])}>
        {STATUS_LABELS[currentStatus]}
      </span>
    );
  }

  return (
    <select
      disabled={isPending}
      value={currentStatus}
      onChange={(e) => {
        const next = e.target.value as BookingStatus;
        startTransition(async () => { await updateBookingStatus(bookingId, next, tenantSlug); });
      }}
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border-0 cursor-pointer appearance-none transition-opacity",
        STATUS_COLORS[currentStatus],
        isPending && "opacity-50 cursor-not-allowed"
      )}
    >
      <option value={currentStatus}>{STATUS_LABELS[currentStatus]}</option>
      {available.map((s) => (
        <option key={s} value={s}>→ {STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
}
