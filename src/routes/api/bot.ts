import { createFileRoute } from "@tanstack/react-router";
import {
  getBotStatus,
  botStart,
  botStop,
  botReset,
} from "@/lib/bot-24x7.server";

export const Route = createFileRoute("/api/bot")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json(getBotStatus());
      },
      POST: async ({ request }) => {
        let action = "status";
        try {
          const body = (await request.json()) as { action?: string };
          if (body?.action) action = body.action;
        } catch {
          /* empty body */
        }
        const url = new URL(request.url);
        const q = url.searchParams.get("action");
        if (q) action = q;

        if (action === "start") return Response.json(botStart());
        if (action === "stop") return Response.json(botStop());
        if (action === "reset") return Response.json(botReset());
        return Response.json(getBotStatus());
      },
    },
  },
});
