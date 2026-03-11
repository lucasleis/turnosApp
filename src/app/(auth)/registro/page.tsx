import { Metadata } from "next";
import { RegistroForm } from "./_components/registro-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
};

export default function RegistroPage() {
  return <RegistroForm />;
}
