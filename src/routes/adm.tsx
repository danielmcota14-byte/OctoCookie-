import { createFileRoute } from "@tanstack/react-router";

// /adm abre a aba de administração (HTML estático em public/adm.html).
export const Route = createFileRoute("/adm")({
  head: () => ({ meta: [{ title: "Adm — OctoCookie" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: () => {
    if (typeof window !== "undefined") window.location.replace("/adm.html");
  },
  component: () => null,
});
