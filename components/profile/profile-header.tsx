import { Settings } from "lucide-react";
import { Avatar } from "@/components/site/avatar";
import { LinkButton } from "@/components/site/press-link";

const joinedFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long", year: "numeric" });

/** "октября 2026 г." — the genitive month needs a day in the pattern, then the day is dropped. */
function joined(date: Date) {
  return joinedFormat.format(date).replace(/^\d+\s/, "");
}

export function ProfileHeader({
  profile,
  isOwner,
}: {
  profile: { name: string; username: string | null; displayUsername: string | null; image: string | null; bio: string | null; createdAt: Date };
  isOwner: boolean;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <Avatar name={profile.name} image={profile.image} size={88} className="ring-4 ring-background" />
      <div className="min-w-0 flex-1 space-y-1">
        <h1 className="truncate text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{profile.name}</h1>
        <p className="text-sm text-muted-foreground">
          {profile.username ? `@${profile.displayUsername ?? profile.username} · ` : ""}на сайте с {joined(profile.createdAt)}
        </p>
        {profile.bio ? <p className="max-w-2xl pt-1 text-sm text-foreground/85">{profile.bio}</p> : null}
      </div>
      {isOwner ? (
        <LinkButton href="/settings" variant="secondary" size="sm">
          <Settings className="size-3.5" /> Настройки
        </LinkButton>
      ) : null}
    </div>
  );
}
