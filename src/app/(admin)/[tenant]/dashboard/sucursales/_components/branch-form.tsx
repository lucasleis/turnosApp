"use client";

import { useActionState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBranch, updateBranch } from "../actions";

type Branch = { id: string; name: string; address: string | null; phone: string | null };

export function BranchForm({
  tenantId,
  tenantSlug,
  branch,
  onSuccess,
}: {
  tenantId: string;
  tenantSlug: string;
  branch?: Branch;
  onSuccess?: () => void;
}) {
  const action = branch ? updateBranch : createBranch;
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state && "success" in state) onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tenantId" value={tenantId} />
      <input type="hidden" name="tenantSlug" value={tenantSlug} />
      {branch && <input type="hidden" name="branchId" value={branch.id} />}

      <div>
        <Label htmlFor="name">Nombre de la sucursal</Label>
        <Input id="name" name="name" defaultValue={branch?.name} placeholder="Sucursal Centro" required />
      </div>
      <div>
        <Label htmlFor="address">Dirección (opcional)</Label>
        <Input id="address" name="address" defaultValue={branch?.address ?? ""} placeholder="Av. Corrientes 1234" />
      </div>
      <div>
        <Label htmlFor="phone">Teléfono (opcional)</Label>
        <Input id="phone" name="phone" defaultValue={branch?.phone ?? ""} placeholder="11 1234-5678" />
      </div>

      {state && "error" in state && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}

      <Button type="submit" variant="accent" loading={isPending} className="w-full">
        {branch ? "Guardar cambios" : "Crear sucursal"}
      </Button>
    </form>
  );
}
