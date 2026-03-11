"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { BranchForm } from "./branch-form";
import { toggleBranch } from "../actions";
import { cn } from "@/lib/utils";

type Branch = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  _count: { barberProfiles: number };
};

export function BranchList({
  branches,
  tenantId,
  tenantSlug,
}: {
  branches: Branch[];
  tenantId: string;
  tenantSlug: string;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <div className="bg-white rounded-xl border border-zinc-200 divide-y divide-zinc-100">
      {branches.length === 0 && (
        <p className="text-center text-zinc-400 text-sm py-12">No hay sucursales registradas.</p>
      )}
      {branches.map((branch) => (
        <div key={branch.id} className="p-4">
          {editing === branch.id ? (
            <div>
              <p className="text-sm font-medium text-zinc-700 mb-4">Editando: {branch.name}</p>
              <BranchForm
                tenantId={tenantId}
                tenantSlug={tenantSlug}
                branch={branch}
                onSuccess={() => setEditing(null)}
              />
              <button onClick={() => setEditing(null)} className="mt-3 text-sm text-zinc-400 hover:text-zinc-600">
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className={cn(!branch.isActive && "opacity-50")}>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-zinc-900">{branch.name}</p>
                  {!branch.isActive && (
                    <span className="text-xs bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">Inactiva</span>
                  )}
                </div>
                {branch.address && <p className="text-sm text-zinc-500 mt-0.5">{branch.address}</p>}
                {branch.phone && <p className="text-sm text-zinc-400">{branch.phone}</p>}
                <p className="text-xs text-zinc-400 mt-1">{branch._count.barberProfiles} barbero{branch._count.barberProfiles !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setEditing(branch.id)}>
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={branch.isActive ? "text-destructive hover:text-destructive" : ""}
                  disabled={isPending}
                  onClick={() => startTransition(async () => { await toggleBranch(branch.id, tenantId, tenantSlug); })}
                >
                  {branch.isActive ? "Desactivar" : "Activar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
