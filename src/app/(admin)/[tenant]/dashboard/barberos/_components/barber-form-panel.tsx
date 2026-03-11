"use client";

import { useState, useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBarber } from "../actions";

type Branch = { id: string; name: string };

export function BarberFormPanel({
  tenantId,
  tenantSlug,
  branches,
}: {
  tenantId: string;
  tenantSlug: string;
  branches: Branch[];
}) {
  const [open, setOpen] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [state, formAction, isPending] = useActionState(createBarber, null);

  useEffect(() => {
    if (state && "success" in state) {
      if (state.inviteToken) setInviteToken(state.inviteToken);
      else setOpen(false);
    }
  }, [state]);

  if (inviteToken) {
    const activateUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/activar?token=${inviteToken}`;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
          <h2 className="text-lg font-semibold text-zinc-900 mb-2">Barbero creado</h2>
          <p className="text-sm text-zinc-500 mb-4">
            Compartí este link con el barbero para que active su cuenta y establezca su contraseña.
            (En módulo 6 esto se enviará por email automáticamente.)
          </p>
          <div className="bg-zinc-50 rounded-lg p-3 text-xs font-mono text-zinc-700 break-all mb-4">
            {activateUrl}
          </div>
          <Button
            variant="accent"
            className="w-full"
            onClick={() => { setInviteToken(null); setOpen(false); }}
          >
            Listo
          </Button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
        + Nuevo barbero
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Nuevo barbero</h2>
          <button
            onClick={() => setOpen(false)}
            className="text-zinc-400 hover:text-zinc-700"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <form action={formAction} className="space-y-4">
          <input type="hidden" name="tenantId" value={tenantId} />
          <input type="hidden" name="tenantSlug" value={tenantSlug} />

          <div>
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" name="name" placeholder="Carlos López" required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" placeholder="carlos@barberia.com" required />
          </div>
          <div>
            <Label htmlFor="branchId">Sucursal</Label>
            <select
              id="branchId"
              name="branchId"
              required
              className="w-full h-11 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          {state && "error" in state && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" variant="accent" loading={isPending} className="w-full">
            Crear barbero
          </Button>
        </form>
      </div>
    </div>
  );
}
