/**
 * Config automática do Bot 24/7.
 * No deploy do site, defina a URL do bot-server aqui OU via VITE_BOT_24X7_URL no build.
 * Ex.: window.OCTO_BOT_CONFIG = { url: "https://octocookie-bot-24x7.onrender.com" };
 *
 * Se deixar vazio, o usuário preenche no card "Bot 24/7 no servidor".
 */
window.OCTO_BOT_CONFIG = window.OCTO_BOT_CONFIG || {
  // Preencha após o deploy do bot-server (Blueprint Render → serviço octocookie-bot-24x7):
  url: "",
};
