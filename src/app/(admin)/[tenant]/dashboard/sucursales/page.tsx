import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";
import { prisma } from "@/lib/prisma";
import { BranchList } from "./_components/branch-list";
import { BranchFormPanel } from "./_components/branch-form-panel";

export default async function SucursalesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const branches = await prisma.branch.findMany({
    where: { tenantId: tenant.id },
    include: { _count: { select: { barberProfiles: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Sucursales</h1>
        <BranchFormPanel tenantId={tenant.id} tenantSlug={slug} />
      </div>
      <BranchList branches={branches} tenantId={tenant.id} tenantSlug={slug} />
    </div>
  );
}
