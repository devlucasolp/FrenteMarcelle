"use client";

import { useActionState } from "react";
import { salvarCliente, type EstadoForm } from "@/app/actions";
import type { Overrides } from "@/lib/portal";

const campo = "w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-brand";

function Url({ nome, rotulo, valor, ajuda }: { nome: string; rotulo: string; valor?: string; ajuda?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">{rotulo}</span>
      <input name={nome} type="url" defaultValue={valor} placeholder="https://" className={campo} />
      {ajuda && <span className="text-xs text-ink-soft">{ajuda}</span>}
    </label>
  );
}

export function ClienteForm({ slug, overrides }: { slug: string; overrides: Overrides }) {
  const [estado, acao, pendente] = useActionState<EstadoForm, FormData>(salvarCliente, {});

  return (
    <form action={acao} className="space-y-4 border-t border-line pt-4">
      <input type="hidden" name="slug" value={slug} />
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Aviso geral no topo do portal</span>
        <textarea name="avisoGeral" rows={3} defaultValue={overrides.avisoGeral} className={campo} />
        <span className="text-xs text-ink-soft">
          Também pode vir do Asana: cartão chamado &quot;Aviso geral&quot; (a descrição vira o aviso).
        </span>
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Url nome="pastaUrl" rotulo="Pasta do projeto (Google Drive)" valor={overrides.pastaUrl} />
        <Url nome="grupoWhatsappUrl" rotulo="Grupo de WhatsApp do projeto" valor={overrides.grupoWhatsappUrl} />
        <Url
          nome="logoUrl"
          rotulo="Logo da marca (URL da imagem)"
          valor={overrides.logoUrl}
          ajuda="Sem logo aprovada, o portal mostra o nome da marca."
        />
      </div>
      <div className="flex items-center gap-3">
        <button
          disabled={pendente}
          className="rounded-lg bg-brand-dark px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
        >
          {pendente ? "Salvando..." : "Salvar"}
        </button>
        {estado.ok && <span className="text-sm text-verde">{estado.ok}</span>}
        {estado.erro && <span className="text-sm text-amarelo">{estado.erro}</span>}
      </div>
    </form>
  );
}
