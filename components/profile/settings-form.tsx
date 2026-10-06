"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { type ButtonState, StatefulButton } from "@/components/motion/button";
import { Input } from "@/components/motion/input";
import { Avatar } from "@/components/site/avatar";
import { authClient } from "@/lib/auth-client";

const USERNAME_RE = /^[a-zA-Z0-9_.]{3,24}$/;

function flash(set: (s: ButtonState) => void, state: ButtonState) {
  set(state);
  setTimeout(() => set("idle"), 1600);
}

export function ProfileSettingsForm({
  initial,
}: {
  initial: { name: string; username: string; image: string; bio: string };
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [error, setError] = useState<{ field: keyof typeof initial; message: string } | null>(null);
  const [state, setState] = useState<ButtonState>("idle");
  const set = (field: keyof typeof initial) => (value: string) => {
    setValues((v) => ({ ...v, [field]: value }));
    setError(null);
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (values.name.trim().length < 2) return setError({ field: "name", message: "Минимум 2 символа" });
    if (!USERNAME_RE.test(values.username)) return setError({ field: "username", message: "3–24 символа: латиница, цифры, _ и ." });
    if (values.image && !/^https:\/\/\S+$/.test(values.image)) return setError({ field: "image", message: "Нужна ссылка https://…" });
    setState("loading");
    const { error } = await authClient.updateUser({
      name: values.name.trim(),
      image: values.image.trim() || null,
      bio: values.bio.trim().slice(0, 300) || null,
      ...(values.username !== initial.username ? { username: values.username.trim() } : {}),
    });
    if (error) {
      flash(setState, "error");
      setError(
        error.code?.includes("USERNAME")
          ? { field: "username", message: "Это имя уже занято" }
          : { field: "name", message: error.message ?? "Не удалось сохранить" },
      );
      return;
    }
    flash(setState, "success");
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="flex items-center gap-4">
        <Avatar name={values.name || "?"} image={values.image || null} size={56} />
        <p className="text-sm text-muted-foreground">Аватар — ссылка на картинку. Без неё покажем инициалы.</p>
      </div>
      <Input label="Имя" value={values.name} onChange={set("name")} error={error?.field === "name" ? error.message : undefined} />
      <Input
        label="Имя пользователя"
        value={values.username}
        onChange={set("username")}
        error={error?.field === "username" ? error.message : undefined}
      />
      <Input
        label="Ссылка на аватар"
        value={values.image}
        onChange={set("image")}
        placeholder="https://…"
        error={error?.field === "image" ? error.message : undefined}
      />
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-foreground">О себе</span>
        <textarea
          value={values.bio}
          onChange={(e) => set("bio")(e.target.value.slice(0, 300))}
          rows={3}
          className="block w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-border-strong"
          placeholder="Пара слов о ваших вкусах"
        />
        <span className="block text-right text-xs text-muted-foreground">{values.bio.length}/300</span>
      </label>
      <StatefulButton type="submit" state={state} loadingText="Сохраняем" successText="Сохранено" errorText="Ошибка">
        Сохранить
      </StatefulButton>
    </form>
  );
}

export function PasswordForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<ButtonState>("idle");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (next.length < 8) return setError("Новый пароль — минимум 8 символов");
    setState("loading");
    const { error } = await authClient.changePassword({ currentPassword: current, newPassword: next, revokeOtherSessions: true });
    if (error) {
      flash(setState, "error");
      setError(error.code?.includes("PASSWORD") ? "Текущий пароль неверный" : (error.message ?? "Не удалось сменить пароль"));
      return;
    }
    setCurrent("");
    setNext("");
    flash(setState, "success");
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <Input label="Текущий пароль" type="password" value={current} onChange={setCurrent} autoComplete="current-password" />
      <Input
        label="Новый пароль"
        type="password"
        value={next}
        onChange={(v) => {
          setNext(v);
          setError(null);
        }}
        autoComplete="new-password"
        error={error ?? undefined}
      />
      <StatefulButton
        type="submit"
        variant="secondary"
        state={state}
        disabled={!current || !next}
        loadingText="Меняем"
        successText="Пароль изменён"
        errorText="Ошибка"
      >
        Сменить пароль
      </StatefulButton>
    </form>
  );
}
