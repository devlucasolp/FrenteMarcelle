import type { StepConfig, Trilha, TrilhaId } from "@/lib/types";

// Source: referencias/auditoria-mapeamento-trilhas.xlsx (MATRIZ POR STEP) and
// referencias/mensagens-por-step.xlsx. Client messages are drafts pending
// Marcelle/Gabriela validation; prazo text is kept separate so the card can show it.

export const TRILHAS: Trilha[] = [
  { id: "T1", numero: 1, nome: "Desenvolvimento do produto", prazoReferencia: "~ 6 meses", cor: "t1", icone: "flask" },
  { id: "T2", numero: 2, nome: "Embalagens", prazoReferencia: "~ 3 meses", cor: "t2", icone: "embalagem" },
  { id: "T3", numero: 3, nome: "Regulatório", prazoReferencia: "~ 4 meses", cor: "t3", icone: "escudo" },
  { id: "T4", numero: 4, nome: "Arte e comunicação", prazoReferencia: "~ 1 mês", cor: "t4", icone: "lapis" },
  { id: "T5", numero: 5, nome: "Produção industrial", prazoReferencia: "~ 2 meses", cor: "t5", icone: "fabrica" },
];

/** Steps where the client is the one acting (manual flow); the team will standardize the rest. */
const COM_CLIENTE = new Set(["T1-07", "T1-08", "T4-05", "T5-02", "T5-09"]);

const s = (
  trilha: TrilhaId,
  numero: number,
  nome: string,
  prazo: string,
  mensagem: string,
  extra: Partial<StepConfig> = {},
): StepConfig => {
  const id = `${trilha}-${String(numero).padStart(2, "0")}`;
  return { id, trilha, numero, nome, prazo, mensagem, comCliente: COM_CLIENTE.has(id), ...extra };
};

