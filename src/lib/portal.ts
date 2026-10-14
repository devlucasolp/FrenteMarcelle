import type { RawCustomField, RawProject, RawSubtask, RawTask } from "@/lib/asana";
import {
  CAMPOS,
  CARTAO_AVISO_GERAL,
  CARTAO_MARCA,
  CARTOES_IGNORADOS,
  PENDENCIA_CAMPO,
  PENDENCIA_PADRAO,
  PREFIXO_AVISO,
  PREFIXO_PENDENCIA,
  SECOES_OCULTAS,
  STEPS_DA_MARCA,
  STATUS_POR_SECAO,
  TIPOS_PENDENCIA,
  VALORES_LOCALIZACAO,
  VALORES_RESPONSAVEL,
  VINCULOS,
  type VinculoSubtarefa,
} from "@/config/asana";
import { MARCOS, STEPS, TRILHAS } from "@/config/trilhas";
import type {
  Cliente,
  EstadoStep,
  EventoPublico,
  LinkImportante,
  Pendencia,
  Portal,
  Produto,
  ProgressoTrilha,
  StatusProduto,
  StepProduto,
} from "@/lib/types";

export interface Overrides {
  avisoGeral?: string;
  logoUrl?: string;
  pastaUrl?: string;
  grupoWhatsappUrl?: string;
}

