import { NotFoundGlitch } from "@/components/motion/not-found";

export default function NotFound() {
  return (
    <NotFoundGlitch
      title="Страница не найдена"
      description="Похоже, этот тайтл унесло в другой мир. Проверьте адрес или вернитесь в каталог."
      homeLabel="На главную"
      browseHref="/catalog"
      browseLabel="Открыть каталог"
    />
  );
}
