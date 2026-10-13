import { createFileRoute } from "@tanstack/react-router";
import { EduChat } from "@/components/edu-chat";
import { EDU_MODULES } from "@/lib/edu-modules";

const cfg = EDU_MODULES.start;

export const Route = createFileRoute("/start")({
  head: () => ({
    meta: [
      { title: `${cfg.name} — ${cfg.topbar}` },
      { name: "description", content: cfg.welcome },
    ],
  }),
  component: () => <EduChat module={cfg} />,
});
