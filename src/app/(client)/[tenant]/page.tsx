import Link from "next/link";
import { getTenantBySlug, getTenantBarbers } from "@/modules/tenants/get-tenant";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { formatPrice, formatDuration } from "@/lib/utils";

export default async function TenantPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const barbers = await getTenantBarbers(tenant.id);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center py-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {tenant.name}
        </h1>
        {tenant.description && (
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            {tenant.description}
          </p>
        )}
        <Link href={`/${slug}/reservar`}>
          <Button variant="accent" size="lg" className="px-8">
            Reservar turno
          </Button>
        </Link>
      </section>

      {/* Servicios */}
      {tenant.services.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Servicios
          </h2>
          <div className="grid gap-3">
            {tenant.services.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-card"
              >
                <div>
                  <p className="font-medium text-foreground">{service.name}</p>
                  {service.description && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {service.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatDuration(service.duration)}
                  </p>
                </div>
                <p className="font-semibold text-foreground text-lg">
                  {formatPrice(Number(service.price))}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Barberos */}
      {barbers.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Nuestro equipo
          </h2>
          <div className="grid gap-3">
            {barbers.map((barber) => (
              <div
                key={barber.id}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
              >
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-600 font-semibold text-sm shrink-0">
                  {barber.tenantMember.user.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {barber.tenantMember.user.name}
                  </p>
                  {barber.bio && (
                    <p className="text-sm text-muted-foreground">{barber.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
