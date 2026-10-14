import { redirect } from "next/navigation";
import { sessaoAtual } from "@/lib/auth";

// Pure redirect based on the session cookie; nothing to prerender.
export const instant = false;

export default async function Home() {
  const s = await sessaoAtual();
  if (s?.papel === "admin") redirect("/admin");
  if (s?.papel === "cliente") redirect(`/p/${s.slug}`);
  redirect("/login");
}
