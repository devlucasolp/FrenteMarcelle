import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import manual from "../../../public/manual/jornada-desenvolvimento.webp";

export const metadata = { title: "Manual da Jornada do Cliente — Assinatura" };

// The manual is the same for every project; this is the exact image Marcelle uses in production.
export default function ManualPage() {
  return (
    <main className="mx-auto w-full max-w-[1400px] px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-1.5 text-sm text-brand hover:underline">
          <ArrowLeft size={15} /> Voltar ao portal
        </Link>
        <a
          href="/manual/jornada-desenvolvimento.webp"
          download="Manual-Jornada-Desenvolvimento-Assinatura.webp"
          className="flex items-center gap-1.5 rounded-lg bg-brand-dark px-3 py-2 text-sm text-white hover:opacity-90"
        >
          <Download size={15} /> Baixar manual
        </a>
      </div>
      <h1 className="sr-only">Manual da Jornada do Cliente — Jornada Desenvolvimento</h1>
      <div className="overflow-x-auto rounded-2xl border border-line bg-white p-2">
        <Image src={manual} alt="Jornada Desenvolvimento: as cinco trilhas, etapas, prazos de referência e marcos" priority className="h-auto w-full min-w-[900px]" />
      </div>
    </main>
  );
}
