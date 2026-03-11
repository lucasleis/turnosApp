import { notFound } from "next/navigation";
import { getTenantBySlug, getTenantBarbers } from "@/modules/tenants/get-tenant";
import { prisma } from "@/lib/prisma";
import { StatusSelect } from "./_components/status-select";
import { TurnosFilters } from "./_components/turnos-filters";
import { formatDate } from "@/lib/utils";
import { BookingStatus } from "@prisma/client";


export default async function TurnosPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ estado?: string; barbero?: string; fecha?: string }>;
}) {
  const { tenant: slug } = await params;
  const { estado, barbero, fecha } = await searchParams;

  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const barbers = await getTenantBarbers(tenant.id);

  const where = {
    tenantId: tenant.id,
    ...(estado ? { status: estado as BookingStatus } : {}),
    ...(barbero ? { barberProfileId: barbero } : {}),
    ...(fecha ? {
      date: {
        gte: new Date(`${fecha}T00:00:00.000Z`),
        lte: new Date(`${fecha}T23:59:59.999Z`),
      },
    } : {}),
  };

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      service: true,
      client: true,
      barberProfile: { include: { tenantMember: { include: { user: true } } } },
      branch: true,
    },
    orderBy: [{ date: "desc" }, { startTime: "asc" }],
    take: 100,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900">Turnos</h1>

      <TurnosFilters
        tenantSlug={slug}
        barbers={barbers}
        estado={estado}
        barbero={barbero}
        fecha={fecha}
      />

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        {bookings.length === 0 ? (
          <p className="text-center text-zinc-400 text-sm py-12">
            No hay turnos con los filtros seleccionados
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Horario</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cliente</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Servicio</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Barbero</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 text-zinc-700 capitalize whitespace-nowrap">
                      {formatDate(b.date.toISOString().split("T")[0])}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 whitespace-nowrap">
                      {b.startTime} – {b.endTime}
                    </td>
                    <td className="px-4 py-3 text-zinc-900 font-medium">
                      {b.client.name ?? b.client.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-700">{b.service.name}</td>
                    <td className="px-4 py-3 text-zinc-700">
                      {b.barberProfile.tenantMember.user.name}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect
                        bookingId={b.id}
                        currentStatus={b.status}
                        tenantSlug={slug}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
