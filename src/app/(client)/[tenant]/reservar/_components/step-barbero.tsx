import Link from "next/link";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Lu",
  TUESDAY: "Ma",
  WEDNESDAY: "Mi",
  THURSDAY: "Ju",
  FRIDAY: "Vi",
  SATURDAY: "Sa",
  SUNDAY: "Do",
};

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

type BarberProfile = {
  id: string;
  bio: string | null;
  tenantMember: { user: { name: string | null } };
  schedules: { dayOfWeek: string }[];
};

export function StepBarbero({
  barbers,
  tenantSlug,
  serviceId,
}: {
  barbers: BarberProfile[];
  tenantSlug: string;
  serviceId: string;
}) {
  if (barbers.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        No hay barberos disponibles.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">¿Con quién querés ir?</h2>
      <p className="text-sm text-muted-foreground mb-6">Seleccioná un barbero</p>

      <div className="grid gap-3">
        {barbers.map((barber) => {
          const sortedDays = [...barber.schedules]
            .sort((a, b) => DAY_ORDER.indexOf(a.dayOfWeek) - DAY_ORDER.indexOf(b.dayOfWeek));

          return (
            <Link
              key={barber.id}
              href={`/${tenantSlug}/reservar?servicio=${serviceId}&barbero=${barber.id}`}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all group"
            >
              <div className="w-11 h-11 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold shrink-0">
                {barber.tenantMember.user.name?.[0]?.toUpperCase() ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                  {barber.tenantMember.user.name}
                </p>
                {barber.bio && (
                  <p className="text-sm text-muted-foreground mt-0.5 truncate">{barber.bio}</p>
                )}
                {sortedDays.length > 0 && (
                  <div className="flex gap-1 mt-2">
                    {sortedDays.map((s) => (
                      <span
                        key={s.dayOfWeek}
                        className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                      >
                        {DAY_LABELS[s.dayOfWeek]}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <svg className="w-4 h-4 text-muted-foreground group-hover:text-accent shrink-0 transition-colors" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
