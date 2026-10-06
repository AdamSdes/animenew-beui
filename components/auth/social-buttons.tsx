"use client";

import { Button } from "@/components/motion/button";
import { signIn } from "@/lib/auth-client";

const LABELS = { github: "GitHub", discord: "Discord", google: "Google" } as const;

export function SocialButtons({ providers, next }: { providers: (keyof typeof LABELS)[]; next: string }) {
  if (!providers.length) return null;
  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> или <span className="h-px flex-1 bg-border" />
      </div>
      <div className="grid gap-2">
        {providers.map((provider) => (
          <Button
            key={provider}
            variant="secondary"
            className="w-full"
            onClick={() => signIn.social({ provider, callbackURL: next })}
          >
            Продолжить через {LABELS[provider]}
          </Button>
        ))}
      </div>
    </>
  );
}
