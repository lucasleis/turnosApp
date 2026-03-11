import { Badge } from "@/components/ui/badge";
import { CancelButton } from "./cancel-button";
import { formatDate, formatPrice } from "@/lib/utils";
import { BookingStatus } from "@prisma/client";

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

type BookingCardProps = {
  booking: {
    id: string;
    date: Date;
    startTime: string;
    endTime: string;
    status: BookingStatus;
    service: { name: string; price: unknown };
    barberProfile: { tenantMember: { user: { name: string | null } } };
    branch: { name: string };
  };
  tenantSlug: string;
  canCancel: boolean;
};

export function BookingCard({ booking, tenantSlug, canCancel }: BookingCardProps) {
  const dateStr = booking.date.toISOString().split("T")[0];

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-foreground">{booking.service.name}</p>
          <p className="text-sm text-muted-foreground">
            con {booking.barberProfile.tenantMember.user.name}
          </p>
        </div>
        <Badge variant={STATUS_VARIANTS[booking.status]}>
          {STATUS_LABELS[booking.status]}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <p className="text-xs text-muted-foreground">Fecha</p>
          <p className="text-foreground capitalize">{formatDate(dateStr)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Horario</p>
          <p className="text-foreground">{booking.startTime} – {booking.endTime}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Sucursal</p>
          <p className="text-foreground">{booking.branch.name}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-foreground font-medium">{formatPrice(booking.service.price as number)}</p>
        </div>
      </div>

      {canCancel && (
        <CancelButton bookingId={booking.id} tenantSlug={tenantSlug} />
      )}
    </div>
  );
}
