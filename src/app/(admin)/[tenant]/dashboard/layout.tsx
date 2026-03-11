import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";
import { Sidebar } from "./_components/sidebar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;

  const session = await getSession();
  if (!session) redirect(`/login?from=/${slug}/dashboard`);

  const tenant = await getTenantBySlug(slug);
  if (!tenant) notFound();

  const member = await prisma.tenantMember.findUnique({
    where: { userId_tenantId: { userId: session.user.id, tenantId: tenant.id } },
  });

  if (!member || member.role !== "ADMIN") redirect(`/${slug}`);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <Sidebar tenantSlug={slug} tenantName={tenant.name} />
      <div className="flex-1 flex flex-col min-h-screen lg:pl-60">
        <main className="flex-1 p-4 lg:p-8 bg-zinc-50 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
