"use client";

import { AtSign, Lock, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { type ButtonState, StatefulButton } from "@/components/motion/button";
import { Input } from "@/components/motion/input";
import { signUp } from "@/lib/auth-client";

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,24}$/;

type Field = "name" | "username" | "email" | "password";

export function RegisterForm({ next }: { next: string }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<Field, string>>({ name: "", username: "", email: "", password: "" });
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [state, setState] = useState<ButtonState>("idle");
  const set = (field: Field) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (values.name.trim().length < 2) next.name = "Минимум 2 символа";
    if (!USERNAME_RE.test(values.username)) next.username = "3–24 символа: латиница, цифры, _ и .";
    if (!/^\S+@\S+\.\S+$/.test(values.email)) next.email = "Проверьте адрес";
    if (values.password.length < 8) next.password = "Минимум 8 символов";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setState("loading");
    const { error } = await signUp.email({
      name: values.name.trim(),
      username: values.username.trim(),
      email: values.email.trim(),
      password: values.password,
    });
    if (error) {
      setState("error");
      const code = error.code ?? "";
      if (code.includes("USERNAME")) setErrors({ username: "Это имя уже занято" });
      else if (code.includes("EMAIL") || code.includes("USER_ALREADY_EXISTS")) setErrors({ email: "Этот email уже зарегистрирован" });
      else setErrors({ password: error.message ?? "Не удалось зарегистрироваться" });
      setTimeout(() => setState("idle"), 1200);
      return;
    }
    setState("success");
    router.replace(next);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <Input label="Имя" value={values.name} onChange={set("name")} autoComplete="name" error={errors.name} leftIcon={<UserRound className="size-4" />} />
      <Input
        label="Имя пользователя"
        value={values.username}
        onChange={set("username")}
        autoComplete="username"
        error={errors.username}
        leftIcon={<AtSign className="size-4" />}
      />
      <Input label="Email" type="email" value={values.email} onChange={set("email")} autoComplete="email" error={errors.email} leftIcon={<Mail className="size-4" />} />
      <Input
        label="Пароль"
        type="password"
        value={values.password}
        onChange={set("password")}
        autoComplete="new-password"
        error={errors.password}
        leftIcon={<Lock className="size-4" />}
      />
      <StatefulButton type="submit" state={state} className="mt-2 w-full" loadingText="Создаём" successText="Готово" errorText="Ошибка">
        Создать аккаунт
      </StatefulButton>
    </form>
  );
}
