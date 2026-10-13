import { createFileRoute } from "@tanstack/react-router";
import { EduChat } from "@/components/edu-chat";
import { EDU_MODULES } from "@/lib/edu-modules";

const cfg = EDU_MODULES.finance;

export const Route = createFileRoute("/finance")({
  head: () => ({
    meta: [
      { title: `${cfg.name} — ${cfg.topbar}` },
      { name: "description", content: cfg.welcome },
    ],
  }),
  component: () => <EduChat module={cfg} />,
});
