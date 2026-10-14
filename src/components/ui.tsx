import type { ReactNode } from "react";
import {
  CheckCircle2,
  Clock,
  Droplet,
  Droplets,
  Factory,
  FlaskConical,
  Flower2,
  Hourglass,
  Info,
  Package,
  Pencil,
  ShieldCheck,
  Sparkles,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { STATUS_LABEL } from "@/lib/rotulos";
import type { StatusProduto, Trilha } from "@/lib/types";

export function Cartao({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-line bg-surface/90 p-5 shadow-[0_1px_2px_rgba(80,30,40,0.04)] ${className}`}>
      {children}
    </section>
  );
}

export function TituloSecao({
  children,
  info,
  extra,
  compacto,
}: {
  children: ReactNode;
  info?: string;
  extra?: ReactNode;
  compacto?: boolean;
}) {
  return (
    <h2
      className={`flex items-center gap-2 font-bold uppercase text-brand ${compacto ? "text-[13px]" : "text-[15px] tracking-wide"}`}
    >
      {children}
      {extra}
      {info && (
        <span title={info} className="text-ink-soft">
          <Info size={15} />
        </span>
      )}
    </h2>
  );
}

export const ICONE_TRILHA: Record<Trilha["icone"], LucideIcon> = {
  flask: FlaskConical,
  embalagem: Package,
  escudo: ShieldCheck,
  lapis: Pencil,
  fabrica: Factory,
};

const STATUS_ESTILO: Record<StatusProduto, { cls: string; Icone: LucideIcon }> = {
  planejamento: { cls: "bg-cinza-soft text-cinza", Icone: Clock },
  em_desenvolvimento: { cls: "bg-verde-soft text-verde", Icone: Clock },
  em_analise: { cls: "bg-azul-soft text-azul", Icone: Clock },
  aguardando_aprovacao: { cls: "bg-amarelo-soft text-amarelo", Icone: Hourglass },
  em_producao: { cls: "bg-rosa text-brand", Icone: Factory },
  concluido: { cls: "bg-verde-soft text-verde", Icone: CheckCircle2 },
};

export function StatusPill({ status }: { status: StatusProduto }) {
  const { cls, Icone } = STATUS_ESTILO[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${cls}`}>
      <Icone size={13} />
      {STATUS_LABEL[status]}
    </span>
  );
}

export function Barra({ valor, cor = "bg-brand" }: { valor: number; cor?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-cinza-soft">
      <div className={`h-full rounded-full transition-all ${cor}`} style={{ width: `${valor}%` }} />
    </div>
  );
}

// Product photos are not available; a tinted band with a category icon stands in.
const FUNDOS = [
  "from-[#efe2cf] to-[#e3cfb2]",
  "from-[#f6c9b8] to-[#eeb19c]",
  "from-[#dfe6d2] to-[#c3d1b0]",
  "from-[#f1dccd] to-[#e6c6ae]",
  "from-[#ecdde6] to-[#dcc3d2]",
];

const ICONE_PRODUTO = { sol: Sun, cabelo: Sparkles, oleo: Droplets, flor: Flower2, gota: Droplet, pacote: Package };

function tipoProduto(nome: string): keyof typeof ICONE_PRODUTO {
  const n = nome.toLowerCase();
  if (/fps|protetor|solar/.test(n)) return "sol";
  if (/capilar|cabelo|escova|leave|frizz/.test(n)) return "cabelo";
  if (/óleo|oleo/.test(n)) return "oleo";
  if (/aromatizador|ambiente/.test(n)) return "flor";
  if (/hidratante|labial|balm|blush/.test(n)) return "gota";
  return "pacote";
}

export function FaixaProduto({ nome, indice }: { nome: string; indice: number }) {
  const Icone = ICONE_PRODUTO[tipoProduto(nome)];
  return (
    <div className={`flex h-24 items-center justify-center rounded-xl bg-gradient-to-br ${FUNDOS[indice % FUNDOS.length]}`}>
      <span className="flex size-12 items-center justify-center rounded-full bg-white/70 text-brand shadow-sm">
        <Icone size={22} />
      </span>
    </div>
  );
}
