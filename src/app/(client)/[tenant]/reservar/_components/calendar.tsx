"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const DAY_HEADERS = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sa", "Do"];

// DayOfWeek enum → JS getDay() (0=Dom)
const DAYOFWEEK_TO_JS: Record<string, number> = {
  SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3,
  THURSDAY: 4, FRIDAY: 5, SATURDAY: 6,
};

type CalendarProps = {
  availableWeekdays: string[]; // DayOfWeek enum values
  blockedDates: string[];      // "YYYY-MM-DD"
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

function toDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function Calendar({
  availableWeekdays,
  blockedDates,
  selectedDate,
  onSelectDate,
}: CalendarProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const availableJsDays = availableWeekdays.map((d) => DAYOFWEEK_TO_JS[d]);
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Monday-first offset: JS Sunday=0 → col 6, Monday=1 → col 0
  const firstJsDay = new Date(viewYear, viewMonth, 1).getDay();
  const startOffset = firstJsDay === 0 ? 6 : firstJsDay - 1;

  const isMinMonth =
    viewYear === today.getFullYear() && viewMonth === today.getMonth();
  const isMaxMonth = viewMonth === today.getMonth() + 2 && viewYear === today.getFullYear();

  function prevMonth() {
    if (isMinMonth) return;
    if (viewMonth === 0) { setViewYear(viewYear - 1); setViewMonth(11); }
    else setViewMonth(viewMonth - 1);
  }
  function nextMonth() {
    if (isMaxMonth) return;
    if (viewMonth === 11) { setViewYear(viewYear + 1); setViewMonth(0); }
    else setViewMonth(viewMonth + 1);
  }

  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div className="select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          disabled={isMinMonth}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p className="font-semibold text-foreground text-sm">
          {MONTH_NAMES[viewMonth]} {viewYear}
        </p>
        <button
          onClick={nextMonth}
          disabled={isMaxMonth}
          className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_HEADERS.map((d) => (
          <p key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </p>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} />;

          const dateStr = toDateStr(viewYear, viewMonth, day);
          const jsDay = new Date(viewYear, viewMonth, day).getDay();
          const date = new Date(viewYear, viewMonth, day);

          const isPast = date < today;
          const isUnavailableDay = !availableJsDays.includes(jsDay);
          const isBlocked = blockedDates.includes(dateStr);
          const isDisabled = isPast || isUnavailableDay || isBlocked;
          const isSelected = selectedDate === dateStr;
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={idx}
              onClick={() => !isDisabled && onSelectDate(dateStr)}
              disabled={isDisabled}
              className={cn(
                "aspect-square flex items-center justify-center rounded-lg text-sm transition-all",
                isSelected && "bg-accent text-white font-semibold",
                !isSelected && !isDisabled && "hover:bg-muted text-foreground",
                !isSelected && isToday && "font-semibold text-accent",
                isDisabled && "text-muted-foreground/40 cursor-not-allowed",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
