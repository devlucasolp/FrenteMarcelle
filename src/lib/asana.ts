import "server-only";
import { cacheLife, cacheTag } from "next/cache";

// Minimal Asana REST client. Only reads; the portal never writes to Asana.
// Docs: https://developers.asana.com/reference/rest-api-reference

const BASE = "https://app.asana.com/api/1.0";

export interface RawSubtask {
  gid: string;
  name: string;
  notes: string;
  completed: boolean;
  created_at: string;
  completed_at: string | null;
  modified_at: string;
}

export interface RawCustomField {
  name: string;
  display_value: string | null;
}

export interface RawTask {
  gid: string;
  name: string;
  notes: string;
  completed: boolean;
  created_at: string;
  modified_at: string;
  section: string;
  custom_fields: RawCustomField[];
  subtasks: RawSubtask[];
}

export interface RawProject {
  sections: string[];
  tasks: RawTask[];
}

export function asanaConfigurado(): boolean {
  return Boolean(process.env.ASANA_TOKEN);
}

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T[]> {
  const token = process.env.ASANA_TOKEN;
  if (!token) throw new Error("ASANA_TOKEN not set");

  const out: T[] = [];
  let offset: string | undefined;
  do {
    const qs = new URLSearchParams({ limit: "100", ...params });
    if (offset) qs.set("offset", offset);
    const res = await fetch(`${BASE}${path}?${qs}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Asana ${path} failed: ${res.status} ${await res.text()}`);
    }
    const body = (await res.json()) as { data: T[]; next_page?: { offset: string } | null };
    out.push(...body.data);
    offset = body.next_page?.offset;
  } while (offset);
  return out;
}

const SUBTASK_FIELDS = "name,notes,completed,created_at,completed_at,modified_at";

export async function lerProjeto(projectGid: string): Promise<RawProject> {
  "use cache";
  // Revalidate about every minute; tag lets an Asana webhook refresh on demand later.
  cacheLife("minutes");
  cacheTag("asana", `asana:${projectGid}`);

  const sections = await get<{ gid: string; name: string }>(`/projects/${projectGid}/sections`);

  const tasks = await get<{
    gid: string;
    name: string;
    notes: string;
    completed: boolean;
    created_at: string;
    modified_at: string;
    memberships: { project: { gid: string }; section: { name: string } | null }[];
    custom_fields?: RawCustomField[];
  }>(`/projects/${projectGid}/tasks`, {
    opt_fields:
      "name,notes,completed,created_at,modified_at,memberships.project.gid,memberships.section.name,custom_fields.name,custom_fields.display_value",
  });

  const comSubtarefas = await Promise.all(
    tasks.map(async (t) => {
      const subtasks = await get<RawSubtask>(`/tasks/${t.gid}/subtasks`, { opt_fields: SUBTASK_FIELDS });
      const membership = t.memberships.find((m) => m.project.gid === projectGid);
      return {
        gid: t.gid,
        name: t.name,
        notes: t.notes,
        completed: t.completed,
        created_at: t.created_at,
        modified_at: t.modified_at,
        section: membership?.section?.name ?? "",
        custom_fields: t.custom_fields ?? [],
        subtasks,
      } satisfies RawTask;
    }),
  );

  return { sections: sections.map((s) => s.name), tasks: comSubtarefas };
}