export const STEPS: StepConfig[] = [
  // T1 — Desenvolvimento do produto
  s("T1", 1, "Estudo de mercado e benchmarking", "3 a 7 dias",
    "Antes de desenvolver o produto, realizamos uma pesquisa de mercado e analisamos referências para orientar as primeiras decisões. Este estudo faz parte da preparação do projeto.",
    { concluidoQuandoCadastrado: true }),
  s("T1", 2, "Definição de produtos", "1 a 5 dias",
    "Definimos quais produtos farão parte do projeto. Esta etapa organiza o que será desenvolvido e orienta as próximas atividades.",
    { concluidoQuandoCadastrado: true }),
  s("T1", 3, "Análise e aprovação de briefing proposto", "até 7 dias",
    "Estamos alinhando o briefing do produto: características desejadas, objetivos e informações necessárias para seguir com o desenvolvimento. A aprovação deste direcionamento ajuda a evitar ajustes posteriores."),
  s("T1", 4, "Definição de selos e apelos", "até 10 dias",
    "Estamos avaliando quais características e benefícios poderão ser comunicados sobre o produto e quais selos fazem sentido para a proposta. Essa definição também precisa respeitar os critérios técnicos aplicáveis."),
  s("T1", 5, "Desenvolvimento de amostras", "até 40 dias",
    "O desenvolvimento das amostras está em andamento. Nossa equipe e os parceiros envolvidos trabalham nas formulações para aproximá-las do resultado desejado. Pode ser necessário produzir mais de uma versão antes da aprovação."),
  s("T1", 6, "Avaliação da amostra pela Assinatura", "até 7 dias",
    "A amostra está na etapa de avaliação pela equipe da Assinatura. Estamos verificando sua adequação ao direcionamento do produto antes de dar sequência ao processo."),
  s("T1", 7, "Amostra enviada ao cliente", "2 a 7 dias",
    "Chegamos ao momento de encaminhar uma amostra para sua avaliação. Você poderá conhecer o resultado desenvolvido e compartilhar suas percepções."),
  s("T1", 8, "Teste de performance", "até 7 dias",
    "Agora é a etapa de testar o produto e avaliar sua experiência de uso. Seu retorno é importante: ele ajuda a identificar possíveis ajustes antes de seguirmos."),
  s("T1", 9, "Teste de estabilidade", "até 90 dias",
    "O produto passa pela etapa de estabilidade, que verifica seu comportamento nas condições previstas de teste ao longo do tempo. É um processo técnico importante e pode acontecer em paralelo a outras atividades."),

  // T2 — Embalagens
  s("T2", 1, "Pesquisa de embalagens", "até 7 dias",
    "Estamos pesquisando opções de embalagem que atendam às necessidades do produto e à proposta da marca. Serão considerados aspectos práticos e técnicos antes da escolha."),
  s("T2", 2, "Solicitação de amostras", "Nacional 15 dias / Importado 15 a 25 dias",
    "Estamos solicitando amostras das opções de embalagem para avaliar as alternativas disponíveis. O tempo de chegada varia conforme a origem."),
  s("T2", 3, "Avaliação e escolha", "até 7 dias",
    "As opções de embalagem estão sendo analisadas para a escolha da alternativa mais adequada ao produto. Quando houver uma decisão que dependa de você, ela será sinalizada no acompanhamento."),
  s("T2", 4, "Teste de compatibilidade", "até 90 dias",
    "Estamos avaliando a compatibilidade entre a formulação e a embalagem escolhida. Essa verificação é importante para confirmar se a combinação atende aos requisitos esperados."),
  s("T2", 5, "Produção da embalagem", "variável",
    "Com a embalagem aprovada e as condições necessárias atendidas, acompanhamos sua produção junto ao fornecedor. O prazo varia de acordo com o modelo e a disponibilidade do parceiro."),
  s("T2", 6, "Importação (se aplicável)", "Marítima 45 dias / Aérea 10 dias",
    "Se a embalagem precisar ser importada, acompanharemos essa etapa até sua chegada. Esta etapa não se aplica a todas as embalagens.",
    { condicional: true }),
  s("T2", 7, "Entrega da embalagem para fábrica", "variável",
    "Estamos acompanhando a entrega das embalagens à fábrica responsável pela produção do produto. O prazo depende da disponibilidade, da logística e da programação dos envolvidos."),

  // T3 — Regulatório
  s("T3", 1, "Validação regulatória dos claims e apelos", "até 5 dias",
    "Estamos verificando se os benefícios e as características que desejamos comunicar sobre o produto estão adequados às exigências regulatórias."),
  s("T3", 2, "Solicitação dos testes", "até 10 dias",
    "Estamos organizando e solicitando os testes necessários para o desenvolvimento regulatório do produto. Os testes aplicáveis dependem das características e dos objetivos definidos."),
  s("T3", 3, "Testes de segurança", "até 30 dias",
    "O produto está na etapa de testes de segurança. Essas avaliações ajudam a verificar os requisitos necessários antes de avançarmos no processo."),
  s("T3", 4, "Teste de eficácia (se aplicável)", "até 90 dias",
    "Quando necessário, realizamos testes para verificar a eficácia de características ou benefícios que serão apresentados ao consumidor. Esta etapa é aplicável conforme o produto.",
    { condicional: true }),
  s("T3", 5, "Revisão regulatória inicial da arte", "até 7 dias",
    "Estamos revisando as informações da arte da embalagem sob o ponto de vista regulatório, para verificar se os textos e demais elementos estão adequados."),
  s("T3", 6, "Protocolo ANVISA (entrada do processo)", "até 10 dias",
    "Estamos preparando ou realizando a entrada do processo na ANVISA, conforme o fluxo aplicável ao produto. A equipe acompanha essa formalização."),
  s("T3", 7, "Recebimento de número de processo", "variável",
    "Estamos aguardando ou conferindo o número de processo referente à etapa regulatória. Assim que houver confirmação, a informação poderá ser refletida nas próximas etapas do projeto."),

  // T4 — Arte e comunicação
  s("T4", 1, "Desenvolvimento da 1ª proposta de arte", "7 a 15 dias",
    "Estamos desenvolvendo a primeira proposta visual da embalagem, considerando o direcionamento da marca e as informações disponíveis sobre o produto."),
  s("T4", 2, "Inclusão do número do processo na arte", "até 3 dias",
    "Estamos preparando a inclusão do número do processo na arte, conforme as informações regulatórias disponibilizadas."),
  s("T4", 3, "Geração do código de barras", "até 3 dias",
    "Estamos providenciando o código de barras necessário para identificar o produto."),
  s("T4", 4, "Inclusão do código de barras e ajustes finais", "até 5 dias",
    "Estamos realizando os ajustes finais da arte, incluindo o código de barras e os elementos necessários para sua finalização."),
  s("T4", 5, "Aprovação do cliente", "até 5 dias",
    "A arte chegou à etapa de aprovação. Sua análise é importante para validarmos o material antes de seguir para as próximas atividades. Caso sejam necessários ajustes, eles serão acompanhados."),

  // T5 — Produção industrial
  s("T5", 1, "Inclusão oficial do pedido", "1 dia",
    "Com as aprovações necessárias concluídas, seguimos para a inclusão oficial do pedido de produção. Essa etapa formaliza o início do processo industrial."),
  s("T5", 2, "Pagamento da entrada", "variável",
    "Esta etapa corresponde ao pagamento da entrada previsto para iniciar a produção. Se houver alguma ação pendente da sua parte, ela será informada separadamente no painel."),
  s("T5", 3, "Conta e ordem / envio de insumos", "variável",
    "Estamos organizando a conta e ordem e/ou o envio dos insumos necessários à fábrica, conforme as condições do projeto."),
  s("T5", 4, "Programação fabril", "3 a 7 dias",
    "Estamos alinhando a programação da fábrica para que a produção aconteça dentro da disponibilidade operacional."),
  s("T5", 5, "Manipulação da fórmula", "até 3 dias",
    "O produto entra na etapa de manipulação da fórmula pela fábrica, conforme as definições aprovadas."),
  s("T5", 6, "Análise microbiológica", "até 3 dias",
    "A produção passa pela etapa de análise microbiológica, de acordo com os controles previstos no processo."),
  s("T5", 7, "Envase e acondicionamento", "até 1 dia",
    "Estamos acompanhando o envase e o acondicionamento do produto em sua embalagem."),
  s("T5", 8, "Emissão da NF", "até 1 dia", "Estamos na etapa de emissão da nota fiscal referente ao pedido."),
  s("T5", 9, "Pagamento final + frete", "variável",
    "Esta etapa contempla o pagamento final e o frete previstos para a liberação do pedido. Se for necessária alguma providência sua, ela aparecerá como pendência específica."),
  s("T5", 10, "Expedição", "até 1 dia",
    "O pedido está na etapa de expedição, em que a saída dos produtos é organizada para entrega."),
];

