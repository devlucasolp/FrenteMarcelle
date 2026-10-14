import { BookOpen, CalendarDays, ChevronDown, ChevronRight, LogOut, UserRound } from "lucide-react";
import { sair } from "@/app/actions";
import { dataLonga } from "@/lib/rotulos";
import type { Cliente } from "@/lib/types";

const MANUAL_URL = process.env.NEXT_PUBLIC_MANUAL_URL ?? "/manual";

function LogoCliente({ cliente }: { cliente: Cliente }) {
  if (cliente.logoUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- logo URL is arbitrary per client
    return <img src={cliente.logoUrl} alt={cliente.marca} className="h-11 w-auto object-contain" />;
  }
  // Fallback while the brand has no approved visual identity: wordmark with the brand name.
  return (
    <div className="leading-none">
      <p className="font-display text-[30px] tracking-tight text-ink uppercase">{cliente.marca}</p>
      <p className="mt-1 text-[9px] tracking-[0.35em] text-ink-soft uppercase">Marca própria</p>
    </div>
  );
}

function LogoAssinatura() {
  return (
    <div className="text-center leading-none text-brand">
      <p className="text-[17px] font-extrabold tracking-[0.12em]">ASSINATURA</p>
      <p className="mt-0.5 text-[7px] tracking-[0.3em]">MARCA PRÓPRIA</p>
    </div>
  );
}

export function Cabecalho({ cliente, atualizadoEm }: { cliente: Cliente; atualizadoEm: string }) {
  return (
    <>
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <LogoCliente cliente={cliente} />
          <span className="h-9 w-px bg-line" />
          <LogoAssinatura />
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="hidden text-ink-soft sm:inline">Portal do Cliente</span>
          <span className="hidden h-6 w-px bg-line sm:inline" />
          <span className="flex items-center gap-2">
            <CalendarDays size={18} className="text-brand" />
            <span className="leading-tight">
              <span className="block text-[11px] text-ink-soft">Última atualização</span>
              <span className="font-medium">{dataLonga(atualizadoEm)}</span>
            </span>
          </span>
          <details className="relative">
            <summary className="flex cursor-pointer list-none items-center gap-1 rounded-full border border-line bg-surface px-3 py-1.5 text-brand">
              <UserRound size={18} />
              <ChevronDown size={14} />
            </summary>
            <div className="absolute right-0 z-20 mt-2 w-48 rounded-xl border border-line bg-surface p-1 shadow-lg">
              <p className="px-3 py-2 text-xs text-ink-soft">{cliente.nome}</p>
              <form action={sair}>
                <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-surface-2">
                  <LogOut size={14} /> Sair
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>

      <div className="relative mt-6 grid items-center gap-5 md:grid-cols-[1fr_auto]">
        <div className="relative z-10">
          <h1 className="font-display text-3xl font-bold text-brand sm:text-[40px]">Olá, {cliente.nome}!</h1>
          <p className="mt-2 max-w-2xl text-[15px] text-ink-soft">
            Aqui você acompanha o desenvolvimento da sua marca <strong className="text-brand">{cliente.marca}</strong> e
            de todos os produtos, em tempo real. Os prazos são referências e podem variar conforme o andamento de cada
            etapa.
          </p>
        </div>
        <a
          href={MANUAL_URL}
          target="_blank"
          rel="noopener"
          className="relative z-10 flex max-w-md items-center gap-4 rounded-2xl border border-rosa-borda bg-rosa px-5 py-4 transition hover:shadow-md"
        >
          <BookOpen size={34} strokeWidth={1.5} className="shrink-0 text-brand" />
          <span>
            <span className="block font-semibold text-brand">Manual da Jornada do Cliente</span>
            <span className="block text-xs text-ink-soft">
              Entenda as trilhas, as etapas e como acompanhamos o desenvolvimento da sua marca.
            </span>
          </span>
          <ChevronRight size={18} className="shrink-0 text-brand" />
        </a>
      </div>
    </>
  );
}
