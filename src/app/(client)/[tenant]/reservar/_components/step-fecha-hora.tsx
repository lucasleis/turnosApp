"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "./calendar";
import { SlotPicker } from "./slot-picker";
import { getAvailableSlotsAction } from "@/modules/availability/actions";
import { formatDate } from "@/lib/utils";

type StepFechaHoraProps = {
  tenantSlug: string;
  serviceId: string;
  barberoId: string;
  serviceDuration: number;
  availableWeekdays: string[];
  blockedDates: string[];
};

export function StepFechaHora({
  tenantSlug,
  serviceId,
  barberoId,
  serviceDuration,
  availableWeekdays,
  blockedDates,
}: StepFechaHoraProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotsLoaded, setSlotsLoaded] = useState(false);

  function handleDateSelect(dateStr: string) {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlotsLoaded(false);

    startTransition(async () => {
      const available = await getAvailableSlotsAction(barberoId, dateStr, serviceDuration);
      setSlots(available);
      setSlotsLoaded(true);
    });
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot);
    router.push(
      `/${tenantSlug}/reservar?servicio=${serviceId}&barbero=${barberoId}&fecha=${selectedDate}&hora=${slot}`
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">¿Cuándo querés ir?</h2>
      <p className="text-sm text-muted-foreground mb-6">Elegí un día y horario disponible</p>

      <div className="bg-card border border-border rounded-xl p-4 mb-4">
        <Calendar
          availableWeekdays={availableWeekdays}
          blockedDates={blockedDates}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
        />
      </div>

      {selectedDate && (
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-sm font-medium text-foreground capitalize mb-1">
            {formatDate(selectedDate)}
          </p>
          <p className="text-xs text-muted-foreground mb-2">
            Seleccioná un horario disponible
          </p>
          <SlotPicker
            slots={slots}
            selectedSlot={selectedSlot}
            onSelectSlot={handleSlotSelect}
            loading={isPending && !slotsLoaded}
          />
        </div>
      )}
    </div>
  );
}
