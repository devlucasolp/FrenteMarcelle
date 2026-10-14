import type { RawCustomField, RawProject, RawSubtask, RawTask } from "@/lib/asana";

// Asana-shaped sample data used while ASANA_TOKEN is not configured. Card and subtask
// names follow the Mysco extraction (referencias/planilhas.txt, EXTRAÇÃO ASANA);
// dates, locations and pending items are illustrative only.

const dia = (diasAtras: number) => new Date(Date.now() - diasAtras * 86_400_000).toISOString();

let seq = 0;
/** completed when `feitoHa` is a number; open when null. */
const sub = (name: string, criadoHa: number, feitoHa: number | null = criadoHa, notes = ""): RawSubtask => ({
  gid: `s${++seq}`,
  name,
  notes,
  completed: feitoHa !== null,
  created_at: dia(criadoHa),
  completed_at: feitoHa !== null ? dia(feitoHa) : null,
  modified_at: dia(feitoHa ?? criadoHa),
});

const campos = (c: Record<string, string>): RawCustomField[] =>
  Object.entries(c).map(([name, display_value]) => ({ name, display_value }));

let tseq = 0;
const card = (
  name: string,
  section: string,
  subtasks: RawSubtask[],
  fields: Record<string, string> = {},
  notes = "",
): RawTask => ({
  gid: `t${++tseq}`,
  name,
  notes,
  completed: false,
  created_at: dia(300),
  modified_at: dia(1),
  section,
  custom_fields: campos(fields),
  subtasks,
});

/** n sample cycles: requested -> released -> received -> feedback chased -> rework. */
function ciclos(n: number, inicio: number): RawSubtask[] {
  const out: RawSubtask[] = [sub("Solicitar amostra", inicio)];
  let d = inicio;
  for (let i = 0; i < n; i++) {
    out.push(sub("Amostra liberada", d - 20), sub("Amostra recebida pelo cliente", d - 26));
    out.push(sub("Cobrar retorno de amostra do cliente", d - 30), sub("Solicitar retrabalho", d - 34));
    d -= 40;
  }
  return out;
}

export function projetoMock(): RawProject {
  seq = 0;
  tseq = 0;
  const F = "FERNANDA E GABRIELA - ";
  return {
    sections: [],
    tasks: [
      card(`${F}MARCA`, "Geral", [
        sub("Onboarding - 05/06", 480),
        sub("3-Phase Briefing - 24/06", 470),
        sub("Debriefing - 10/07/25", 455),
        sub("Reunião de definição de produto - 06/08", 430),
        sub("Reunião de Selos - 04/12/25", 310),
      ]),
      card("Contrato Pratko", "Geral", []),
      card("MARCA - PRODUTO", "Orçamento solicitado", []),

      card(
        `${F}HIDRATANTE FACIAL COM FPS`,
        "Amostra em desenvolvimento",
        [
          ...ciclos(6, 280),
          sub("Cobrar finalização da amostra ao parceiro fabril", 6, null),
          sub("Teste de envase solicitado", 60),
          sub("Teste de envase recebido", 60, 25),
          sub("Proposta de arte enviada", 40),
        ],
        {
          Fábrica: "Pratko",
          Localização: "Na indústria",
          "Detalhe da localização": "Amostra em ajuste",
          "Responsável próxima ação": "Parceiro fabril",
          "Próxima ação": "Receber uma nova amostra para avaliação",
          "Atividade atual": "Ajustes da formulação em andamento",
        },
      ),
      card(`${F}BLUSH STICK`, "Amostra em desenvolvimento", [
        sub("Solicitar amostra", 90),
        sub("Amostra liberada", 50),
        sub("Amostra recebida pelo cliente", 44),
        sub("Solicitar ajuste na amostra", 30),
      ]),
      card(
        `${F}PROTETOR SOLAR STICK`,
        "Amostra em desenvolvimento",
        [
          ...ciclos(2, 200),
          sub("Solicitar amostra da estabilidade", 40),
          sub("Pedir as embalagens para teste de envase", 35),
          sub("PENDÊNCIA | PAGAMENTO | Pagamento de embalagens", 4, null),
        ],
        { Fábrica: "Pratko", Localização: "Na indústria", "Detalhe da localização": "Testes em andamento", "Responsável próxima ação": "Cliente" },
      ),
      card(
        `${F}ESCOVA ANTIFRIZZ`,
        "Desenvolvimento de embalagem",
        [sub("Buscar opções de escovinha antifrizz na China", 80), sub("Buscar novas opções de embalagem", 20, null)],
        { Fábrica: "Soft Hair", Localização: "Com o fornecedor", "Responsável próxima ação": "Fornecedor", "Próxima ação": "Receber amostras de embalagem" },
      ),
      card(
        `${F}HIDRATANTE LABIAL`,
        "Teste de performance do cliente",
        [
          ...ciclos(1, 120),
          sub("Amostra liberada", 15),
          sub("Amostra recebida pelo cliente", 9),
          sub("Cobrar retorno de amostra do cliente", 3, null),
          sub("PENDÊNCIA | AVALIAÇÃO | Retorno da avaliação da amostra", 8, null),
        ],
        { Localização: "Com o cliente", "Detalhe da localização": "Aguardando avaliação", "Responsável próxima ação": "Cliente" },
      ),
      card(`${F}ÓLEO CAPILAR`, "Teste de performance do cliente", [
        sub("Solicitar amostra", 150),
        sub("Amostra liberada", 100),
        sub("Amostra recebida pelo cliente", 94),
        sub("Enviar embalagens de leave in e óleo para o teste de envase", 70),
        sub("Teste de envase solicitado", 65),
      ]),
      card(
        `${F}LEAVE IN COM FPS`,
        "Arte",
        [
          ...ciclos(3, 260),
          sub("Amostra liberada", 120),
          sub("Dizeres de rotulagem enviados para o designer", 30),
          sub("Proposta de arte enviada", 12),
          sub("ATENÇÃO", 2, null, "A 1ª proposta de arte está em criação com o designer. Assim que estiver pronta, enviaremos para sua aprovação."),
        ],
        { Localização: "Com a equipe Assinatura", "Detalhe da localização": "Em desenvolvimento", "Responsável próxima ação": "Assinatura" },
      ),
      card(`${F}BALM/POMADA CAPILAR COM FPS`, "Arte", [
        ...ciclos(2, 240),
        sub("Amostra liberada", 110),
        sub("Proposta de arte enviada", 20),
      ]),
      card("FERNANDA E GABRIELA - AROMATIZADOR DE AMBIENTE", "Orçamento solicitado", []),
      card("FERNANDA E GABRILA - SACHÊ HIDRATANTE FACIAL", "Orçamento em análise", []),
      card(
        "MYSCO - BALM/HIDRATANTE/ LEAVE- IN",
        "Avaliação de OR",
        [sub("Gerar documento de demanda", 40), sub("Demanda enviada a fábrica responsável", 30), sub("Demanda aprovada pela fábrica", 25, 11)],
        { Fábrica: "Pratko", Localização: "Na indústria", "Responsável próxima ação": "Parceiro fabril" },
      ),

      card(`${F}ÓLEO CAPILAR`, "Projeto cancelado", []),
      card(`${F}BLUSH EM STICK`, "Projeto cancelado", []),
    ],
  };
}
