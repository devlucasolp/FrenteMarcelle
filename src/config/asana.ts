import type { Localizacao, Responsavel, StatusProduto, TipoPendencia } from "@/lib/types";

// How the portal reads the Asana project. Everything here is a PROPOSAL taken from
// referencias/auditoria-mapeamento-trilhas.xlsx (VÍNCULOS CANDIDATOS) and still
// needs Marcelle's validation. Names are matched case- and accent-insensitive.

/** Exact subtask name -> step event. Prefix match is used for names ending in "*". */
export interface VinculoSubtarefa {
  subtarefa: string;
  step: string;
  /** "inicia": shows the step as in progress; "conclui": completing it closes the step. */
  efeito: "inicia" | "conclui" | "retrabalho";
  /** Public history text when the subtask is completed. {produto} is replaced. */
  publico?: string;
  /** Counts as one sample version sent to the client. */
  versaoAmostra?: boolean;
}

export const VINCULOS: VinculoSubtarefa[] = [
  // T1 — Desenvolvimento do produto
  { subtarefa: "Reunião de definição de produto*", step: "T1-02", efeito: "conclui" },
  { subtarefa: "3-Phase Briefing*", step: "T1-03", efeito: "inicia" },
  { subtarefa: "Debriefing*", step: "T1-03", efeito: "conclui", publico: "Briefing do projeto alinhado" },
  { subtarefa: "Reunião de Selos*", step: "T1-04", efeito: "conclui", publico: "Selos e apelos definidos em reunião" },
  { subtarefa: "Solicitar amostra", step: "T1-05", efeito: "inicia", publico: "Desenvolvimento da amostra do {produto} solicitado à indústria" },
  { subtarefa: "Solicitar retrabalho*", step: "T1-05", efeito: "retrabalho", publico: "Ajustes na amostra do {produto} solicitados à indústria" },
  { subtarefa: "Solicitar ajuste*", step: "T1-05", efeito: "retrabalho", publico: "Ajustes na amostra do {produto} solicitados à indústria" },
  { subtarefa: "Cobrar finalização da amostra ao parceiro fabril", step: "T1-05", efeito: "inicia" },
  { subtarefa: "Amostra liberada", step: "T1-05", efeito: "conclui", publico: "Nova amostra do {produto} liberada pela indústria" },
  { subtarefa: "Amostra recebida pelo cliente", step: "T1-07", efeito: "conclui", publico: "Amostra do {produto} recebida por você", versaoAmostra: true },
  { subtarefa: "Cobrar retorno de amostra do cliente", step: "T1-08", efeito: "inicia" },
  { subtarefa: "Solicitar amostra da estabilidade", step: "T1-09", efeito: "inicia", publico: "Teste de estabilidade do {produto} iniciado" },

  // T2 — Embalagens
  { subtarefa: "Buscar novas opções de embalagem", step: "T2-01", efeito: "inicia" },
  { subtarefa: "Solicitar cotações das embalagens definidas", step: "T2-01", efeito: "conclui" },
  { subtarefa: "Pedir amostra de todas as embalagens*", step: "T2-02", efeito: "inicia" },
  { subtarefa: "Pedir as embalagens para teste de envase", step: "T2-02", efeito: "conclui" },
  { subtarefa: "*Reunião de definição de embalagens*", step: "T2-03", efeito: "conclui", publico: "Embalagens definidas em reunião" },
  { subtarefa: "Teste de envase solicitado", step: "T2-04", efeito: "inicia", publico: "Teste de envase do {produto} solicitado" },
  { subtarefa: "Teste de envase recebido", step: "T2-04", efeito: "conclui", publico: "Teste de envase do {produto} realizado" },
  { subtarefa: "Pedir contrato, formas de pagamento de embalagem*", step: "T2-05", efeito: "inicia" },

  // T3 — Regulatório
  { subtarefa: "Verificar com fornecedor se podemos usar os nomes dos ativos", step: "T3-01", efeito: "inicia" },
  { subtarefa: "Avaliar e criar subtarefas para o acomapanhamento dos testes*", step: "T3-02", efeito: "inicia" },
  { subtarefa: "Avaliar finalização dos testes de segurança*", step: "T3-03", efeito: "inicia" },
  { subtarefa: "Avaliar liberação do laudo dos testes de segurança*", step: "T3-03", efeito: "conclui", publico: "Laudo dos testes de segurança do {produto} liberado" },
  { subtarefa: "Dizeres de rotulagem enviados*", step: "T3-05", efeito: "inicia", publico: "Dizeres de rotulagem do {produto} enviados para a arte" },
  { subtarefa: "Boleto ANVISA recebido e enviado para o cliente", step: "T3-06", efeito: "inicia" },
  { subtarefa: "Pagamento ANVISA realizado", step: "T3-06", efeito: "inicia" },
  { subtarefa: "Pagamento da ANVISA", step: "T3-06", efeito: "inicia" },

  // T4 — Arte e comunicação
  { subtarefa: "Proposta de arte enviada", step: "T4-01", efeito: "conclui", publico: "Proposta de arte do {produto} enviada para sua aprovação" },
  { subtarefa: "1º Proposta de arte recebida e enviada", step: "T4-01", efeito: "conclui", publico: "Proposta de arte do {produto} enviada para sua aprovação" },
  { subtarefa: "Código de barras de acordo", step: "T4-03", efeito: "conclui" },
  { subtarefa: "Correções de arte enviadas ao designer", step: "T4-04", efeito: "retrabalho" },
  { subtarefa: "Proposta de arte final enviada", step: "T4-04", efeito: "inicia" },
  { subtarefa: "Confirmar finalização de arte", step: "T4-04", efeito: "inicia" },
  { subtarefa: "Arte finalizada", step: "T4-04", efeito: "conclui", publico: "Arte do {produto} finalizada" },
  { subtarefa: "Proposta de arte aprovada", step: "T4-05", efeito: "conclui", publico: "Arte do {produto} aprovada" },

  // T5 — Produção industrial
  { subtarefa: "Gerar documento de demanda", step: "T5-01", efeito: "inicia" },
  { subtarefa: "Demanda enviada a fábrica responsável", step: "T5-01", efeito: "inicia", publico: "Planejamento de produção do {produto} iniciado" },
  { subtarefa: "Demanda aprovada pela fábrica", step: "T5-01", efeito: "conclui", publico: "Pedido do {produto} aprovado pela fábrica" },
  { subtarefa: "Aprovar demanda com o cliente", step: "T5-01", efeito: "inicia" },
  { subtarefa: "Demanda aprovada pelo cliente", step: "T5-01", efeito: "inicia", publico: "Demanda de produção do {produto} aprovada por você" },
  { subtarefa: "Pedir contrato, formas de pagamento da produção", step: "T5-02", efeito: "inicia" },
  { subtarefa: "OR Solicitada", step: "T5-02", efeito: "inicia" },
  { subtarefa: "OR Enviada ao cliente", step: "T5-02", efeito: "inicia" },
  { subtarefa: "OR Paga", step: "T5-02", efeito: "conclui", publico: "Pagamento da entrada do {produto} confirmado" },
  { subtarefa: "Enviar opções de transportadoras*", step: "T5-10", efeito: "inicia" },
];

