"use client";

import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronLeft, ChevronRight, Circle, ClipboardList, Factory, Info, MapPin, X } from "lucide-react";
import { ACOMPANHAMENTO, COR_TRILHA, dataCurta, LOCALIZACAO_LABEL, RESPONSAVEL_LABEL } from "@/lib/rotulos";
import type { EstadoStep, Produto } from "@/lib/types";
import { RETRABALHO_FORMULA, trilhaPorId } from "@/config/trilhas";
import { Barra, Cartao, FaixaProduto, ICONE_TRILHA, StatusPill, TituloSecao } from "@/components/ui";

type Filtro = "todos" | "desenvolvimento" | "aguardando" | "producao" | "concluidos";

const FILTROS: { id: Filtro; label: string; aceita: (p: Produto) => boolean }[] = [
  { id: "todos", label: "Todos", aceita: () => true },
  {
    id: "desenvolvimento",
    label: "Em desenvolvimento",
    aceita: (p) => ["planejamento", "em_desenvolvimento", "em_analise"].includes(p.status),
  },
  { id: "aguardando", label: "Aguardando aprovação", aceita: (p) => p.status === "aguardando_aprovacao" },
  { id: "producao", label: "Em produção", aceita: (p) => p.status === "em_producao" },
  { id: "concluidos", label: "Concluídos", aceita: (p) => p.status === "concluido" },
];

