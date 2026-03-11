"use client";

import { useActionState } from "react";
import { cancelarTurno } from "@/modules/bookings/cancel-booking";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function CancelButton({
  bookingId,
  tenantSlug,
}: {
  bookingId: string;
  tenantSlug: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [state, formAction, isPending] = useActionState(cancelarTurno, null);

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setConfirming(true)}
        className="text-destructive border-destructive/30 hover:bg-destructive/8 hover:border-destructive"
      >
        Cancelar turno
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {state && "error" in state && (
        <p className="text-xs text-destructive">{state.error}</p>
      )}
      <p className="text-xs text-muted-foreground">¿Estás seguro?</p>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setConfirming(false)}
          disabled={isPending}
        >
          No
        </Button>
        <form action={formAction}>
          <input type="hidden" name="bookingId" value={bookingId} />
          <input type="hidden" name="tenantSlug" value={tenantSlug} />
          <Button
            type="submit"
            size="sm"
            variant="destructive"
            loading={isPending}
          >
            Sí, cancelar
          </Button>
        </form>
      </div>
    </div>
  );
}
