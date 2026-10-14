"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { COR_TRILHA, dataCurta } from "@/lib/rotulos";
import type { EventoPublico } from "@/lib/types";
import { Cartao, TituloSecao } from "@/components/ui";

const INICIAL = 5;

export function Atualizacoes({ eventos }: { eventos: EventoPublico[] }) {
  const [todos, setTodos] = useState(false);
  const lista = todos ? eventos : eventos.slice(0, INICIAL);

  return (
    <Cartao>
      <div className="mb-4 flex items-center justify-between gap-2">
        <TituloSecao>Últimas atualizações</TituloSecao>
        {eventos.length > INICIAL && (
          <button onClick={() => setTodos((v) => !v)} className="flex items-center gap-1.5 text-sm text-brand hover:underline">
            {todos ? "Ver menos" : "Ver todo o histórico"} <ArrowRight size={15} />
          </button>
        )}
      </div>
      {eventos.length === 0 ? (
        <p className="text-sm text-ink-soft">Ainda não há atualizações publicadas.</p>
      ) : (
        <ol className="relative space-y-3 before:absolute before:top-2 before:bottom-2 before:left-[5px] before:w-px before:bg-line">
          {lista.map((e) => (
            <li key={e.id} className="relative flex items-start gap-4 text-sm">
              <span className="relative mt-1.5 size-[11px] shrink-0 rounded-full border-2 border-surface bg-cinza-soft" />
              <span className="w-14 shrink-0 text-xs leading-5 text-ink-soft">{dataCurta(e.data)}</span>
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${COR_TRILHA[e.trilha].ponto}`} />
              <span className="leading-snug">{e.texto}</span>
            </li>
          ))}
        </ol>
      )}
    </Cartao>
  );
}
