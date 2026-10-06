import Link from "next/link";
import type { ReactNode } from "react";

export function AuthCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div aria-hidden="true" className="grid-noise mask-radial-fade absolute inset-0 opacity-50" />
      <div className="relative w-full max-w-sm">
        <div className="rounded-3xl border border-border bg-card/70 p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="mb-6 space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {children}
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            ← На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
