import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getTenantBySlug, getTenantBarbers } from "@/modules/tenants/get-tenant";
import { prisma } from "@/lib/prisma";
import { getAvailableSlots } from "@/modules/availability/get-slots";
import { minutesToTime, timeToMinutes } from "@/modules/availability/get-slots";
import { ProgressBar } from "./_components/progress-bar";
import { StepServicio } from "./_components/step-servicio";
import { StepBarbero } from "./_components/step-barbero";
import { StepFechaHora } from "./_components/step-fecha-hora";
import { StepConfirmar } from "./_components/step-confirmar";
import { getSession } from "@/lib/session";

export default async function ReservarPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{
    servicio?: string;
    barbero?: string;
    fecha?: string;
    hora?: string;
  }>;
}) {
  const { tenant: slug } = await params;
  const { servicio, barbero, fecha, hora } = await searchParams;

  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  // Determinar el paso actual
  const step = !servicio ? 1 : !barbero ? 2 : !fecha || !hora ? 3 : 4;

  // Paso 4 requiere sesión
  if (step === 4) {
    const session = await getSession();
    if (!session) redirect(`/login?from=/${slug}/reservar?servicio=${servicio}&barbero=${barbero}&fecha=${fecha}&hora=${hora}`);
  }

  const backHref =
    step === 2 ? `/${slug}/reservar` :
    step === 3 ? `/${slug}/reservar?servicio=${servicio}` :
    step === 4 ? `/${slug}/reservar?servicio=${servicio}&barbero=${barbero}` :
    `/${slug}`;

  return (
    <div>
      {/* Back */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {step === 1 ? "Volver al inicio" : "Atrás"}
      </Link>

      <ProgressBar currentStep={step as 1 | 2 | 3 | 4} />

      {/* Paso 1 — Seleccionar servicio */}
      {step === 1 && (
        <StepServicio services={tenant.services} tenantSlug={slug} />
      )}

      {/* Paso 2 — Seleccionar barbero */}
      {step === 2 && servicio && (
        <StepBarbero
          barbers={await getTenantBarbers(tenant.id)}
          tenantSlug={slug}
          serviceId={servicio}
        />
      )}

      {/* Paso 3 — Seleccionar fecha y hora */}
      {step === 3 && servicio && barbero && (() => {
        // Cargamos datos del barbero para el calendario
        return (
          <StepFechaHoraLoader
            tenantSlug={slug}
            serviceId={servicio}
            barberoId={barbero}
          />
        );
      })()}

      {/* Paso 4 — Confirmar */}
      {step === 4 && servicio && barbero && fecha && hora && (
        <StepConfirmarLoader
          tenantId={tenant.id}
          tenantSlug={slug}
          branchId={tenant.branches[0]?.id ?? ""}
          serviceId={servicio}
          barberoId={barbero}
          fecha={fecha}
          hora={hora}
        />
      )}
    </div>
  );
}

// Componente server que carga datos para el paso 3
async function StepFechaHoraLoader({
  tenantSlug,
  serviceId,
  barberoId,
}: {
  tenantSlug: string;
  serviceId: string;
  barberoId: string;
}) {
  const [service, barberProfile] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.barberProfile.findUnique({
      where: { id: barberoId },
      include: { schedules: true },
    }),
  ]);

  if (!service || !barberProfile) return notFound();

  // Traer bloqueos de días completos para los próximos 3 meses
  const now = new Date();
  const threeMonthsLater = new Date(now.getFullYear(), now.getMonth() + 3, 1);
  const fullDayBlocks = await prisma.blockedSlot.findMany({
    where: {
      barberProfileId: barberoId,
      startTime: null,
      endTime: null,
      date: { gte: now, lte: threeMonthsLater },
    },
  });

  const blockedDates = fullDayBlocks.map(
    (b) => b.date.toISOString().split("T")[0]
  );

  return (
    <StepFechaHora
      tenantSlug={tenantSlug}
      serviceId={serviceId}
      barberoId={barberoId}
      serviceDuration={service.duration}
      availableWeekdays={barberProfile.schedules.map((s) => s.dayOfWeek)}
      blockedDates={blockedDates}
    />
  );
}

// Componente server que carga datos para el paso 4
async function StepConfirmarLoader({
  tenantId,
  tenantSlug,
  branchId,
  serviceId,
  barberoId,
  fecha,
  hora,
}: {
  tenantId: string;
  tenantSlug: string;
  branchId: string;
  serviceId: string;
  barberoId: string;
  fecha: string;
  hora: string;
}) {
  const [service, barberProfile] = await Promise.all([
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.barberProfile.findUnique({
      where: { id: barberoId },
      include: { tenantMember: { include: { user: true } } },
    }),
  ]);

  if (!service || !barberProfile) return notFound();

  const endTime = minutesToTime(timeToMinutes(hora) + service.duration);

  return (
    <StepConfirmar
      tenantId={tenantId}
      tenantSlug={tenantSlug}
      branchId={branchId}
      serviceId={serviceId}
      serviceName={service.name}
      servicePrice={Number(service.price)}
      serviceDuration={service.duration}
      barberProfileId={barberoId}
      barberName={barberProfile.tenantMember.user.name ?? "Barbero"}
      fecha={fecha}
      hora={hora}
      endTime={endTime}
    />
  );
}
