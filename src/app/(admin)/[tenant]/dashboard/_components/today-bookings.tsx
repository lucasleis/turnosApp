import { Badge } from "@/components/ui/badge";
import { BookingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
  NO_SHOW: "No asistió",
};

const STATUS_VARIANTS: Record<BookingStatus, "warning" | "success" | "destructive" | "muted"> = {
  PENDING: "warning",
  CONFIRMED: "success",
  CANCELLED: "destructive",
  COMPLETED: "muted",
  NO_SHOW: "destructive",
};

type TodayBooking = {
  id: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  service: { name: string };
  client: { name: string | null; email: string };
  barberProfile: { tenantMember: { user: { name: string | null } } };
};

export function TodayBookings({ bookings }: { bookings: TodayBooking[] }) {
  if (bookings.length === 0) {
    return (
      <p className="text-center text-zinc-400 text-sm py-8">
        No hay turnos para hoy
      </p>
    );
  }

  return (
    <div className="divide-y divide-zinc-100">
      {bookings.map((b) => (
        <div key={b.id} className="flex items-center justify-between py-3 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-center shrink-0 w-14">
              <p className="text-sm font-semibold text-zinc-900">{b.startTime}</p>
              <p className="text-xs text-zinc-400">{b.endTime}</p>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">
                {b.client.name ?? b.client.email}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {b.service.name} · {b.barberProfile.tenantMember.user.name}
              </p>
            </div>
          </div>
          <Badge variant={STATUS_VARIANTS[b.status]}>
            {STATUS_LABELS[b.status]}
          </Badge>
        </div>
      ))}
    </div>
  );
}
