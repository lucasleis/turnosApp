import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";
import { prisma } from "@/lib/prisma";
import { StatCard } from "./_components/stat-card";
import { TodayBookings } from "./_components/today-bookings";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todayBookings, weekBookings, totalServices, totalBarbers] =
    await Promise.all([
      prisma.booking.findMany({
        where: {
          tenantId: tenant.id,
          date: { gte: todayStart, lt: todayEnd },
          status: { not: "CANCELLED" },
        },
        include: {
          service: true,
          client: true,
          barberProfile: { include: { tenantMember: { include: { user: true } } } },
        },
        orderBy: { startTime: "asc" },
      }),
      prisma.booking.count({
        where: {
          tenantId: tenant.id,
          date: { gte: weekStart, lt: weekEnd },
          status: { not: "CANCELLED" },
        },
      }),
      prisma.service.count({ where: { tenantId: tenant.id, isActive: true } }),
      prisma.barberProfile.count({
        where: { tenantMember: { tenantId: tenant.id } },
      }),
    ]);

  const confirmedToday = todayBookings.filter((b) => b.status === "CONFIRMED").length;
  const pendingToday = todayBookings.filter((b) => b.status === "PENDING").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">Resumen</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {now.toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Turnos hoy"
          value={todayBookings.length}
          sub={`${confirmedToday} confirmados · ${pendingToday} pendientes`}
          accent
        />
        <StatCard label="Turnos esta semana" value={weekBookings} />
        <StatCard label="Servicios activos" value={totalServices} />
        <StatCard label="Barberos" value={totalBarbers} />
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Ver turnos", href: "turnos" },
          { label: "Servicios", href: "servicios" },
          { label: "Barberos", href: "barberos" },
          { label: "Sucursales", href: "sucursales" },
        ].map((item) => (
          <Link
            key={item.href}
            href={`/${slug}/dashboard/${item.href}`}
            className="flex items-center justify-center h-11 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:border-zinc-400 hover:text-zinc-900 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </div>

      {/* Turnos de hoy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest">
            Agenda de hoy
          </h2>
          <Link
            href={`/${slug}/dashboard/turnos`}
            className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            Ver todos →
          </Link>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 px-4">
          <TodayBookings bookings={todayBookings} />
        </div>
      </div>
    </div>
  );
}
