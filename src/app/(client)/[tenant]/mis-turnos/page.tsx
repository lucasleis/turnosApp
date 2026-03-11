import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BookingCard } from "./_components/booking-card";
import { Button } from "@/components/ui/button";

export default async function MisTurnosPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;

  const session = await getSession();
  if (!session) redirect(`/login?from=/${slug}/mis-turnos`);

  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const bookings = await prisma.booking.findMany({
    where: { tenantId: tenant.id, clientId: session.user.id },
    include: {
      service: true,
      barberProfile: { include: { tenantMember: { include: { user: true } } } },
      branch: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "desc" }],
  });

  const now = new Date();

  const upcoming = bookings.filter((b) =>
    ["PENDING", "CONFIRMED"].includes(b.status)
  );
  const history = bookings.filter((b) =>
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(b.status)
  );

  function canCancel(booking: (typeof bookings)[number]): boolean {
    const bookingDate = new Date(booking.date);
    const [h, m] = booking.startTime.split(":").map(Number);
    bookingDate.setHours(h, m, 0, 0);
    return (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60) >= 2;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Mis turnos</h1>
        <Link href={`/${slug}/reservar`}>
          <Button variant="accent" size="sm">
            + Nuevo turno
          </Button>
        </Link>
      </div>

      {/* Próximos */}
      <section>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
          Próximos
        </h2>
        {upcoming.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground text-sm mb-3">No tenés turnos próximos</p>
            <Link href={`/${slug}/reservar`}>
              <Button variant="outline" size="sm">Reservar turno</Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {upcoming.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                tenantSlug={slug}
                canCancel={canCancel(booking)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Historial */}
      {history.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Historial
          </h2>
          <div className="grid gap-3">
            {history.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                tenantSlug={slug}
                canCancel={false}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
