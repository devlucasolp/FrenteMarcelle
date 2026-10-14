import "server-only";
import { asanaConfigurado, lerProjeto } from "@/lib/asana";
import { projetoMock } from "@/lib/mock";
import { montarPortal } from "@/lib/portal";
import { lerOverrides } from "@/lib/store";
import type { Cliente, Portal } from "@/lib/types";

export async function carregarPortal(cliente: Cliente): Promise<Portal> {
  const overrides = await lerOverrides(cliente.slug);
  if (asanaConfigurado() && cliente.asanaProjectGid) {
    const raw = await lerProjeto(cliente.asanaProjectGid);
    return montarPortal(cliente, raw, overrides, "asana");
  }
  return montarPortal(cliente, projetoMock(), overrides, "mock");
}
