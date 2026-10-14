import { clientePorSlug } from "@/config/clientes";
import { sessaoAtual } from "@/lib/auth";
import { carregarPortal } from "@/lib/data";

export async function GET(_: Request, ctx: RouteContext<"/api/p/[slug]/pendencias">) {
  const { slug } = await ctx.params;
  const s = await sessaoAtual();
  const autorizado = s?.papel === "admin" || (s?.papel === "cliente" && s.slug === slug);
  if (!autorizado) return Response.json({ erro: "não autorizado" }, { status: 401 });

  const cliente = clientePorSlug(slug);
  if (!cliente) return Response.json({ erro: "não encontrado" }, { status: 404 });

  const portal = await carregarPortal(cliente);
  return Response.json(portal.pendencias);
}
