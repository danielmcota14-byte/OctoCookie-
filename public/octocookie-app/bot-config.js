/**
 * Config automática do Bot 24/7.
 * URL + OWNER_TOKEN fixos — não precisa o usuário preencher no card.
 * O MESMO OWNER_TOKEN deve estar nas env vars do serviço no Render.
 */
window.OCTO_BOT_CONFIG = window.OCTO_BOT_CONFIG || {
  url: (typeof location !== "undefined" && /^https?:/.test(location.origin) ? location.origin : "") + "/bot",
  token: "5a7affdc9cdf9d970febaf4819816b53",
};
