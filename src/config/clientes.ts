import type { Cliente } from "@/lib/types";

// Pilot: a single client. Each client maps to one Asana project.
// The Asana project GID and access code come from env so nothing sensitive is committed.

export const CLIENTES: Cliente[] = [
  {
    slug: "mysco",
    nome: "Fernanda e Gabriela",
    marca: "Mysco",
    asanaProjectGid: process.env.PILOT_ASANA_PROJECT_GID,
    codigoAcesso: process.env.PILOT_ACCESS_CODE ?? "",
    pastaUrl: process.env.PILOT_DRIVE_URL,
    grupoWhatsappUrl: process.env.PILOT_WHATSAPP_GROUP_URL,
  },
];

export function clientePorSlug(slug: string): Cliente | undefined {
  return CLIENTES.find((c) => c.slug === slug);
}

export function clientePorCodigo(codigo: string): Cliente | undefined {
  const alvo = codigo.trim();
  // An unset code (empty) never matches, so a deploy without PILOT_ACCESS_CODE stays closed.
  return alvo ? CLIENTES.find((c) => c.codigoAcesso && c.codigoAcesso === alvo) : undefined;
}
