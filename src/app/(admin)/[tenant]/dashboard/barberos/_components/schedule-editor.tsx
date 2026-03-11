"use client";

import { useTransition } from "react";
import { DayOfWeek } from "@prisma/client";
import { updateSchedule } from "../actions";
import { cn } from "@/lib/utils";

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: "MONDAY", label: "Lunes" },
  { value: "TUESDAY", label: "Martes" },
  { value: "WEDNESDAY", label: "Miércoles" },
  { value: "THURSDAY", label: "Jueves" },
  { value: "FRIDAY", label: "Viernes" },
  { value: "SATURDAY", label: "Sábado" },
  { value: "SUNDAY", label: "Domingo" },
];

type Schedule = { dayOfWeek: DayOfWeek; startTime: string; endTime: string };

export function ScheduleEditor({
  barberProfileId,
  schedules,
  tenantSlug,
}: {
  barberProfileId: string;
  schedules: Schedule[];
  tenantSlug: string;
}) {
  const [isPending, startTransition] = useTransition();
  const scheduleMap = Object.fromEntries(schedules.map((s) => [s.dayOfWeek, s]));

  function handleToggle(day: DayOfWeek, enabled: boolean) {
    startTransition(async () => {
      await updateSchedule(barberProfileId, day, enabled ? "09:00" : null, enabled ? "18:00" : null, tenantSlug);
    });
  }

  function handleTimeChange(day: DayOfWeek, field: "startTime" | "endTime", value: string) {
    const current = scheduleMap[day];
    if (!current) return;
    startTransition(async () => {
      await updateSchedule(
        barberProfileId, day,
        field === "startTime" ? value : current.startTime,
        field === "endTime" ? value : current.endTime,
        tenantSlug
      );
    });
  }

  return (
    <div className={cn("space-y-2", isPending && "opacity-60 pointer-events-none")}>
      {DAYS.map(({ value, label }) => {
        const schedule = scheduleMap[value];
        const isActive = !!schedule;

        return (
          <div key={value} className="flex items-center gap-3">
            <button
              onClick={() => handleToggle(value, !isActive)}
              className={cn(
                "w-9 h-5 rounded-full relative transition-colors shrink-0",
                isActive ? "bg-accent" : "bg-zinc-200"
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
                  isActive ? "translate-x-4" : "translate-x-0.5"
                )}
              />
            </button>
            <span className={cn("text-sm w-20 shrink-0", isActive ? "text-zinc-900 font-medium" : "text-zinc-400")}>
              {label}
            </span>
            {isActive && (
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={schedule.startTime}
                  onChange={(e) => handleTimeChange(value, "startTime", e.target.value)}
                  className="h-8 px-2 text-sm rounded-lg border border-zinc-200 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
                <span className="text-zinc-400 text-xs">a</span>
                <input
                  type="time"
                  value={schedule.endTime}
                  onChange={(e) => handleTimeChange(value, "endTime", e.target.value)}
                  className="h-8 px-2 text-sm rounded-lg border border-zinc-200 text-zinc-700 focus:outline-none focus:ring-2 focus:ring-accent/40"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
