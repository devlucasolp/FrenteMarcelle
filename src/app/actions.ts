"use server";

import { timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { clientePorCodigo, clientePorSlug } from "@/config/clientes";
import { exigirAdmin } from "@/lib/auth";
import { assinar, COOKIE, cookieOpcoes } from "@/lib/session";
import { salvarOverrides } from "@/lib/store";

export type EstadoForm = { erro?: string; ok?: string };

function iguais(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export async function entrar(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  const codigo = String(form.get("codigo") ?? "").trim();
  if (!codigo) return { erro: "Informe o seu código de acesso." };

  const adminSenha = process.env.ADMIN_PASSWORD;
  if (form.get("admin") === "1") {
    if (!adminSenha || !iguais(codigo, adminSenha)) return { erro: "Senha incorreta." };
    (await cookies()).set(COOKIE, await assinar({ papel: "admin" }), cookieOpcoes);
    redirect("/admin");
  }

  const cliente = clientePorCodigo(codigo);
  if (!cliente) return { erro: "Código não encontrado. Confira com a nossa equipe." };
  (await cookies()).set(COOKIE, await assinar({ papel: "cliente", slug: cliente.slug }), cookieOpcoes);
  redirect(`/p/${cliente.slug}`);
}

export async function sair() {
  (await cookies()).delete(COOKIE);
  redirect("/login");
}

export async function salvarCliente(_: EstadoForm, form: FormData): Promise<EstadoForm> {
  await exigirAdmin();
  const slug = String(form.get("slug") ?? "");
  if (!clientePorSlug(slug)) return { erro: "Cliente inválido." };

  const texto = (k: string) => String(form.get(k) ?? "").trim() || undefined;
  const url = (k: string) => {
    const v = texto(k);
    return v && /^https?:\/\//.test(v) ? v : undefined;
  };
  try {
    await salvarOverrides(slug, {
      avisoGeral: texto("avisoGeral"),
      logoUrl: url("logoUrl"),
      pastaUrl: url("pastaUrl"),
      grupoWhatsappUrl: url("grupoWhatsappUrl"),
    });
  } catch {
    // Serverless hosts have a read-only filesystem; the pilot store only works locally.
    return { erro: "Edição ainda indisponível nesta hospedagem. Use as variáveis de ambiente ou o Asana por enquanto." };
  }
  revalidatePath(`/p/${slug}`);
  revalidatePath("/admin");
  return { ok: "Salvo." };
}
