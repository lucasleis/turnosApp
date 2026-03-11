"use server";

import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import bcrypt from "bcryptjs";

type ActionResult = { error: string } | { success: true };

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

export async function registrarCliente(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!name?.trim() || !email?.trim() || !password) {
    return { error: "Todos los campos son requeridos" };
  }
  if (!validateEmail(email)) {
    return { error: "El email no es válido" };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con este email" };

  const hashed = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { name: name.trim(), email, password: hashed },
  });

  return { success: true };
}

export async function registrarNegocio(formData: FormData): Promise<ActionResult> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const businessName = formData.get("businessName") as string;
  const slug = formData.get("slug") as string;

  if (!name?.trim() || !email?.trim() || !password || !businessName?.trim() || !slug?.trim()) {
    return { error: "Todos los campos son requeridos" };
  }
  if (!validateEmail(email)) {
    return { error: "El email no es válido" };
  }
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" };
  }
  if (!validateSlug(slug)) {
    return { error: "El slug solo puede tener letras minúsculas, números y guiones" };
  }

  const [existingUser, existingTenant] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    prisma.tenant.findUnique({ where: { slug } }),
  ]);

  if (existingUser) return { error: "Ya existe una cuenta con este email" };
  if (existingTenant) return { error: "Ese nombre de URL ya está en uso, elegí otro" };

  const hashed = await bcrypt.hash(password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { name: name.trim(), email, password: hashed },
    });

    const tenant = await tx.tenant.create({
      data: { slug, name: businessName.trim() },
    });

    await tx.branch.create({
      data: { tenantId: tenant.id, name: "Principal" },
    });

    await tx.tenantMember.create({
      data: { userId: user.id, tenantId: tenant.id, role: "ADMIN" },
    });
  });

  return { success: true };
}
