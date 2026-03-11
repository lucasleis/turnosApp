import { notFound } from "next/navigation";
import Link from "next/link";
import { getTenantBySlug } from "@/modules/tenants/get-tenant";

export default async function TenantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlug(slug);

  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-zinc-950 border-b border-zinc-800">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={`/${slug}`} className="flex items-center gap-1.5">
            <span className="text-white font-semibold text-sm">{tenant.name}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          </Link>
          <Link
            href={`/${slug}/mis-turnos`}
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            Mis turnos
          </Link>
        </div>
      </header>
      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
