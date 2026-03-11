import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";
import { prisma } from "@/lib/prisma";
import { ServiceList } from "./_components/service-list";
import { ServiceFormPanel } from "./_components/service-form-panel";

export default async function ServiciosPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const services = await prisma.service.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Servicios</h1>
        <ServiceFormPanel tenantId={tenant.id} tenantSlug={slug} />
      </div>

      <ServiceList
        services={services}
        tenantId={tenant.id}
        tenantSlug={slug}
      />
    </div>
  );
}
