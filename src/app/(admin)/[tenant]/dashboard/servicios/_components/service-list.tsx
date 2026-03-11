"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { ServiceForm } from "./service-form";
import { toggleService } from "../actions";
import { formatPrice, formatDuration, cn } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: unknown;
  isActive: boolean;
};

export function ServiceList({
  services,
  tenantId,
  tenantSlug,
}: {
  services: Service[];
  tenantId: string;
  tenantSlug: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
      {services.length === 0 && (
        <p className="text-center text-zinc-400 text-sm py-12">
          No hay servicios. Creá el primero.
        </p>
      )}
      {services.map((service) => (
        <div key={service.id} className="p-4">
          {editing === service.id ? (
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-4">Editando: {service.name}</p>
              <ServiceForm
                tenantId={tenantId}
                tenantSlug={tenantSlug}
                service={service}
                onSuccess={() => setEditing(null)}
              />
              <button
                onClick={() => setEditing(null)}
                className="mt-3 text-sm text-zinc-400 hover:text-zinc-600"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className={cn(!service.isActive && "opacity-50")}>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900">{service.name}</p>
                  {!service.isActive && (
                    <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">
                      Inactivo
                    </span>
                  )}
                </div>
                {service.description && (
                  <p className="text-sm text-zinc-500 mt-0.5">{service.description}</p>
                )}
                <p className="text-sm text-zinc-400 mt-1">
                  {formatDuration(service.duration)} · {formatPrice(service.price as number)}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditing(service.id)}
                >
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={service.isActive ? "text-destructive hover:text-destructive" : ""}
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => { await toggleService(service.id, tenantSlug); })
                  }
                >
                  {service.isActive ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
