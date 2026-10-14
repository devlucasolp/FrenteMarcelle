"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle2, Circle, UserRound } from "lucide-react";
import { INICIO_PRODUCAO, MARCOS, RETRABALHO_FORMULA, STEPS, trilhaPorId } from "@/config/trilhas";
import { COR_TRILHA } from "@/lib/rotulos";
import type { Produto, ProgressoTrilha } from "@/lib/types";
import { Barra, Cartao, ICONE_TRILHA, TituloSecao } from "@/components/ui";

export function Trilhas({ trilhas, produtos }: { trilhas: ProgressoTrilha[]; produtos: Produto[] }) {
  const [aberto, setAberto] = useState(false);

  return (
    <Cartao>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <TituloSecao info="As trilhas 1, 2 e 4 acontecem em paralelo. A trilha 3 se conecta à trilha 1 para validação dos claims e à trilha 4 para revisão e finalização da arte. A trilha 5 só inicia após as aprovações. O percentual considera o avanço de todos os seus produtos juntos.">
          Andamento das trilhas
        </TituloSecao>
        <button
          onClick={() => setAberto((v) => !v)}
          className="flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          aria-expanded={aberto}
        >
          {aberto ? "Ocultar detalhes das trilhas" : "Ver detalhes de todas as trilhas"} <ArrowRight size={15} />
        </button>
      </div>

      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {trilhas.map(({ trilha, percentual, totalSteps }) => {
          const Icone = ICONE_TRILHA[trilha.icone];
          const cor = COR_TRILHA[trilha.id];
          return (
            <li key={trilha.id} className="rounded-xl border border-line bg-surface p-3.5">
              <div className="flex items-center gap-3">
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-white ${cor.fundo}`}>
                  <Icone size={20} />
                </span>
                <p className={`text-sm font-semibold leading-tight ${cor.texto}`}>
                  Trilha {trilha.numero}
                  <br />
                  {trilha.nome}
                </p>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <Barra valor={percentual} cor={cor.barra} />
                <span className="text-sm font-semibold">{percentual}%</span>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-ink-soft">
                {totalSteps} etapas <span className="px-0.5">•</span> Prazo de referência:{" "}
                <span className="whitespace-nowrap">{trilha.prazoReferencia}</span>
              </p>
            </li>
          );
        })}
      </ol>

      <div className="mt-4 rounded-xl bg-surface-2 px-4 py-3">
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-brand">Marcos principais</p>
        <ol className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-6">
          {MARCOS.map((m) => {
            const atingidos = produtos.filter((p) => p.marcos.find((x) => x.id === m.id)?.atingido).length;
            const Icone = ICONE_TRILHA[trilhaPorId(m.trilha).icone];
            return (
              <li key={m.id} className="flex items-center gap-2">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-white ${COR_TRILHA[m.trilha].fundo} ${
                    atingidos ? "" : "opacity-40"
                  }`}
                >
                  <Icone size={15} />
                </span>
                <span className="leading-tight">
                  <span className="block text-xs font-medium">{m.nome}</span>
                  <span className="block text-[11px] text-ink-soft">
                    {atingidos} de {produtos.length} produtos
                  </span>
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {aberto && (
        <div className="mt-5 grid gap-4 border-t border-line pt-5 md:grid-cols-2 lg:grid-cols-5">
          {trilhas.map(({ trilha }) => (
            <div key={trilha.id}>
              <p className={`mb-2 text-xs font-bold uppercase ${COR_TRILHA[trilha.id].texto}`}>
                Trilha {trilha.numero} · {trilha.nome}
              </p>
              {trilha.id === "T5" && (
                <div className="mb-3 rounded-lg bg-surface-2 p-2">
                  <p className="text-[11px] font-bold uppercase text-t5">Início após</p>
                  <ul className="mt-1 space-y-0.5 text-[11px]">
                    {INICIO_PRODUCAO.map((c) => (
                      <li key={c} className="flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-t5" /> {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <ol className="space-y-2">
                {STEPS.filter((s) => s.trilha === trilha.id).map((step) => {
                  const estados = produtos.map(
                    (p) => p.trilhas.find((t) => t.trilha.id === trilha.id)!.steps.find((s) => s.step.id === step.id)!.estado,
                  );
                  const concluidos = estados.filter((e) => e === "concluido").length;
                  const andamento = estados.filter((e) => e === "em_andamento" || e === "em_retrabalho").length;
                  return (
                    <li key={step.id} className="text-xs leading-snug">
                      <p className="font-medium">
                        {String(step.numero).padStart(2, "0")}. {step.nome}
                        {step.comCliente && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-rosa px-1 text-[10px] font-medium text-brand">
                            <UserRound size={10} /> com você
                          </span>
                        )}
                      </p>
                      <p className="text-ink-soft">
                        {step.prazo}
                        {produtos.length > 0 && ` · ${concluidos} concluído${concluidos === 1 ? "" : "s"}`}
                        {andamento > 0 && ` · ${andamento} em andamento`}
                      </p>
                      {step.id === "T1-05" && (
                        <p className="mt-1 rounded border border-dashed border-rosa-borda px-1.5 py-1 text-[11px] text-ink-soft">
                          {RETRABALHO_FORMULA}
                        </p>
                      )}
                      {MARCOS.filter((m) => m.step === step.id).map((m) => (
                        <p
                          key={m.id}
                          className={`mt-1.5 flex items-center gap-1 text-[11px] font-bold uppercase ${COR_TRILHA[trilha.id].texto}`}
                        >
                          <Circle size={9} className="fill-current" /> {m.nome}
                        </p>
                      ))}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </Cartao>
  );
}
