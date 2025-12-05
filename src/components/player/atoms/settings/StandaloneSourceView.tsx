import { useTranslation } from "react-i18next";
import { Menu } from "@/components/player/internals/ContextMenu";
import { SelectableLink } from "@/components/player/internals/ContextMenu/Links";
import { useOverlayRouter } from "@/hooks/useOverlayRouter";
import { usePlayerStore } from "@/stores/player/store";
import { servers } from "@/server";

export function StandaloneSourceView({ id }: { id: string }) {
  const { t } = useTranslation();
  const router = useOverlayRouter(id);
  const currentSourceId = usePlayerStore((s) => s.sourceId);
  const setSourceId = usePlayerStore((s) => s.setSourceId);

  return (
    <>
      <Menu.BackLink onClick={() => router.navigate("/")}>
        {t("player.menus.sources.title")}
      </Menu.BackLink>
      <Menu.Section className="pb-4">
        {servers.map((server) => (
          <SelectableLink
            key={server.name}
            onClick={() => {
              setSourceId(server.name);
              router.close();
            }}
            selected={server.name === currentSourceId}
          >
            {server.name}
          </SelectableLink>
        ))}
      </Menu.Section>
    </>
  );
}
