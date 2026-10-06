import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Section({
  title,
  description,
  href,
  linkLabel = "Смотреть все",
  children,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("mx-auto w-full max-w-7xl px-4 md:px-6", className)}>
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h2>
          {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="group inline-flex shrink-0 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {linkLabel}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function PageHeader({ title, description, children }: { title: string; description?: string; children?: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 md:px-6 md:pt-14">
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p> : null}
      {children}
    </div>
  );
}
