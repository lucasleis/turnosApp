"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registrarCliente, registrarNegocio } from "../actions";
import { slugify } from "@/lib/utils";

type Modo = "cliente" | "negocio";

export function RegistroForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modo, setModo] = useState<Modo>("cliente");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [slug, setSlug] = useState("");

  function handleBusinessNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(slugify(e.target.value));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    if (modo === "negocio") formData.set("slug", slug);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      const result =
        modo === "cliente"
          ? await registrarCliente(formData)
          : await registrarNegocio(formData);

      if ("error" in result) {
        setError(result.error);
        return;
      }

      // Auto-login tras registro exitoso
      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (loginResult?.error) {
        router.push("/login");
        return;
      }

      router.push(modo === "negocio" ? "/admin/dashboard" : "/");
      router.refresh();
    });
  }

  return (
    <div className="bg-card rounded-2xl p-8 shadow-xl border border-border/50">
      {/* Brand */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 mb-2">
          <span className="text-2xl font-bold tracking-tight text-foreground">
            turnos
          </span>
          <span className="w-2 h-2 rounded-full bg-accent mt-0.5" />
        </div>
        <p className="text-sm text-muted-foreground">Creá tu cuenta</p>
      </div>

      {/* Toggle modo */}
      <div className="flex rounded-lg border border-border p-1 mb-6 bg-muted">
        <button
          type="button"
          onClick={() => { setModo("cliente"); setError(""); }}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
            modo === "cliente"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Soy cliente
        </button>
        <button
          type="button"
          onClick={() => { setModo("negocio"); setError(""); }}
          className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-all ${
            modo === "negocio"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Tengo un negocio
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">
            {modo === "negocio" ? "Tu nombre" : "Nombre"}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="Juan García"
            autoComplete="name"
            required
          />
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            required
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
              required
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Campos adicionales para negocio */}
        {modo === "negocio" && (
          <>
            <div>
              <Label htmlFor="businessName">Nombre del negocio</Label>
              <Input
                id="businessName"
                name="businessName"
                type="text"
                placeholder="Ej: Barbería Roma"
                onChange={handleBusinessNameChange}
                required
              />
            </div>

            <div>
              <Label htmlFor="slug">URL de tu negocio</Label>
              <div className="flex items-center rounded-lg border border-input overflow-hidden focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent transition-colors">
                <span className="pl-3 text-sm text-muted-foreground whitespace-nowrap">
                  turnosapp.com/
                </span>
                <input
                  id="slug"
                  name="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                  placeholder="barberia-roma"
                  className="flex-1 h-11 pr-3 bg-transparent text-sm text-foreground focus:outline-none"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Solo letras minúsculas, números y guiones
              </p>
            </div>
          </>
        )}

        {error && (
          <p className="text-sm text-destructive bg-destructive/8 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="accent"
          size="lg"
          loading={isPending}
          className="w-full mt-2"
        >
          {modo === "negocio" ? "Crear negocio" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        ¿Ya tenés cuenta?{" "}
        <Link
          href="/login"
          className="text-foreground font-medium hover:text-accent transition-colors"
        >
          Ingresá
        </Link>
      </p>
    </div>
  );
}
