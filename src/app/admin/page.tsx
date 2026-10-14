import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, Database, ExternalLink, LogOut } from "lucide-react";
import { sair } from "@/app/actions";
import { CLIENTES } from "@/config/clientes";
import { asanaConfigurado } from "@/lib/asana";
import { exigirAdmin } from "@/lib/auth";
import { carregarPortal } from "@/lib/data";
import { LOCALIZACAO_LABEL, STATUS_LABEL } from "@/lib/rotulos";
import { lerOverrides } from "@/lib/store";
import { Cartao, TituloSecao } from "@/components/ui";
import { ClienteForm } from "./ClienteForm";

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="mx-auto mt-8 h-96 w-full max-w-5xl animate-pulse rounded-2xl bg-surface-2" />}>
      <Conteudo />
    </Suspense>
  );
}

function Alerta({ titulo, itens, dica }: { titulo: string; itens: string[]; dica?: string }) {
  if (itens.length === 0) return null;
  return (
    <details className="rounded-lg bg-amarelo-soft p-3 text-sm text-amarelo">
      <summary className="flex cursor-pointer items-center gap-1.5 font-medium">
        <AlertTriangle size={14} /> {titulo} ({itens.length})
      </summary>
      <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs">
        {itens.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
      {dica && <p className="mt-2 text-xs">{dica}</p>}
    </details>
  );
}

async function Conteudo() {
  await exigirAdmin();

  const dados = await Promise.all(
    CLIENTES.map(async (c) => {
      const overrides = await lerOverrides(c.slug);
      try {
        return { cliente: c, portal: await carregarPortal(c), overrides, erro: null };
      } catch (e) {
        return { cliente: c, portal: null, overrides, erro: String(e) };
      }
    }),
  );

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-brand">Área da equipe</h1>
          <p className="text-sm text-ink-soft">Gerencie o que aparece no portal de cada cliente.</p>
        </div>
        <form action={sair}>
          <button className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-brand">
            <LogOut size={14} /> Sair
          </button>
        </form>
      </div>

      <div
        className={`mb-6 flex items-center gap-2 rounded-xl p-3 text-sm ${
          asanaConfigurado() ? "bg-verde-soft text-verde" : "bg-amarelo-soft text-amarelo"
        }`}
      >
        <Database size={16} />
        {asanaConfigurado()
          ? "Asana conectado. Os dados são atualizados a cada minuto."
          : "Asana não configurado (ASANA_TOKEN ausente). Exibindo dados de exemplo."}
      </div>

      <div className="space-y-6">
        {dados.map(({ cliente, portal, overrides, erro }) => (
          <Cartao key={cliente.slug}>
            <div className="mb-4 flex items-center justify-between gap-2">
              <TituloSecao>
                {cliente.marca} — {cliente.nome}
              </TituloSecao>
              <Link href={`/p/${cliente.slug}`} className="inline-flex items-center gap-1 text-sm text-brand">
                Ver portal <ExternalLink size={14} />
              </Link>
            </div>

            {erro && <p className="mb-4 rounded-lg bg-amarelo-soft p-3 text-sm text-amarelo">Erro ao ler o Asana: {erro}</p>}

            {portal && (
              <>
                <p className="mb-3 text-xs text-ink-soft">
                  Fonte: {portal.fonte === "asana" ? "Asana" : "dados de exemplo"} · {portal.produtos.length} produtos
                  visíveis · {portal.pendencias.length} pendências abertas · {portal.atualizacoes.length} eventos públicos
                </p>

                <div className="mb-4 space-y-2">
                  <Alerta
                    titulo="Produtos sem localização informada"
                    itens={portal.diagnostico.produtosSemLocalizacao}
                    dica="Preencha o campo “Localização” no cartão do Asana. O portal não presume local."
                  />
                  <Alerta
                    titulo="Subtarefas sem vínculo com step"
                    itens={portal.diagnostico.subtarefasSemVinculo}
                    dica="Não aparecem ao cliente. Para vincular, adicione em src/config/asana.ts (VINCULOS) após validação da Marcelle."
                  />
                  <Alerta
                    titulo="Cartões ocultos do cliente"
                    itens={portal.diagnostico.ocultos.map((o) => `${o.nome} — ${o.motivo}`)}
                  />
                </div>

                <div className="mb-6 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs text-ink-soft">
                      <tr>
                        <th className="py-2 pr-3 font-medium">Produto</th>
                        <th className="py-2 pr-3 font-medium">Status</th>
                        <th className="py-2 pr-3 font-medium">Step atual</th>
                        <th className="py-2 pr-3 font-medium">Localização</th>
                        <th className="py-2 font-medium">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {portal.produtos.map((p) => (
                        <tr key={p.id} className="border-t border-line">
                          <td className="py-2 pr-3">{p.nome}</td>
                          <td className="py-2 pr-3">{STATUS_LABEL[p.status]}</td>
                          <td className="py-2 pr-3 text-ink-soft">{p.stepAtual ? `${p.stepAtual.step.id} ${p.stepAtual.step.nome}` : "—"}</td>
                          <td className="py-2 pr-3 text-ink-soft">{p.localizacao ? LOCALIZACAO_LABEL[p.localizacao] : "—"}</td>
                          <td className="py-2">{p.percentual}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <ClienteForm slug={cliente.slug} overrides={overrides} />
          </Cartao>
        ))}
      </div>
    </main>
  );
}
