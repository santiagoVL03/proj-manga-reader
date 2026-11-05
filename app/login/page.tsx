import Link from "next/link";
import { LoginForm } from "./login-form";

export const metadata = {
  title: "Entrar · Manga Reader",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6 rounded-2xl border border-black/10 p-8 dark:border-white/15">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
          <p className="text-sm opacity-70">
            Usa el usuario de demostración para probar el flujo completo.
          </p>
        </div>

        <LoginForm />

        <p className="text-xs opacity-60">
          demo@manga.dev · demo1234
        </p>

        <Link
          href="/"
          className="inline-block text-sm underline underline-offset-4"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
