// Domain model of the client portal.
// Asana: project = client, task = product (card), subtask = event that moves a step.
// The five trilhas run in parallel; each product has its own progress in each one.

export type TrilhaId = "T1" | "T2" | "T3" | "T4" | "T5";

export interface Trilha {
  id: TrilhaId;
  numero: number;
  nome: string;
  prazoReferencia: string;
  cor: "t1" | "t2" | "t3" | "t4" | "t5";
  icone: "flask" | "embalagem" | "escudo" | "lapis" | "fabrica";
}

export interface StepConfig {
  id: string; // "T1-05"
  trilha: TrilhaId;
  numero: number;
  nome: string;
  prazo: string;
  /** Client-facing message while the step is in progress. */
  mensagem: string;
  /** "Se está no Asana, já aconteceu": done as soon as the product card exists. */
  concluidoQuandoCadastrado?: boolean;
  /** Step that may not apply to every product ("se aplicável"). */
  condicional?: boolean;
  /** The client acts in this step (sample evaluation, approval, payment). */
  comCliente?: boolean;
}

export type EstadoStep = "nao_iniciado" | "em_andamento" | "em_retrabalho" | "concluido";

export interface StepProduto {
  step: StepConfig;
  estado: EstadoStep;
  ultimaAtividade?: string;
}

export type StatusProduto =
  | "planejamento"
  | "em_desenvolvimento"
  | "em_analise"
  | "aguardando_aprovacao"
  | "em_producao"
  | "concluido";

/** Physical location of the product/sample. Never inferred. */
export type Localizacao = "industria" | "transporte" | "cliente" | "assinatura" | "fornecedor";

/** Who must act next. Independent from location. */
export type Responsavel = "assinatura" | "industria" | "fornecedor" | "cliente" | "outro";

export type TipoPendencia = "avaliacao" | "pagamento" | "aprovacao" | "retorno" | "documento" | "outro";

export interface Pendencia {
  id: string;
  produtoId?: string;
  produtoNome?: string;
  tipo: TipoPendencia;
  titulo: string;
  orientacao: string;
  criadoEm: string;
}

export interface EventoPublico {
  id: string;
  data: string;
  produtoNome: string;
  trilha: TrilhaId;
  texto: string;
}

export interface Produto {
  id: string;
  nome: string;
  status: StatusProduto;
  percentual: number;
  /** Step with the most recent activity: what the card headlines. */
  stepAtual?: StepProduto;
  /** Short line under the current step ("Versão 7", custom field "Atividade atual"). */
  atividadeAtual?: string;
  versoesAmostra: number;
  localizacao?: Localizacao;
  localizacaoDetalhe?: string;
  responsavel?: Responsavel;
  proximaAcao?: string;
  parceiro?: string;
  aviso?: string;
  pendencias: Pendencia[];
  marcos: { id: string; nome: string; trilha: TrilhaId; atingido: boolean }[];
  trilhas: { trilha: Trilha; percentual: number; steps: StepProduto[] }[];
  historico: EventoPublico[];
  atualizadoEm: string;
}

export interface LinkImportante {
  tipo: "drive" | "whatsapp" | "outro";
  titulo: string;
  descricao: string;
  url: string;
}

export interface Cliente {
  slug: string;
  nome: string;
  marca: string;
  asanaProjectGid?: string;
  codigoAcesso: string;
  logoUrl?: string;
  pastaUrl?: string;
  grupoWhatsappUrl?: string;
}

export interface ProgressoTrilha {
  trilha: Trilha;
  percentual: number;
  totalSteps: number;
}

export interface Portal {
  cliente: Cliente;
  produtos: Produto[];
  trilhas: ProgressoTrilha[];
  atualizacoes: EventoPublico[];
  links: LinkImportante[];
  pendencias: Pendencia[];
  avisoGeral?: string;
  fonte: "asana" | "mock";
  geradoEm: string;
  /** Admin-only diagnostics. */
  diagnostico: {
    ocultos: { nome: string; motivo: string }[];
    subtarefasSemVinculo: string[];
    produtosSemLocalizacao: string[];
  };
}
