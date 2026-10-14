import type { Localizacao, Responsavel, StatusProduto, TrilhaId } from "@/lib/types";

export const STATUS_LABEL: Record<StatusProduto, string> = {
  planejamento: "Planejamento",
  em_desenvolvimento: "Em desenvolvimento",
  em_analise: "Em análise",
  aguardando_aprovacao: "Aguardando aprovação",
  em_producao: "Em produção",
  concluido: "Concluído",
};

export const LOCALIZACAO_LABEL: Record<Localizacao, string> = {
  industria: "Na indústria",
  transporte: "Em transporte",
  cliente: "Com o cliente",
  assinatura: "Com a equipe Assinatura",
  fornecedor: "Com o fornecedor",
};

export const RESPONSAVEL_LABEL: Record<Responsavel, string> = {
  assinatura: "Equipe Assinatura",
  industria: "Parceiro fabril",
  fornecedor: "Fornecedor",
  cliente: "Você",
  outro: "Outro envolvido",
};

/** Shows the Assinatura follow-up without attributing third-party delays to it. */
export const ACOMPANHAMENTO: Record<Responsavel, string> = {
  industria: "A Assinatura está acompanhando a evolução com a indústria.",
  fornecedor: "A Assinatura está acompanhando a evolução com o fornecedor.",
  cliente: "A equipe Assinatura segue acompanhando as demais etapas do projeto.",
  assinatura: "A equipe Assinatura está conduzindo esta etapa.",
  outro: "A Assinatura está acompanhando esta etapa.",
};

/** Tailwind classes per trilha (literal strings so Tailwind picks them up). */
export const COR_TRILHA: Record<TrilhaId, { texto: string; fundo: string; barra: string; ponto: string }> = {
  T1: { texto: "text-t1", fundo: "bg-t1", barra: "bg-t1", ponto: "bg-t1" },
  T2: { texto: "text-t2", fundo: "bg-t2", barra: "bg-t2", ponto: "bg-t2" },
  T3: { texto: "text-t3", fundo: "bg-t3", barra: "bg-t3", ponto: "bg-t3" },
  T4: { texto: "text-t4", fundo: "bg-t4", barra: "bg-t4", ponto: "bg-t4" },
  T5: { texto: "text-t5", fundo: "bg-t5", barra: "bg-t5", ponto: "bg-t5" },
};

const fmtCurta = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", timeZone: "America/Sao_Paulo" });
const fmtLonga = new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

export const dataCurta = (iso: string) => fmtCurta.format(new Date(iso)).replace(".", "").replace(" de ", " ");
export const dataLonga = (iso: string) => fmtLonga.format(new Date(iso));