/** Card whose subtasks are brand-wide milestones; its steps apply to every product. */
export const CARTAO_MARCA = ["* - marca"];

/** Only these steps are taken from the MARCA card (brand-level, before products exist). */
export const STEPS_DA_MARCA = ["T1-01", "T1-02", "T1-03", "T1-04"];

/** Cards that are never products. */
export const CARTOES_IGNORADOS = ["contrato *", "marca - produto"];

/** Sections that hide a product from the client (kept in admin diagnostics). */
export const SECOES_OCULTAS: Record<string, string> = {
  "projeto cancelado": "Projeto cancelado",
  "pedido cancelado": "Pedido cancelado",
  "projeto stand by": "Projeto em stand by",
};

/**
 * Product status from the section. Sections are context only, never step triggers
 * (SEÇÕES ASANA sheet). An open pending item always wins: "aguardando_aprovacao".
 */
export const STATUS_POR_SECAO: Record<string, StatusProduto> = {
  geral: "planejamento",
  demanda: "planejamento",
  "solicitacao de nova demanda": "planejamento",
  "orcamento solicitado": "planejamento",
  "orcamento em analise": "planejamento",
  "analise de briefing": "em_desenvolvimento",
  "amostra em desenvolvimento": "em_desenvolvimento",
  "desenvolvimento de embalagem": "em_desenvolvimento",
  arte: "em_desenvolvimento",
  "teste de performance do cliente": "em_analise",
  "teste de envase": "em_analise",
  "teste de estabilidade": "em_analise",
  "avaliacao de or": "em_producao",
  "em producao": "em_producao",
  expedicao: "em_producao",
  "faturamento parcial": "em_producao",
  "pedido finalizado": "concluido",
  "projeto finalizado": "concluido",
};

