import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthCard } from "@/components/auth/auth-card";
import { RegisterForm } from "@/components/auth/register-form";
import { SocialButtons } from "@/components/auth/social-buttons";
import { enabledSocialProviders, getSession } from "@/lib/auth";
import { safeRedirect } from "@/lib/safe-redirect";

export const metadata: Metadata = { title: "Регистрация" };

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const next = safeRedirect((await searchParams).next);
  if (await getSession()) redirect(next);
  return (
    <AuthCard
      title="Создать аккаунт"
      description="Списки, оценки и комментарии — бесплатно."
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-foreground underline underline-offset-4">
            Войти
          </Link>
        </>
      }
    >
      <RegisterForm next={next} />
      <SocialButtons providers={enabledSocialProviders} next={next} />
    </AuthCard>
  );
}