export function normalizar(s: string): string {
  return s
    .replace(/\p{Extended_Pictographic}|\uFE0F/gu, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Pattern match where "*" is a wildcard; both sides normalized. */
function casa(nome: string, padrao: string): boolean {
  const n = normalizar(nome);
  const p = normalizar(padrao);
  if (!p.includes("*")) return n === p;
  const re = new RegExp(`^${p.split("*").map((x) => x.replace(/[.+?^${}()|[\]\\]/g, "\\$&")).join(".*")}$`);
  return re.test(n);
}

const casaAlgum = (nome: string, padroes: string[]) => padroes.some((p) => casa(nome, p));
const comeca = (nome: string, prefixos: string[]) => prefixos.some((p) => normalizar(nome).startsWith(p));

const MINUSCULAS = new Set(["com", "de", "da", "do", "das", "dos", "e", "em", "para", "sem"]);
const SIGLAS = new Set(["fps", "uv", "spf"]);

/** "FERNANDA E GABRIELA - HIDRATANTE FACIAL COM FPS" -> "Hidratante Facial com FPS" */
export function nomeProduto(nomeCartao: string): string {
  const i = nomeCartao.indexOf(" - ");
  const base = (i >= 0 ? nomeCartao.slice(i + 3) : nomeCartao).trim();
  return base
    .toLowerCase()
    .split(" ")
    .map((palavra, idx) =>
      palavra
        .split("/")
        .map((p) => {
          if (SIGLAS.has(p)) return p.toUpperCase();
          if (idx > 0 && MINUSCULAS.has(p)) return p;
          return p.charAt(0).toUpperCase() + p.slice(1);
        })
        .join("/"),
    )
    .join(" ");
}

function campo(fields: RawCustomField[], nomes: string[]): string | undefined {
  const alvo = nomes.map(normalizar);
  const f = fields.find((c) => alvo.includes(normalizar(c.name)));
  return f?.display_value?.trim() || undefined;
}

const dataEvento = (s: RawSubtask) => s.completed_at ?? s.created_at;

interface Evento {
  sub: RawSubtask;
  vinculo: VinculoSubtarefa;
}

function vinculoDe(nome: string): VinculoSubtarefa | undefined {
  return VINCULOS.find((v) => casa(nome, v.subtarefa));
}

function estadoDoStep(eventos: Evento[]): EstadoStep {
  if (eventos.length === 0) return "nao_iniciado";
  const ultimo = [...eventos].sort((a, b) => dataEvento(b.sub).localeCompare(dataEvento(a.sub)))[0];
  if (ultimo.vinculo.efeito === "conclui" && ultimo.sub.completed) return "concluido";
  if (ultimo.vinculo.efeito === "retrabalho") return "em_retrabalho";
  // A conclusion event that is still open, or any start event, means the step is in progress.
  return "em_andamento";
}

const PESO: Record<EstadoStep, number> = { nao_iniciado: 0, em_andamento: 0.5, em_retrabalho: 0.5, concluido: 1 };

function percentual(steps: StepProduto[]): number {
  const aplicaveis = steps.filter((s) => !s.step.condicional || s.estado !== "nao_iniciado");
  if (aplicaveis.length === 0) return 0;
  return Math.round((aplicaveis.reduce((a, s) => a + PESO[s.estado], 0) / aplicaveis.length) * 100);
}

function lerPendencia(sub: RawSubtask, produtoId: string, produtoNome: string): Pendencia {
  const partes = sub.name.split("|").map((p) => p.trim());
  const tipo = TIPOS_PENDENCIA[normalizar(partes[1] ?? "")] ?? "outro";
  const padrao = PENDENCIA_PADRAO[tipo];
  return {
    id: sub.gid,
    produtoId,
    produtoNome,
    tipo,
    titulo: partes[2] || padrao.titulo,
    orientacao: sub.notes?.trim() || padrao.orientacao,
    criadoEm: sub.created_at,
  };
}

function montarProduto(
  t: RawTask,
  eventosMarca: Evento[],
  semVinculo: Set<string>,
): Produto {
  const nome = nomeProduto(t.name);
  const eventos: Evento[] = [...eventosMarca];
  const pendencias: Pendencia[] = [];
  let aviso: string | undefined;

  for (const sub of t.subtasks) {
    if (comeca(sub.name, [PREFIXO_PENDENCIA])) {
      if (!sub.completed) pendencias.push(lerPendencia(sub, t.gid, nome));
      continue;
    }
    if (comeca(sub.name, PREFIXO_AVISO)) {
      if (!sub.completed) aviso = sub.notes?.trim() || sub.name.replace(/^[^:\-–]*[:\-–]\s*/, "");
      continue;
    }
    const vinculo = vinculoDe(sub.name);
    if (vinculo) eventos.push({ sub, vinculo });
    else semVinculo.add(sub.name);
  }

  const stepsProduto: StepProduto[] = STEPS.map((step) => {
    const doStep = eventos.filter((e) => e.vinculo.step === step.id);
    const estado = step.concluidoQuandoCadastrado ? "concluido" : estadoDoStep(doStep);
    const ultima = doStep.map((e) => dataEvento(e.sub)).sort().at(-1);
    return { step, estado, ultimaAtividade: ultima };
  });

  const trilhas = TRILHAS.map((trilha) => {
    const steps = stepsProduto.filter((s) => s.step.trilha === trilha.id);
    return { trilha, percentual: percentual(steps), steps };
  });

  // The headline step comes from the product's own events, never from brand milestones.
  const proprios = new Set(eventos.filter((e) => !eventosMarca.includes(e)).map((e) => e.vinculo.step));
  const comAtividade = stepsProduto
    .filter((s) => s.ultimaAtividade && proprios.has(s.step.id))
    .sort((a, b) => b.ultimaAtividade!.localeCompare(a.ultimaAtividade!));
  const stepAtual = comAtividade.find((s) => s.estado !== "concluido") ?? comAtividade[0];

  const amostrasCampo = Number(campo(t.custom_fields, CAMPOS.amostrasRecebidas));
  const versoesAmostra =
    Number.isFinite(amostrasCampo) && amostrasCampo > 0
      ? amostrasCampo
      : eventos.filter((e) => e.vinculo.versaoAmostra && e.sub.completed).length;

  const historico: EventoPublico[] = eventos
    .filter((e) => e.sub.completed && e.vinculo.publico && !eventosMarca.includes(e))
    .map((e) => ({
      id: e.sub.gid,
      data: dataEvento(e.sub),
      produtoNome: nome,
      trilha: e.vinculo.step.slice(0, 2) as EventoPublico["trilha"],
      texto: e.vinculo.publico!.replace("{produto}", nome),
    }))
    .sort((a, b) => b.data.localeCompare(a.data));

  // Existing "PENDÊNCIA" field: who the card is waiting on. Explicit fields below win.
  const pendenciaCampo = PENDENCIA_CAMPO[normalizar(campo(t.custom_fields, CAMPOS.pendencia) ?? "")];
  if (pendenciaCampo?.pendenciaCliente && pendencias.length === 0) {
    const tipo = stepAtual && ["T1-07", "T1-08"].includes(stepAtual.step.id) ? "avaliacao" : "retorno";
    const padrao = PENDENCIA_PADRAO[tipo];
    pendencias.push({
      id: `${t.gid}-campo`,
      produtoId: t.gid,
      produtoNome: nome,
      tipo,
      titulo: tipo === "avaliacao" ? "Retorno da avaliação da amostra" : padrao.titulo,
      orientacao: padrao.orientacao,
      criadoEm: t.modified_at,
    });
  }

  const secao = normalizar(t.section);
  let status: StatusProduto = STATUS_POR_SECAO[secao] ?? "em_desenvolvimento";
  if (t.completed) status = "concluido";
  else if (pendencias.length > 0) status = "aguardando_aprovacao";

  const localizacaoTxt = campo(t.custom_fields, CAMPOS.localizacao);
  const localizacao = localizacaoTxt ? VALORES_LOCALIZACAO[normalizar(localizacaoTxt)] : undefined;
  const parceiro = campo(t.custom_fields, CAMPOS.fabrica);
  const detalheCampo = campo(t.custom_fields, CAMPOS.localizacaoDetalhe);
  const localizacaoDetalhe =
    [localizacao === "industria" ? parceiro : undefined, detalheCampo].filter(Boolean).join(" – ") || undefined;

  const responsavelTxt = campo(t.custom_fields, CAMPOS.responsavel);
  const responsavel = responsavelTxt ? VALORES_RESPONSAVEL[normalizar(responsavelTxt)] : pendenciaCampo?.responsavel;

  let atividadeAtual = campo(t.custom_fields, CAMPOS.atividadeAtual);
  if (!atividadeAtual && stepAtual?.step.trilha === "T1" && versoesAmostra > 0) atividadeAtual = `Versão ${versoesAmostra}`;

  const concluido = (stepId: string) => stepsProduto.find((x) => x.step.id === stepId)?.estado === "concluido";

  return {
    id: t.gid,
    nome,
    status,
    percentual: percentual(stepsProduto),
    stepAtual,
    atividadeAtual,
    versoesAmostra,
    localizacao,
    localizacaoDetalhe,
    responsavel,
    proximaAcao: campo(t.custom_fields, CAMPOS.proximaAcao) ?? pendenciaCampo?.proximaAcao,
    parceiro,
    aviso,
    pendencias,
    marcos: MARCOS.map((m) => ({ id: m.id, nome: m.nome, trilha: m.trilha, atingido: concluido(m.step) })),
    trilhas,
    historico,
    atualizadoEm: t.modified_at,
  };
}

function calcularTrilhas(produtos: Produto[]): ProgressoTrilha[] {
  // Rule still undefined by the team (PDF §Andamento): average of each product's progress.
  return TRILHAS.map((trilha) => {
    const valores = produtos.map((p) => p.trilhas.find((t) => t.trilha.id === trilha.id)!.percentual);
    return {
      trilha,
      percentual: valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0,
      totalSteps: STEPS.filter((s) => s.trilha === trilha.id).length,
    };
  });
}

export function montarPortal(cliente: Cliente, raw: RawProject, overrides: Overrides, fonte: Portal["fonte"]): Portal {
  const semVinculo = new Set<string>();
  const ocultos: Portal["diagnostico"]["ocultos"] = [];

  const marca = raw.tasks.find((t) => casaAlgum(t.name, CARTAO_MARCA));
  const eventosMarca: Evento[] = (marca?.subtasks ?? []).flatMap((sub) => {
    const vinculo = vinculoDe(sub.name);
    return vinculo && STEPS_DA_MARCA.includes(vinculo.step) ? [{ sub, vinculo }] : [];
  });

  const avisoCartao = raw.tasks.find((t) => casaAlgum(t.name, CARTAO_AVISO_GERAL) && !t.completed);

  const produtos: Produto[] = [];
  for (const t of raw.tasks) {
    if (t === marca || t === avisoCartao || casaAlgum(t.name, CARTAO_AVISO_GERAL)) continue;
    if (casaAlgum(t.name, CARTOES_IGNORADOS)) continue;
    const motivo = SECOES_OCULTAS[normalizar(t.section)];
    if (motivo) {
      ocultos.push({ nome: nomeProduto(t.name), motivo });
      continue;
    }
    produtos.push(montarProduto(t, eventosMarca, semVinculo));
  }

  const links: LinkImportante[] = [];
  const pastaUrl = overrides.pastaUrl || cliente.pastaUrl;
  const grupoUrl = overrides.grupoWhatsappUrl || cliente.grupoWhatsappUrl;
  if (pastaUrl)
    links.push({ tipo: "drive", titulo: "Pasta do projeto", descricao: "Acesse todos os documentos, apresentações e materiais.", url: pastaUrl });
  if (grupoUrl)
    links.push({ tipo: "whatsapp", titulo: "Histórico de mensagens", descricao: "Acompanhe os principais comunicados da equipe.", url: grupoUrl });

  return {
    cliente: {
      ...cliente,
      logoUrl: overrides.logoUrl || cliente.logoUrl,
      pastaUrl,
      grupoWhatsappUrl: grupoUrl,
    },
    produtos,
    trilhas: calcularTrilhas(produtos),
    atualizacoes: produtos
      .flatMap((p) => p.historico)
      .sort((a, b) => b.data.localeCompare(a.data)),
    links,
    pendencias: produtos.flatMap((p) => p.pendencias),
    avisoGeral: overrides.avisoGeral || avisoCartao?.notes?.trim() || undefined,
    fonte,
    geradoEm: new Date().toISOString(),
    diagnostico: {
      ocultos,
      subtarefasSemVinculo: [...semVinculo].sort(),
      produtosSemLocalizacao: produtos.filter((p) => !p.localizacao).map((p) => p.nome),
    },
  };
}