/** Custom fields read from each card (names to be created/standardized in Asana). */
export const CAMPOS = {
  localizacao: ["Localização", "Localizacao portal"],
  localizacaoDetalhe: ["Detalhe da localização"],
  responsavel: ["Responsável próxima ação", "Responsavel pela proxima acao"],
  proximaAcao: ["Próxima ação"],
  atividadeAtual: ["Atividade atual"],
  /** Existing field with the factory/partner (Pratko, Soft Hair...). */
  fabrica: ["PARCEIRO", "Fábrica", "Parceiro fabril"],
  /** Existing field: who the card is waiting on (see PENDENCIA_CAMPO). */
  pendencia: ["PENDÊNCIA"],
  /** Existing manual counter of samples received; preferred over counting subtasks. */
  amostrasRecebidas: ["QUANTIADE DE AMOSTRAS RECEBIDAS", "QUANTIDADE DE AMOSTRAS RECEBIDAS"],
};

/**
 * Existing "PENDÊNCIA" field on the Mysco cards. It says who must act next; only
 * "aguardando retorno cliente" becomes a pending item for the client.
 */
export const PENDENCIA_CAMPO: Record<string, { responsavel: Responsavel; proximaAcao: string; pendenciaCliente?: boolean }> = {
  "aguardando retorno fabrica": { responsavel: "industria", proximaAcao: "Retorno do parceiro fabril" },
  "aguardando retorno cliente": { responsavel: "cliente", proximaAcao: "Seu retorno", pendenciaCliente: true },
  "pendente materia-prima": { responsavel: "fornecedor", proximaAcao: "Chegada da matéria-prima" },
};

export const VALORES_LOCALIZACAO: Record<string, Localizacao> = {
  industria: "industria",
  "na industria": "industria",
  transporte: "transporte",
  "em transporte": "transporte",
  cliente: "cliente",
  "com o cliente": "cliente",
  assinatura: "assinatura",
  "equipe assinatura": "assinatura",
  "com a equipe assinatura": "assinatura",
  fornecedor: "fornecedor",
  "com o fornecedor": "fornecedor",
};

export const VALORES_RESPONSAVEL: Record<string, Responsavel> = {
  assinatura: "assinatura",
  "equipe assinatura": "assinatura",
  industria: "industria",
  "parceiro fabril": "industria",
  fabrica: "industria",
  fornecedor: "fornecedor",
  cliente: "cliente",
  outro: "outro",
};

/**
 * Pending items: subtask named "PENDÊNCIA | TIPO | DESCRIÇÃO" (convention proposed in
 * the LEIA-ME sheet). Open while the subtask is not completed. Notes = extra guidance.
 */
export const PREFIXO_PENDENCIA = "pendencia";

export const PENDENCIA_PADRAO: Record<TipoPendencia, { titulo: string; orientacao: string }> = {
  avaliacao: {
    titulo: "Aguardando sua avaliação",
    orientacao:
      "A amostra do produto está com você para avaliação. Seu retorno é importante para continuarmos o desenvolvimento. A equipe Assinatura segue acompanhando as demais etapas do projeto.",
  },
  pagamento: {
    titulo: "Pagamento pendente",
    orientacao: "Há um pagamento necessário para seguirmos com esta etapa. A equipe Assinatura segue acompanhando as demais etapas do projeto.",
  },
  aprovacao: {
    titulo: "Aguardando sua aprovação",
    orientacao: "Precisamos da sua aprovação para seguir com esta etapa. A equipe Assinatura segue acompanhando as demais etapas do projeto.",
  },
  retorno: {
    titulo: "Aguardando seu retorno",
    orientacao: "Precisamos de um retorno seu para continuar. A equipe Assinatura segue acompanhando as demais etapas do projeto.",
  },
  documento: {
    titulo: "Documento pendente",
    orientacao: "Precisamos de um documento ou informação sua para seguir com esta etapa.",
  },
  outro: { titulo: "Ação necessária", orientacao: "Há uma ação da sua parte para seguirmos com esta etapa." },
};

export const TIPOS_PENDENCIA: Record<string, TipoPendencia> = {
  avaliacao: "avaliacao",
  pagamento: "pagamento",
  aprovacao: "aprovacao",
  retorno: "retorno",
  documento: "documento",
  documentos: "documento",
};

/** Subtask with a custom message for the product card (the team's "socorro" channel). */
export const PREFIXO_AVISO = ["atencao", "[portal]"];

/** Card whose description becomes a general notice at the top of the portal. */
export const CARTAO_AVISO_GERAL = ["aviso geral", "[aviso]"];
