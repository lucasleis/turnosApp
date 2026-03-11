"use client";

import { useState, useTransition } from "react";
import { useActionState } from "react";
import { ScheduleEditor } from "./schedule-editor";
import { addBlockedSlot, deleteBlockedSlot } from "../actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DayOfWeek } from "@prisma/client";
import { cn } from "@/lib/utils";

type Schedule = { dayOfWeek: DayOfWeek; startTime: string; endTime: string };
type BlockedSlot = { id: string; date: Date; startTime: string | null; endTime: string | null; reason: string | null };

type BarberCardProps = {
  barberProfile: {
    id: string;
    bio: string | null;
    tenantMember: { user: { name: string | null; email: string } };
    branch: { name: string };
    schedules: Schedule[];
    blockedSlots: BlockedSlot[];
  };
  tenantSlug: string;
};

export function BarberCard({ barberProfile, tenantSlug }: BarberCardProps) {
  const [tab, setTab] = useState<"horario" | "bloqueos">("horario");
  const [addingBlock, setAddingBlock] = useState(false);
  const [deletingId, startDelete] = useTransition();

  const [blockState, blockAction, isBlockPending] = useActionState(addBlockedSlot, null);

  const user = barberProfile.tenantMember.user;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-zinc-100">
        <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-sm shrink-0">
          {user.name?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div>
          <p className="font-semibold text-zinc-900">{user.name}</p>
          <p className="text-xs text-zinc-500">{user.email} · {barberProfile.branch.name}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-100">
        {(["horario", "bloqueos"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2.5 text-sm font-medium capitalize transition-colors",
              tab === t
                ? "text-zinc-900 border-b-2 border-accent"
                : "text-zinc-400 hover:text-zinc-700"
            )}
          >
            {t === "horario" ? "Horario semanal" : `Bloqueos (${barberProfile.blockedSlots.length})`}
          </button>
        ))}
      </div>

      <div className="p-4">
        {tab === "horario" && (
          <ScheduleEditor
            barberProfileId={barberProfile.id}
            schedules={barberProfile.schedules}
            tenantSlug={tenantSlug}
          />
        )}

        {tab === "bloqueos" && (
          <div className="space-y-3">
            {barberProfile.blockedSlots.length === 0 && !addingBlock && (
              <p className="text-sm text-zinc-400">Sin bloqueos registrados</p>
            )}
            {barberProfile.blockedSlots.map((slot) => (
              <div key={slot.id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-50">
                <div>
                  <p className="text-zinc-800 font-medium">
                    {new Date(slot.date).toLocaleDateString("es-AR", { weekday: "short", day: "numeric", month: "short" })}
                    {slot.startTime && ` · ${slot.startTime}–${slot.endTime}`}
                  </p>
                  {slot.reason && <p className="text-xs text-zinc-400">{slot.reason}</p>}
                </div>
                <button
                  onClick={() => startDelete(async () => { await deleteBlockedSlot(slot.id, tenantSlug); })}
                  className="text-zinc-300 hover:text-destructive transition-colors p-1"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            ))}

            {addingBlock ? (
              <form action={blockAction} className="space-y-3 pt-2">
                <input type="hidden" name="barberProfileId" value={barberProfile.id} />
                <input type="hidden" name="tenantSlug" value={tenantSlug} />
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Fecha</Label>
                    <Input type="date" name="date" required />
                  </div>
                  <div>
                    <Label>Motivo (opcional)</Label>
                    <Input name="reason" placeholder="Vacaciones..." />
                  </div>
                  <div>
                    <Label>Desde (vacío = día completo)</Label>
                    <Input type="time" name="startTime" />
                  </div>
                  <div>
                    <Label>Hasta</Label>
                    <Input type="time" name="endTime" />
                  </div>
                </div>
                {blockState && "error" in blockState && (
                  <p className="text-xs text-destructive">{blockState.error}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" variant="accent" loading={isBlockPending}>
                    Guardar
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setAddingBlock(false)}>
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setAddingBlock(true)}>
                + Agregar bloqueo
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
