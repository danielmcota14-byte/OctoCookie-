import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect } from "react";

// /adm abre a aba de administração (HTML estático em public/adm.html).
// ATENÇÃO: beforeLoad com window.location só roda no servidor em acesso direto (SSR) e a página ficava em branco.
// Agora: redirect no servidor (SSR) + redirecionamento no navegador (useEffect) como garantia.
export const Route = createFileRoute("/adm")({
  head: () => ({ meta: [{ title: "Adm — OctoCookie" }, { name: "robots", content: "noindex, nofollow" }] }),
  beforeLoad: () => {
    if (typeof window === "undefined") throw redirect({ href: "/adm.html" });
  },
  component: AdmRedirect,
});

function AdmRedirect() {
  useEffect(() => {
    window.location.replace("/adm.html");
  }, []);
  return (
    <p className="p-6 text-sm text-muted-foreground">
      Abrindo o painel… <a href="/adm.html" className="underline">clique aqui</a> se não abrir.
    </p>
  );
}
