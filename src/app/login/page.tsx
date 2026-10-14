import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sm">
        <Suspense fallback={<div className="h-44" />}>
          <Conteudo searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function Conteudo({ searchParams }: { searchParams: PageProps<"/login">["searchParams"] }) {
  const admin = (await searchParams).admin === "1";
  return (
    <>
      <h1 className="font-display text-2xl font-bold text-brand">{admin ? "Área da equipe" : "Acompanhe seu projeto"}</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {admin
          ? "Entre com a senha da equipe para gerenciar os portais."
          : "Digite o código de acesso que você recebeu da nossa equipe."}
      </p>
      <LoginForm admin={admin} />
    </>
  );
}
