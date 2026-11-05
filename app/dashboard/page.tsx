import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { logout } from "./actions";

export const metadata = {
  title: "Panel · Manga Reader",
};

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      {/*
        Con cacheComponents activado, leer `cookies()` fuera de un <Suspense>
        es un error de build: la sesión no se puede prerenderizar en el shell.
      */}
      <Suspense fallback={<p className="text-sm opacity-70">Cargando sesión…</p>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}

async function Dashboard() {
  const session = await getSession();

  // Segunda barrera: el proxy ya filtra, pero la página no confía en él.
  if (!session) {
    redirect("/login");
  }

  const expiresAt = new Date(session.exp * 1000).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <>
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Hola, {session.name}
          </h1>
          <p className="text-sm opacity-70">Sesión válida hasta {expiresAt}.</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="rounded-lg border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
          >
            Salir
          </button>
        </form>
      </header>

      <p className="text-sm opacity-70">
        Aquí iría tu biblioteca. Esta ruta solo se renderiza con una cookie
        firmada válida: el proxy redirige a <code>/login</code> si falta.
      </p>

      <Link href="/" className="text-sm underline underline-offset-4">
        Volver al inicio
      </Link>
    </>
  );
}
