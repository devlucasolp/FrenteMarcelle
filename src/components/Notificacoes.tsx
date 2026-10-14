"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Bell, BellRing } from "lucide-react";
import type { Pendencia } from "@/lib/types";

// Phase 1: browser notifications while the portal is open (polling).
// Phase 2 (planned): Web Push / WhatsApp via Evolution API so it reaches a closed phone.

const INTERVALO_MS = 2 * 60 * 1000;
const chave = (slug: string) => `pendencias-vistas:${slug}`;

function lerVistas(slug: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(chave(slug)) ?? "[]");
  } catch {
    return [];
  }
}

function gravarVistas(slug: string, ids: string[]) {
  try {
    localStorage.setItem(chave(slug), JSON.stringify(ids));
  } catch {}
}

export function Notificacoes({ slug }: { slug: string }) {
  const atual = useSyncExternalStore(
    () => () => {},
    () => (typeof Notification === "undefined" ? "indisponivel" : Notification.permission),
    () => "default" as const,
  );
  const [pedida, setPermissao] = useState<NotificationPermission | null>(null);
  const permissao = pedida ?? atual;

  useEffect(() => {
    if (permissao !== "granted") return;
    let cancelado = false;

    async function checar() {
      try {
        const res = await fetch(`/api/p/${slug}/pendencias`, { cache: "no-store" });
        if (!res.ok || cancelado) return;
        const pendencias = (await res.json()) as Pendencia[];
        const vistas = new Set(lerVistas(slug));
        for (const p of pendencias.filter((x) => !vistas.has(x.id))) {
          new Notification("Precisamos de você no seu projeto", {
            body: `${p.produtoNome ? `${p.produtoNome}: ` : ""}${p.titulo}`,
            tag: p.id,
          });
        }
        gravarVistas(
          slug,
          pendencias.map((p) => p.id),
        );
      } catch {}
    }

    checar();
    const id = setInterval(checar, INTERVALO_MS);
    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [permissao, slug]);

  if (permissao === "indisponivel" || permissao === "denied") return null;

  if (permissao === "granted") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-verde">
        <BellRing size={14} /> Notificações ativas
      </span>
    );
  }

  return (
    <button
      onClick={async () => setPermissao(await Notification.requestPermission())}
      className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs text-ink-soft transition hover:border-brand hover:text-brand"
    >
      <Bell size={14} /> Avise-me quando precisarem de mim
    </button>
  );
}
