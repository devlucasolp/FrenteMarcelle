"use client";

import { useState } from "react";
import { ChevronRight, CreditCard, FileCheck2, FileText, MessageCircle, MessageSquareText } from "lucide-react";
import type { Pendencia, TipoPendencia } from "@/lib/types";
import { Notificacoes } from "@/components/Notificacoes";
import { Cartao, TituloSecao } from "@/components/ui";

const ICONE: Record<TipoPendencia, typeof CreditCard> = {
  pagamento: CreditCard,
  avaliacao: FileCheck2,
  aprovacao: FileCheck2,
  retorno: MessageSquareText,
  documento: FileText,
  outro: FileText,
};

export function Pendencias({ pendencias, slug }: { pendencias: Pendencia[]; slug: string }) {
  const [aberta, setAberta] = useState<string | null>(null);

  return (
    <Cartao>
      <div className="mb-3 flex items-center justify-between gap-2">
        <TituloSecao
          compacto
          extra={
            pendencias.length > 0 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-brand text-xs text-white">
                {pendencias.length}
              </span>
            )
          }
        >
          Pendências da sua aprovação
        </TituloSecao>
      </div>
      {pendencias.length === 0 ? (
        <p className="text-sm text-ink-soft">Nada pendente com você no momento.</p>
      ) : (
        <ul className="space-y-2">
          {pendencias.map((p) => {
            const Icone = ICONE[p.tipo];
            const sel = aberta === p.id;
            return (
              <li key={p.id} className="rounded-xl border border-line bg-surface">
                <button
                  onClick={() => setAberta(sel ? null : p.id)}
                  aria-expanded={sel}
                  className="flex w-full items-center gap-3 px-3 py-3 text-left"
                >
                  <Icone size={22} strokeWidth={1.6} className="shrink-0 text-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">{p.titulo}</span>
                    {p.produtoNome && <span className="block text-xs text-ink-soft">{p.produtoNome}</span>}
                  </span>
                  <ChevronRight size={16} className={`shrink-0 text-brand transition ${sel ? "rotate-90" : ""}`} />
                </button>
                {sel && (
                  <div className="space-y-2 border-t border-line px-3 py-3 text-xs text-ink-soft">
                    <p>{p.orientacao}</p>
                    <p>Caso precise de suporte, entre em contato pelo grupo de WhatsApp do projeto.</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div className="mt-3">
        <Notificacoes slug={slug} />
      </div>
    </Cartao>
  );
}

export function Ajuda({ grupoUrl }: { grupoUrl?: string }) {
  return (
    <section className="rounded-2xl border border-rosa-borda bg-rosa p-5">
      <h2 className="flex items-center gap-3 text-[15px] font-bold uppercase text-brand">
        <MessageCircle size={30} strokeWidth={1.6} /> Precisa de ajuda?
      </h2>
      <p className="mt-2 text-sm text-ink-soft">
        Nossa equipe está à disposição no grupo de WhatsApp do projeto para tirar dúvidas e apoiar em quaisquer
        solicitações.
      </p>
      {grupoUrl ? (
        <a
          href={grupoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-dark px-4 py-3 font-medium text-white transition hover:opacity-90"
        >
          <MessageCircle size={18} /> Abrir WhatsApp <ChevronRight size={16} />
        </a>
      ) : (
        <p className="mt-3 text-xs text-ink-soft">Grupo do projeto ainda não cadastrado.</p>
      )}
    </section>
  );
}
