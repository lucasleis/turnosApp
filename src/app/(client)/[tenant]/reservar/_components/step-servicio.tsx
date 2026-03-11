import Link from "next/link";
import { formatPrice, formatDuration } from "@/lib/utils";

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: unknown;
};

export function StepServicio({
  services,
  tenantSlug,
}: {
  services: Service[];
  tenantSlug: string;
}) {
  if (services.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Este negocio todavía no tiene servicios disponibles.
      </p>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground mb-1">¿Qué servicio querés?</h2>
      <p className="text-sm text-muted-foreground mb-6">Seleccioná un servicio para continuar</p>

      <div className="grid gap-3">
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/${tenantSlug}/reservar?servicio=${service.id}`}
            className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:border-accent hover:bg-accent/5 transition-all group"
          >
            <div>
              <p className="font-medium text-foreground group-hover:text-accent transition-colors">
                {service.name}
              </p>
              {service.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{service.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{formatDuration(service.duration)}</p>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-semibold text-foreground">{formatPrice(service.price as number)}</p>
              <svg className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
