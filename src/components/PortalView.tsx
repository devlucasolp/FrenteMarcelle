import { ChevronRight, FolderOpen, Megaphone, MessageCircle, TriangleAlert } from "lucide-react";
import { ATENCAO, OBSERVACOES } from "@/config/trilhas";
import type { LinkImportante, Portal } from "@/lib/types";
import { Atualizacoes } from "@/components/Atualizacoes";
import { Cabecalho } from "@/components/Cabecalho";
import { Ajuda, Pendencias } from "@/components/Pendencias";
import { Produtos } from "@/components/Produtos";
import { Trilhas } from "@/components/Trilhas";
import { Cartao, TituloSecao } from "@/components/ui";

const ICONE_LINK: Record<LinkImportante["tipo"], typeof FolderOpen> = {
  drive: FolderOpen,
  whatsapp: MessageCircle,
  outro: FolderOpen,
};

export function PortalView({ portal }: { portal: Portal }) {
  const { cliente } = portal;

  return (
    <div className="mx-auto w-full max-w-[1280px] px-4 py-5 sm:px-6 sm:py-7">
      <Cabecalho cliente={cliente} atualizadoEm={portal.geradoEm} />

      {portal.avisoGeral && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-azul/20 bg-azul-soft p-4 text-sm text-azul">
          <Megaphone size={18} className="mt-0.5 shrink-0" />
          <p className="whitespace-pre-line">{portal.avisoGeral}</p>
        </div>
      )}

      <div className="mt-6 space-y-5">
        <Trilhas trilhas={portal.trilhas} produtos={portal.produtos} />

        <div className="grid gap-5 lg:grid-cols-[1fr_350px]">
          <Produtos produtos={portal.produtos} />
          <div className="space-y-5">
            <Pendencias pendencias={portal.pendencias} slug={cliente.slug} />
            <Ajuda grupoUrl={cliente.grupoWhatsappUrl} />
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr_0.95fr]">
          <Atualizacoes eventos={portal.atualizacoes} />

          <Cartao>
            <div className="mb-4">
              <TituloSecao>Links importantes</TituloSecao>
            </div>
            {portal.links.length === 0 ? (
              <p className="text-sm text-ink-soft">Nenhum link cadastrado.</p>
            ) : (
              <ul className="grid gap-3">
                {portal.links.map((l) => {
                  const Icone = ICONE_LINK[l.tipo];
                  return (
                    <li key={l.url}>
                      <a
                        href={l.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex h-full items-center gap-3 rounded-xl border border-line bg-surface p-3 transition hover:border-brand"
                      >
                        <Icone size={30} strokeWidth={1.5} className="shrink-0 text-brand" />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold">{l.titulo}</span>
                          <span className="block text-xs text-ink-soft">{l.descricao}</span>
                        </span>
                        <ChevronRight size={16} className="shrink-0 text-brand" />
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </Cartao>

          <Cartao>
            <div className="mb-3">
              <TituloSecao info="Informações válidas para todos os projetos.">Observações</TituloSecao>
            </div>
            <ul className="space-y-2 text-sm text-ink-soft">
              {OBSERVACOES.map((o) => (
                <li key={o} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                  {o}
                </li>
              ))}
            </ul>
            <p className="mt-4 flex gap-2 rounded-lg border border-rosa-borda bg-rosa p-3 text-xs text-ink">
              <TriangleAlert size={16} className="shrink-0 text-t3" />
              <span>
                <strong className="text-brand">Atenção:</strong> {ATENCAO}
              </span>
            </p>
          </Cartao>
        </div>
      </div>
    </div>
  );
}
