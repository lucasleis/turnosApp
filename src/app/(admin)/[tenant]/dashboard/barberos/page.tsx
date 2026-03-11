import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";
import { prisma } from "@/lib/prisma";
import { BarberCard } from "./_components/barber-card";
import { BarberFormPanel } from "./_components/barber-form-panel";

export default async function BarberosPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const barbers = await prisma.barberProfile.findMany({
    where: { tenantMember: { tenantId: tenant.id } },
    include: {
      tenantMember: { include: { user: true } },
      branch: true,
      schedules: true,
      blockedSlots: {
        where: { date: { gte: new Date() } },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { tenantMember: { user: { name: "asc" } } },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Barberos</h1>
        <BarberFormPanel
          tenantId={tenant.id}
          tenantSlug={slug}
          branches={tenant.branches}
        />
      </div>

      {barbers.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-zinc-200 rounded-xl">
          <p className="text-zinc-400 text-sm mb-3">No hay barberos registrados</p>
          <BarberFormPanel tenantId={tenant.id} tenantSlug={slug} branches={tenant.branches} />
        </div>
      ) : (
        <div className="grid gap-4">
          {barbers.map((barber) => (
            <BarberCard
              key={barber.id}
              barberProfile={barber}
              tenantSlug={slug}
            />
          ))}
        </div>
      )}
    </div>
  );
}
