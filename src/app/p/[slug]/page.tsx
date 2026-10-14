import { Suspense } from "react";
import { notFound } from "next/navigation";
import { clientePorSlug } from "@/config/clientes";
import { exigirCliente } from "@/lib/auth";
import { carregarPortal } from "@/lib/data";
import { PortalView } from "@/components/PortalView";

export default function PortalPage({ params }: PageProps<"/p/[slug]">) {
  return (
    <Suspense fallback={<Carregando />}>
      <Conteudo params={params} />
    </Suspense>
  );
}

async function Conteudo({ params }: { params: PageProps<"/p/[slug]">["params"] }) {
  const { slug } = await params;
  await exigirCliente(slug);
  const cliente = clientePorSlug(slug);
  if (!cliente) notFound();

  const portal = await carregarPortal(cliente);

  return <PortalView portal={portal} />;
}

function Carregando() {
  return (
    <div className="mx-auto w-full max-w-6xl animate-pulse px-4 py-10">
      <div className="h-48 rounded-2xl bg-surface-2" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="h-64 rounded-2xl bg-surface-2" />
          <div className="h-96 rounded-2xl bg-surface-2" />
        </div>
        <div className="space-y-6">
          <div className="h-40 rounded-2xl bg-surface-2" />
          <div className="h-40 rounded-2xl bg-surface-2" />
        </div>
      </div>
    </div>
  );
}
