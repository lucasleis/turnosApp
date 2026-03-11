"use client";

import { useRouter } from "next/navigation";

const STATUS_OPTIONS = [
  { value: "", label: "Todos los estados" },
  { value: "PENDING", label: "Pendientes" },
  { value: "CONFIRMED", label: "Confirmados" },
  { value: "COMPLETED", label: "Completados" },
  { value: "CANCELLED", label: "Cancelados" },
];

type Barber = { id: string; tenantMember: { user: { name: string | null } } };

type TurnosFiltersProps = {
  tenantSlug: string;
  barbers: Barber[];
  estado?: string;
  barbero?: string;
  fecha?: string;
};

const SELECT_CLASS =
  "h-9 px-3 text-sm rounded-lg border border-zinc-200 bg-white text-zinc-700 focus:outline-none focus:ring-2 focus:ring-accent/40";

export function TurnosFilters({ tenantSlug, barbers, estado, barbero, fecha }: TurnosFiltersProps) {
  const router = useRouter();
  const base = `/${tenantSlug}/dashboard/turnos`;

  function navigate(overrides: Record<string, string>) {
    const params = new URLSearchParams();
    const merged = { estado: estado ?? "", barbero: barbero ?? "", fecha: fecha ?? "", ...overrides };
    Object.entries(merged).forEach(([k, v]) => { if (v) params.set(k, v); });
    const qs = params.toString();
    router.push(qs ? `${base}?${qs}` : base);
  }

  const hasFilters = !!(estado || barbero || fecha);

  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={estado ?? ""}
        onChange={(e) => navigate({ estado: e.target.value })}
        className={SELECT_CLASS}
      >
        {STATUS_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      <select
        value={barbero ?? ""}
        onChange={(e) => navigate({ barbero: e.target.value })}
        className={SELECT_CLASS}
      >
        <option value="">Todos los barberos</option>
        {barbers.map((b) => (
          <option key={b.id} value={b.id}>
            {b.tenantMember.user.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={fecha ?? ""}
        onChange={(e) => navigate({ fecha: e.target.value })}
        className={SELECT_CLASS}
      />

      {hasFilters && (
        <a
          href={base}
          className="h-9 px-4 text-sm font-medium rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center transition-colors"
        >
          Limpiar
        </a>
      )}
    </div>
  );
}
