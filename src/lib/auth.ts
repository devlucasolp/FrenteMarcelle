import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE, verificar, type Sessao } from "@/lib/session";

export async function sessaoAtual(): Promise<Sessao | null> {
  return verificar((await cookies()).get(COOKIE)?.value);
}

export async function exigirAdmin(): Promise<void> {
  if ((await sessaoAtual())?.papel !== "admin") redirect("/login?admin=1");
}

export async function exigirCliente(slug: string): Promise<void> {
  const s = await sessaoAtual();
  if (s?.papel === "admin") return;
  if (s?.papel === "cliente" && s.slug === slug) return;
  redirect("/login");
}
