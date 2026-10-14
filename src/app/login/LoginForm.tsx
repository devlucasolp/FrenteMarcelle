"use client";

import { useActionState } from "react";
import { entrar, type EstadoForm } from "@/app/actions";

export function LoginForm({ admin }: { admin: boolean }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(entrar, {});
  return (
    <form action={acao} className="mt-6 space-y-4">
      {admin && <input type="hidden" name="admin" value="1" />}
      <input
        name="codigo"
        type={admin ? "password" : "text"}
        autoComplete={admin ? "current-password" : "off"}
        placeholder={admin ? "Senha" : "Código de acesso"}
        className="w-full rounded-lg border border-line bg-bg px-3 py-2.5 outline-none focus:border-brand"
        required
      />
      {estado.erro && <p className="text-sm text-brand">{estado.erro}</p>}
      <button
        disabled={pendente}
        className="w-full rounded-lg bg-brand-dark px-3 py-2.5 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
