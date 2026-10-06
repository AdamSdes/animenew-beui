import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PasswordForm, ProfileSettingsForm } from "@/components/profile/settings-form";
import { PageHeader } from "@/components/site/section";
import { getSession } from "@/lib/auth";

export const metadata: Metadata = { title: "Настройки" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login?next=/settings");
  const { user } = session;

  return (
    <>
      <PageHeader title="Настройки" description="Профиль и безопасность аккаунта." />
      <div className="mx-auto grid max-w-7xl gap-6 px-4 md:px-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-border bg-card/40 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Профиль</h2>
          <ProfileSettingsForm
            initial={{
              name: user.name,
              username: user.displayUsername ?? user.username ?? "",
              image: user.image ?? "",
              bio: user.bio ?? "",
            }}
          />
        </section>
        <section className="h-fit rounded-2xl border border-border bg-card/40 p-6">
          <h2 className="mb-5 text-lg font-semibold text-foreground">Пароль</h2>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
