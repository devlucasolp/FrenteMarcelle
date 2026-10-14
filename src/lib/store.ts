import "server-only";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Overrides } from "@/lib/portal";

// Pilot storage for admin edits: a JSON file. Not persistent on serverless hosts;
// swap for a database before going beyond the pilot.

const ARQUIVO = path.join(process.cwd(), "data", "store.json");

type Store = Record<string, Overrides>;

async function ler(): Promise<Store> {
  try {
    return JSON.parse(await fs.readFile(ARQUIVO, "utf8")) as Store;
  } catch {
    return {};
  }
}

export async function lerOverrides(slug: string): Promise<Overrides> {
  return (await ler())[slug] ?? {};
}

export async function salvarOverrides(slug: string, dados: Overrides): Promise<void> {
  const store = await ler();
  store[slug] = dados;
  await fs.mkdir(path.dirname(ARQUIVO), { recursive: true });
  await fs.writeFile(ARQUIVO, JSON.stringify(store, null, 2), "utf8");
}