/**
 * Gates and main milestones from the "Jornada Desenvolvimento" manual. Each one is
 * reached when its step is completed (the gate sits right after that step in the flow).
 */
export const MARCOS: { id: string; nome: string; trilha: TrilhaId; step: string }[] = [
  { id: "amostra", nome: "Amostra aprovada", trilha: "T1", step: "T1-09" },
  { id: "embalagem", nome: "Embalagem aprovada", trilha: "T2", step: "T2-04" },
  { id: "regulatorio", nome: "Regulatório concluído", trilha: "T3", step: "T3-07" },
  { id: "arte", nome: "Arte aprovada", trilha: "T4", step: "T4-05" },
  { id: "producao", nome: "Produção iniciada", trilha: "T5", step: "T5-01" },
  { id: "expedido", nome: "Produto expedido", trilha: "T5", step: "T5-10" },
];

/** Trilha 5 only starts after these (manual: "Início após"). */
export const INICIO_PRODUCAO = ["Fórmula aprovada", "Embalagem disponível", "Regulatório concluído", "Arte aprovada", "Pagamento da entrada"];

/** Manual: formula rework box between steps 05 and 06 of Trilha 1. */
export const RETRABALHO_FORMULA = "Ajustes / retrabalho da fórmula (se necessário): prazo de referência de 30 a 45 dias.";

export const ATENCAO =
  "A agilidade nas aprovações e envios de informações pelo cliente é essencial para o cumprimento dos prazos.";

export const trilhaPorId = (id: TrilhaId) => TRILHAS.find((t) => t.id === id)!;
export const stepPorId = (id: string) => STEPS.find((st) => st.id === id);
export const stepsDaTrilha = (id: TrilhaId) => STEPS.filter((st) => st.trilha === id);

// Fixed notes shown to every client (text from the approved prototype).
export const OBSERVACOES = [
  "Os prazos podem variar conforme disponibilidade de fornecedores e aprovações do cliente.",
  "Testes regulatórios possuem prazos técnicos obrigatórios.",
  "A produção somente inicia após aprovações finais de fórmula, embalagem, regulatório, arte e pagamento.",
];
