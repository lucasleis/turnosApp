import { PrismaClient, DayOfWeek } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const slug = process.argv[2] ?? "barberia-roma";

  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: { branches: true },
  });

  if (!tenant) {
    const all = await prisma.tenant.findMany({ select: { slug: true } });
    console.error(`❌ Tenant '${slug}' no encontrado.`);
    if (all.length > 0) {
      console.error(`   Tenants disponibles: ${all.map((t) => t.slug).join(", ")}`);
      console.error(`   Usá: npx prisma db seed -- --slug ${all[0].slug}`);
      console.error(`   O:   tsx prisma/seed.ts ${all[0].slug}`);
    }
    process.exit(1);
  }

  const branch = tenant.branches[0];
  console.log(`✓ Tenant encontrado: ${tenant.name} | Sucursal: ${branch.name}`);

  // Crear barbero
  const barberUser = await prisma.user.upsert({
    where: { email: "barbero@test.com" },
    update: {},
    create: {
      name: "Carlos López",
      email: "barbero@test.com",
      password: await bcrypt.hash("password123", 12),
    },
  });
  console.log(`✓ Barbero: ${barberUser.name} (${barberUser.email})`);

  // Crear TenantMember del barbero
  const barberMember = await prisma.tenantMember.upsert({
    where: { userId_tenantId: { userId: barberUser.id, tenantId: tenant.id } },
    update: {},
    create: { userId: barberUser.id, tenantId: tenant.id, role: "BARBER" },
  });

  // Crear BarberProfile
  const barberProfile = await prisma.barberProfile.upsert({
    where: { tenantMemberId: barberMember.id },
    update: {},
    create: {
      tenantMemberId: barberMember.id,
      branchId: branch.id,
      bio: "Especialista en cortes modernos y clásicos",
    },
  });
  console.log(`✓ BarberProfile creado`);

  // Schedules: Lunes a Viernes 09:00 - 18:00
  const weekdays: DayOfWeek[] = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  for (const day of weekdays) {
    await prisma.schedule.upsert({
      where: {
        barberProfileId_dayOfWeek: { barberProfileId: barberProfile.id, dayOfWeek: day },
      },
      update: {},
      create: {
        barberProfileId: barberProfile.id,
        dayOfWeek: day,
        startTime: "09:00",
        endTime: "18:00",
      },
    });
  }
  console.log(`✓ Schedules: Lunes a Viernes 09:00 - 18:00`);

  // Servicios
  const servicios = [
    { name: "Corte de pelo", description: "Corte clásico o moderno a tu elección", duration: 30, price: 2000 },
    { name: "Barba", description: "Perfilado y arreglo de barba", duration: 20, price: 1500 },
    { name: "Corte + Barba", description: "Servicio completo: corte y barba", duration: 50, price: 3000 },
  ];

  for (const s of servicios) {
    const existing = await prisma.service.findFirst({
      where: { tenantId: tenant.id, name: s.name },
    });
    if (!existing) {
      await prisma.service.create({ data: { tenantId: tenant.id, ...s } });
    }
  }
  console.log(`✓ Servicios creados: ${servicios.map((s) => s.name).join(", ")}`);

  console.log("\n✅ Seed completado para barberia-roma");
  console.log("   Barbero: barbero@test.com / password123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
