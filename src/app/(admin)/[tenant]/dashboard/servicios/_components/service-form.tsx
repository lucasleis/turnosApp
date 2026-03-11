"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createService, updateService } from "../actions";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: unknown;
};

type ServiceFormProps = {
  tenantId: string;
  tenantSlug: string;
  service?: Service;
  onSuccess?: () => void;
};

export function ServiceForm({ tenantId, tenantSlug, service, onSuccess }: ServiceFormProps) {
  const action = service ? updateService : createService;
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state && "success" in state) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tenantId" value={tenantId} />
      <input type="hidden" name="tenantSlug" value={tenantSlug} />
      {service && <input type="hidden" name="serviceId" value={service.id} />}

      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input
          id="name"
          name="name"
          defaultValue={service?.name}
          placeholder="Corte de pelo"
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción (opcional)</Label>
        <Input
          id="description"
          name="description"
          defaultValue={service?.description ?? ""}
          placeholder="Descripción breve del servicio"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duración (minutos)</Label>
          <Input
            id="duration"
            name="duration"
            type="number"
            min="5"
            step="5"
            defaultValue={service?.duration ?? 30}
            required
          />
        </div>
        <div>
          <Label htmlFor="price">Precio ($)</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            step="100"
            defaultValue={service ? Number(service.price) : ""}
            placeholder="2000"
            required
          />
        </div>
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" variant="accent" loading={isPending} className="w-full">
        {service ? "Guardar cambios" : "Crear servicio"}
      </Button>
    </form>
  );
}
