import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { LoginForm } from "@/components/auth/login-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { enabledSocialProviders, getSession } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Вход" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const next = safeRedirect((await searchParams).next);
  if (await getSession()) redirect(next);
  return (
    <AuthCard
      title="С возвращением"
      description="Войдите, чтобы вести списки и комментировать."
      footer={
        <>
          Нет аккаунта?{" "}
          <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-foreground underline underline-offset-4">
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
      <SocialButtons providers={enabledSocialProviders} next={next} />
    </AuthCard>
  );
}
