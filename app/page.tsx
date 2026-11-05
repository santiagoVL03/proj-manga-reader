import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Manga Reader</h1>
      <p className="max-w-md text-sm opacity-70">
        Demo de login con Server Actions, cookie httpOnly firmada y proxy de
        Next.js 16.
      </p>

      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          Entrar
        </Link>
        <Link
          href="/dashboard"
          className="rounded-lg border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          Panel
        </Link>
      </div>
    </main>
  );
}