export function Produtos({ produtos }: { produtos: Produto[] }) {
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [aberto, setAberto] = useState<string | null>(null);
  const trilho = useRef<HTMLDivElement>(null);

  const visiveis = produtos.filter(FILTROS.find((f) => f.id === filtro)!.aceita);
  const detalhe = produtos.find((p) => p.id === aberto);
  const rolar = (dir: 1 | -1) => trilho.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  return (
    <Cartao className="min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <TituloSecao
          extra={<span className="text-sm font-semibold normal-case text-brand">({produtos.length})</span>}
          info="Cada produto avança nas cinco trilhas ao mesmo tempo. Toque em “Ver detalhes” para acompanhar tudo sobre ele."
        >
          Produtos em desenvolvimento
        </TituloSecao>
        <div className="sem-scrollbar -mx-1 flex max-w-full gap-2 overflow-x-auto px-1">
          {FILTROS.map((f) => {
            const sel = f.id === filtro;
            return (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-xs transition ${
                  sel ? "bg-brand-dark text-white" : "bg-surface-2 text-ink hover:bg-rosa"
                }`}
              >
                {f.label} ({produtos.filter(f.aceita).length})
              </button>
            );
          })}
        </div>
      </div>

      {visiveis.length === 0 ? (
        <p className="rounded-xl bg-surface-2 p-6 text-center text-sm text-ink-soft">Nenhum produto neste filtro.</p>
      ) : (
        <div className="relative">
          <button
            onClick={() => rolar(-1)}
            aria-label="Anterior"
            className="absolute top-1/3 -left-3 z-10 hidden size-9 items-center justify-center rounded-full border border-line bg-surface shadow md:flex"
          >
            <ChevronLeft size={18} />
          </button>
          <div ref={trilho} className="sem-scrollbar flex snap-x gap-3 overflow-x-auto pb-1">
            {visiveis.map((p, i) => (
              <CartaoProduto
                key={p.id}
                produto={p}
                indice={i}
                ativo={p.id === aberto}
                onDetalhes={() => setAberto(p.id === aberto ? null : p.id)}
              />
            ))}
          </div>
          <button
            onClick={() => rolar(1)}
            aria-label="Próximo"
            className="absolute top-1/3 -right-3 z-10 hidden size-9 items-center justify-center rounded-full border border-line bg-surface shadow md:flex"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {detalhe && <Detalhe produto={detalhe} onFechar={() => setAberto(null)} />}
    </Cartao>
  );
}

function LinhaStep({ produto: p }: { produto: Produto }) {
  if (!p.stepAtual) {
    return (
      <div className="flex gap-3 text-sm">
        <ClipboardList size={20} className="mt-0.5 shrink-0 text-ink-soft" />
        <p className="text-ink-soft">Sem atualização registrada</p>
      </div>
    );
  }
  const trilha = trilhaPorId(p.stepAtual.step.trilha);
  const Icone = ICONE_TRILHA[trilha.icone];
  return (
    <div className="flex gap-3 text-sm">
      <Icone size={20} className={`mt-0.5 shrink-0 ${COR_TRILHA[trilha.id].texto}`} />
      <p className="leading-snug">
        {p.stepAtual.step.nome}
        {p.atividadeAtual && <span className="block text-xs text-ink-soft">{p.atividadeAtual}</span>}
      </p>
    </div>
  );
}

function LinhaLocal({ produto: p }: { produto: Produto }) {
  // Without a registered location, show the partner (a fact) instead of guessing where the product is.
  if (!p.localizacao && p.parceiro) {
    return (
      <div className="flex gap-3 text-sm">
        <Factory size={20} className="mt-0.5 shrink-0 text-brand" />
        <p className="leading-snug">
          <span className="font-medium">Parceiro fabril</span>
          <span className="block text-xs text-ink-soft">{p.parceiro}</span>
        </p>
      </div>
    );
  }
  return (
    <div className="flex gap-3 text-sm">
      <MapPin size={20} className="mt-0.5 shrink-0 text-brand" />
      {p.localizacao ? (
        <p className="leading-snug">
          <span className="font-medium">{LOCALIZACAO_LABEL[p.localizacao]}</span>
          {p.localizacaoDetalhe && <span className="block text-xs text-ink-soft">{p.localizacaoDetalhe}</span>}
        </p>
      ) : (
        <p className="text-ink-soft">Localização não informada</p>
      )}
    </div>
  );
}

function CartaoProduto({
  produto: p,
  indice,
  ativo,
  onDetalhes,
}: {
  produto: Produto;
  indice: number;
  ativo: boolean;
  onDetalhes: () => void;
}) {
  return (
    <article
      className={`flex w-[260px] shrink-0 snap-start flex-col rounded-xl border bg-surface p-3 transition ${
        ativo ? "border-brand shadow-md" : "border-line"
      }`}
    >
      <FaixaProduto nome={p.nome} indice={indice} />
      <h3 className="mt-3 font-semibold leading-snug">{p.nome}</h3>
      <div className="mt-2">
        <StatusPill status={p.status} />
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Barra valor={p.percentual} />
        <span className="text-sm font-medium">{p.percentual}%</span>
      </div>
      <div className="mt-3 space-y-3">
        <LinhaStep produto={p} />
        <LinhaLocal produto={p} />
      </div>
      {p.pendencias[0] && (
        <p className="mt-3 flex items-center gap-1.5 rounded-md border border-rosa-borda bg-rosa px-2 py-1.5 text-xs text-brand">
          <ClipboardList size={14} className="shrink-0" /> {p.pendencias[0].titulo}
        </p>
      )}
      <div className="mt-auto pt-3">
        <button
          onClick={onDetalhes}
          aria-expanded={ativo}
          className="flex w-full items-center justify-center gap-1.5 border-t border-line pt-3 text-sm font-medium text-brand"
        >
          {ativo ? "Fechar detalhes" : "Ver detalhes"} <ArrowRight size={15} />
        </button>
      </div>
    </article>
  );
}

const ESTADO_LABEL: Record<EstadoStep, { txt: string; cls: string }> = {
  nao_iniciado: { txt: "Não iniciado", cls: "text-ink-soft" },
  em_andamento: { txt: "Em andamento", cls: "text-azul" },
  em_retrabalho: { txt: "Em ajuste", cls: "text-amarelo" },
  concluido: { txt: "Concluído", cls: "text-verde" },
};

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-ink-soft">{rotulo}</dt>
      <dd className="mt-0.5 text-sm">{children}</dd>
    </div>
  );
}

const HISTORICO_INICIAL = 6;

function Detalhe({ produto: p, onFechar }: { produto: Produto; onFechar: () => void }) {
  const [historicoCompleto, setHistoricoCompleto] = useState(false);
  const historico = historicoCompleto ? p.historico : p.historico.slice(0, HISTORICO_INICIAL);
  const trilhaAtual = p.stepAtual ? trilhaPorId(p.stepAtual.step.trilha) : undefined;
  const naoInformado = <span className="text-ink-soft">Não informado</span>;

  return (
    <div className="mt-4 rounded-xl border border-rosa-borda bg-rosa/40 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-xl font-bold text-brand">{p.nome}</h3>
          <div className="mt-1">
            <StatusPill status={p.status} />
          </div>
        </div>
        <button onClick={onFechar} aria-label="Fechar" className="rounded-full p-1 text-ink-soft hover:bg-surface">
          <X size={18} />
        </button>
      </div>

      {p.aviso && (
        <p className="mt-4 flex gap-2 rounded-lg bg-azul-soft p-3 text-sm text-azul">
          <Info size={16} className="mt-0.5 shrink-0" /> {p.aviso}
        </p>
      )}

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Campo rotulo="Trilha e step atual">
          {p.stepAtual && trilhaAtual
            ? `Trilha ${trilhaAtual.numero} — ${p.stepAtual.step.nome}`
            : "Sem atualização registrada"}
        </Campo>
        <Campo rotulo="Localização">
          {p.localizacao
            ? `${LOCALIZACAO_LABEL[p.localizacao]}${p.localizacaoDetalhe ? ` — ${p.localizacaoDetalhe}` : ""}`
            : "Localização não informada"}
        </Campo>
        {p.parceiro && <Campo rotulo="Parceiro fabril">{p.parceiro}</Campo>}
        <Campo rotulo="Atividade atual">{p.atividadeAtual ?? naoInformado}</Campo>
        <Campo rotulo="Próxima ação">{p.proximaAcao ?? naoInformado}</Campo>
        <Campo rotulo="Responsável pela próxima ação">
          {p.responsavel ? RESPONSAVEL_LABEL[p.responsavel] : naoInformado}
        </Campo>
        <Campo rotulo="Acompanhamento">{p.responsavel ? ACOMPANHAMENTO[p.responsavel] : naoInformado}</Campo>
        <Campo rotulo="Pendência do cliente">
          {p.pendencias.length ? p.pendencias.map((x) => x.titulo).join(" · ") : "Nenhuma"}
        </Campo>
        {p.versoesAmostra > 0 && (
          <Campo rotulo="Amostras">
            {p.versoesAmostra} {p.versoesAmostra === 1 ? "versão enviada" : "versões enviadas"} para avaliação
          </Campo>
        )}
      </dl>

      {p.stepAtual && (
        <p className="mt-4 rounded-lg bg-surface p-3 text-sm text-ink-soft">
          <span className="font-medium text-ink">O que acontece nesta etapa: </span>
          {p.stepAtual.step.mensagem} <span className="whitespace-nowrap">Prazo de referência: {p.stepAtual.step.prazo}.</span>
          {p.stepAtual.estado === "em_retrabalho" && p.stepAtual.step.id === "T1-05" && (
            <span className="mt-1 block">{RETRABALHO_FORMULA}</span>
          )}
        </p>
      )}

      <ol className="mt-4 flex flex-wrap gap-2">
        {p.marcos.map((m) => (
          <li
            key={m.id}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${
              m.atingido ? "border-verde/30 bg-verde-soft text-verde" : "border-line bg-surface text-ink-soft"
            }`}
          >
            {m.atingido ? <CheckCircle2 size={13} /> : <Circle size={13} />} {m.nome}
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {p.trilhas.map(({ trilha, percentual, steps }) => (
          <div key={trilha.id} className="rounded-lg bg-surface p-3">
            <div className="flex items-center justify-between">
              <p className={`text-xs font-bold ${COR_TRILHA[trilha.id].texto}`}>
                T{trilha.numero} · {trilha.nome}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <Barra valor={percentual} cor={COR_TRILHA[trilha.id].barra} />
              <span className="text-xs font-medium">{percentual}%</span>
            </div>
            <ol className="mt-2 space-y-1">
              {steps.map((s) => (
                <li key={s.step.id} className="flex items-baseline justify-between gap-3 text-xs leading-snug">
                  <span>{s.step.nome}</span>
                  <span className={`shrink-0 text-[11px] font-medium ${ESTADO_LABEL[s.estado].cls}`}>
                    {ESTADO_LABEL[s.estado].txt}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

      {p.historico.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-xs font-bold uppercase text-brand">Histórico deste produto</p>
          <ol className="space-y-1.5">
            {historico.map((h) => (
              <li key={h.id} className="flex gap-3 text-sm">
                <span className="w-14 shrink-0 text-xs leading-5 text-ink-soft">{dataCurta(h.data)}</span>
                <span className={`mt-1.5 size-2 shrink-0 rounded-full ${COR_TRILHA[h.trilha].ponto}`} />
                {h.texto}
              </li>
            ))}
          </ol>
          {p.historico.length > HISTORICO_INICIAL && (
            <button
              onClick={() => setHistoricoCompleto((v) => !v)}
              className="mt-2 text-xs font-medium text-brand hover:underline"
            >
              {historicoCompleto ? "Ver menos" : `Ver todo o histórico (${p.historico.length})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
