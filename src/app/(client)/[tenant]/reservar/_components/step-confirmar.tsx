"use client";

import { useActionState } from "react";
import { confirmarReserva } from "@/modules/bookings/create-booking";
import { Button } from "@/components/ui/button";
import { formatDate, formatPrice, formatDuration } from "@/lib/utils";

type StepConfirmarProps = {
  tenantId: string;
  tenantSlug: string;
  branchId: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberProfileId: string;
  barberName: string;
  fecha: string;
  hora: string;
  endTime: string;
};

export function StepConfirmar({
  tenantId,
  tenantSlug,
  branchId,
  serviceId,
  serviceName,
  servicePrice,
  serviceDuration,
  barberProfileId,
  barberName,
  fecha,
  hora,
  endTime,
}: StepConfirmarProps) {
  const [state, formAction, isPending] = useActionState(confirmarReserva, null);

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">Confirmá tu turno</h2>
      <p className="text-sm text-muted-foreground mb-6">
        Revisá los detalles antes de confirmar
      </p>

      {/* Resumen */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border mb-6">
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">Servicio</span>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">{serviceName}</p>
            <p className="text-xs text-muted-foreground">{formatDuration(serviceDuration)}</p>
          </div>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">Barbero</span>
          <p className="text-sm font-medium text-foreground">{barberName}</p>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">Fecha</span>
          <p className="text-sm font-medium text-foreground capitalize">{formatDate(fecha)}</p>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">Horario</span>
          <p className="text-sm font-medium text-foreground">
            {hora} – {endTime}
          </p>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <span className="text-sm text-muted-foreground">Total</span>
          <p className="text-base font-semibold text-foreground">
            {formatPrice(servicePrice)}
          </p>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive bg-destructive/8 px-4 py-3 rounded-xl mb-4">
          {state.error}
        </p>
      )}

      <form action={formAction}>
        <input type="hidden" name="tenantId" value={tenantId} />
        <input type="hidden" name="tenantSlug" value={tenantSlug} />
        <input type="hidden" name="branchId" value={branchId} />
        <input type="hidden" name="serviceId" value={serviceId} />
        <input type="hidden" name="barberProfileId" value={barberProfileId} />
        <input type="hidden" name="fecha" value={fecha} />
        <input type="hidden" name="hora" value={hora} />

        <Button
          type="submit"
          variant="accent"
          size="lg"
          loading={isPending}
          className="w-full"
        >
          Confirmar turno
        </Button>
      </form>
    </div>
  );
}
