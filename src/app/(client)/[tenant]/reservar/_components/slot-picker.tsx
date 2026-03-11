"use client";

import { cn } from "@/lib/utils";

type SlotPickerProps = {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
  loading?: boolean;
};

export function SlotPicker({ slots, selectedSlot, onSelectSlot, loading }: SlotPickerProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-2 mt-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground mt-4 py-4">
        No hay horarios disponibles para este día
      </p>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2 mt-4">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelectSlot(slot)}
          className={cn(
            "h-10 rounded-lg text-sm font-medium transition-all",
            selectedSlot === slot
              ? "bg-accent text-white"
              : "bg-muted text-foreground hover:bg-muted/70 border border-border"
          )}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
