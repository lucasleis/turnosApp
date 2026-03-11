"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BranchForm } from "./branch-form";

export function BranchFormPanel({ tenantId, tenantSlug }: { tenantId: string; tenantSlug: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <Button variant="accent" size="sm" onClick={() => setOpen(true)}>
        + Nueva sucursal
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-zinc-900">Nueva sucursal</h2>
          <button onClick={() => setOpen(false)} className="text-zinc-400 hover:text-zinc-700">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <BranchForm tenantId={tenantId} tenantSlug={tenantSlug} onSuccess={() => setOpen(false)} />
      </div>
    </div>
  );
}
