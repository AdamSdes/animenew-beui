"use client";

import { AtSign, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { type ButtonState, StatefulButton } from "@/components/motion/button";
import { Input } from "@/components/motion/input";
import { signIn } from "@/lib/auth-client";

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ButtonState>("idle");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setState("loading");
    const id = login.trim();
    const { error } = id.includes("@")
      ? await signIn.email({ email: id, password })
      : await signIn.username({ username: id, password });
    if (error) {
      setState("error");
      setError(error.status === 401 || error.code?.startsWith("INVALID") ? "Неверный логин или пароль" : (error.message ?? "Не удалось войти"));
      setTimeout(() => setState("idle"), 1200);
      return;
    }
    setState("success");
    router.replace(next);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <Input
        label="Email или имя пользователя"
        value={login}
        onChange={setLogin}
        autoComplete="username"
        required
        leftIcon={<AtSign className="size-4" />}
      />
      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={setPassword}
        autoComplete="current-password"
        required
        leftIcon={<Lock className="size-4" />}
        error={error ?? undefined}
      />
      <StatefulButton
        type="submit"
        state={state}
        className="mt-2 w-full"
        disabled={!login.trim() || !password}
        loadingText="Входим"
        successText="Готово"
        errorText="Ошибка"
      >
        Войти
      </StatefulButton>
    </form>
  );
}
