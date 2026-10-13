/**
 * OctoCookie — 7 perfis financeiros mapeados 1:1 aos parâmetros reais do motor (ENG).
 * Fluxo: quiz → escolha → termos do perfil → aplica e simplifica o painel.
 */
(function () {
  const LS_PERFIL = "octocookie.perfil.v1";

  /**
   * Cada perfil define exatamente o que o bot usa:
   * - trader: original | combinado | holograma
   * - modo: tendencia | quantica | escala  (regra de decisão do holograma)
   * - barra: 0–100 (paramsBarra → janela, limiar, stop, exposição)
   * - filtro / filtroN: entrada RSI/SMA/MACD/Bollinger
   * - stopVivo, auto
   */
  const PERFIS = [
    {
      id: "defensivo",
      nome: "Defensivo",
      emoji: "🛡️",
      tagline: "Preservar capital, operar pouco",
      trader: "holograma",
      modo: "tendencia",
      barra: 20,
      filtro: "estrito",
      filtroN: 4,
      stopVivo: true,
      auto: false,
      resumo:
        "Usa só o Holograma em modo tendência (preço em velas de 8h). Potência de risco baixa (~20%). Só entra se RSI, SMA20, MACD e Bollinger confirmarem juntos. Stop móvel ligado.",
      comoInveste:
        "O sistema observa o preço a cada poucas horas. Só compra quando a tendência de alta é clara e os 4 indicadores clássicos concordam. Se o preço cair do pico recente, vende para proteger. Opera com cerca de 20% da potência testada — menos exposição, menos trocas.",
      combinacao: "Só Holograma + tendência + barra 20% + filtro estrito (4/4) + stop móvel",
    },
    {
      id: "cauteloso",
      nome: "Cauteloso",
      emoji: "🌱",
      tagline: "Crescimento lento com freios",
      trader: "holograma",
      modo: "tendencia",
      barra: 35,
      filtro: "votacao",
      filtroN: 3,
      stopVivo: true,
      auto: false,
      resumo:
        "Holograma em tendência, potência ~35%. Entra se pelo menos 3 dos 4 indicadores (RSI, SMA20, MACD, Bollinger) confirmarem. Stop móvel ativo.",
      comoInveste:
        "Compra quando a tendência aponta alta e a maioria dos indicadores confirma. Vende na virada da tendência ou no stop. Risco moderado-baixo.",
      combinacao: "Só Holograma + tendência + barra 35% + filtro votação 3/4 + stop móvel",
    },
    {
      id: "equilibrado",
      nome: "Equilibrado",
      emoji: "⚖️",
      tagline: "Meio-termo entre segurança e retorno",
      trader: "holograma",
      modo: "tendencia",
      barra: 55,
      filtro: "votacao",
      filtroN: 2,
      stopVivo: true,
      auto: false,
      resumo:
        "Holograma em tendência, potência ~55%. Filtro leve (2 de 4 votos). Stop móvel ligado.",
      comoInveste:
        "Segue a tendência do Holograma com exposição média. O filtro só exige dois sinais de confirmação para entrar — mais oportunidades que o Cauteloso, ainda com proteção de stop.",
      combinacao: "Só Holograma + tendência + barra 55% + filtro votação 2/4 + stop móvel",
    },
    {
      id: "crescimento",
      nome: "Crescimento",
      emoji: "📈",
      tagline: "Mais exposição, filtro desligado",
      trader: "holograma",
      modo: "tendencia",
      barra: 75,
      filtro: "off",
      filtroN: 3,
      stopVivo: true,
      auto: false,
      resumo:
        "Holograma em tendência, potência ~75%. Sem filtro de indicadores: a regra sozinha decide entradas. Stop móvel ativo.",
      comoInveste:
        "Quando a tendência diz comprar, o bot compra (sem esperar RSI/MACD). Ainda usa stop móvel para limitar quedas. Mais ativo que o Equilibrado.",
      combinacao: "Só Holograma + tendência + barra 75% + filtro desligado + stop móvel",
    },
    {
      id: "testado",
      nome: "Como foi testado",
      emoji: "✅",
      tagline: "Ponto de 100% validado nos testes",
      trader: "holograma",
      modo: "tendencia",
      barra: 100,
      filtro: "off",
      filtroN: 3,
      stopVivo: true,
      auto: false,
      resumo:
        "Configuração de referência dos testes: Só Holograma, tendência, potência 100%, filtro desligado, stop móvel. É o único ponto de potência com backtest dedicado.",
      comoInveste:
        "O bot replica a regra que foi comparada com o Python e testada no histórico. Usa 100% da exposição prevista pela barra. Não é garantia de lucro — é a configuração de referência educacional.",
      combinacao: "Só Holograma + tendência + barra 100% + filtro off + stop móvel (referência de teste)",
    },
    {
      id: "quantico",
      nome: "Explorador quântico",
      emoji: "⚛️",
      tagline: "Circuito de 8 qubits decide o sinal",
      trader: "holograma",
      modo: "quantica",
      barra: 50,
      filtro: "votacao",
      filtroN: 3,
      stopVivo: true,
      auto: false,
      resumo:
        "Holograma em modo QUÂNTICO: o circuito simulado de 8 qubits (não é hardware real) gera direção e desordem; isso alimenta a regra de compra/venda. Potência ~50% + filtro 3/4.",
      comoInveste:
        "A cada atualização o sistema monta features de preço, roda o circuito simulado e usa a direção de Born e a desordem para decidir. Não prevê o futuro: é outra forma de ler o mesmo preço. Em muitos históricos a tendência pura se sai melhor — por isso a potência é média e há filtro de entrada.",
      combinacao: "Só Holograma + modo quântica (circuito 8q real no motor) + barra 50% + filtro 3/4 + stop móvel",
    },
    {
      id: "classico",
      nome: "Clássico assistido",
      emoji: "🎯",
      tagline: "Trader RSI/MACD com freio do Holograma",
      trader: "combinado",
      modo: "tendencia",
      barra: 60,
      filtro: "off",
      filtroN: 3,
      stopVivo: true,
      auto: false,
      resumo:
        "O trader clássico (RSI, SMA, MACD, Bollinger) gera os sinais; o Holograma só VETA: BUY só em tendência de alta sem stop, SELL só fora de alta. Potência ~60%.",
      comoInveste:
        "Indicadores clássicos propõem compra/venda. O Holograma em tendência atua como limitador: bloqueia compras sem alta e vendas em alta. Você não opera “só holograma” nem “só clássico” — os dois juntos.",
      combinacao: "Trader original + limitador Holograma + tendência + barra 60% + stop móvel",
    },
  ];

  const QUIZ = [
    {
      q: "O que importa mais para você agora?",
      opts: [
        { t: "Não perder o que já tenho", scores: { defensivo: 3, cauteloso: 2, equilibrado: 1 } },
        { t: "Equilíbrio entre proteger e crescer", scores: { equilibrado: 3, cauteloso: 1, crescimento: 1 } },
        { t: "Buscar o máximo de retorno possível", scores: { testado: 2, crescimento: 3, quantico: 1 } },
        { t: "Entender e experimentar o sistema quântico", scores: { quantico: 3, classico: 1 } },
      ],
    },
    {
      q: "Se o mercado cair 15% em uma semana, você…",
      opts: [
        { t: "Prefiro ter operado pouco ou estar fora", scores: { defensivo: 3, cauteloso: 2 } },
        { t: "Aceito desde que o sistema tenha stop", scores: { equilibrado: 2, crescimento: 2, testado: 1 } },
        { t: "Faço parte do jogo; quero exposição alta", scores: { testado: 3, crescimento: 2 } },
        { t: "Quero que indicadores clássicos também pesem", scores: { classico: 3, cauteloso: 1 } },
      ],
    },
    {
      q: "Como prefere que o bot decida?",
      opts: [
        { t: "Só pela tendência de preço (mais estável)", scores: { defensivo: 1, cauteloso: 1, equilibrado: 2, crescimento: 2, testado: 2 } },
        { t: "Pelo circuito quântico simulado (experimental)", scores: { quantico: 3 } },
        { t: "Pelos indicadores clássicos, com freio do Holograma", scores: { classico: 3 } },
        { t: "Igual aos testes oficiais (100%)", scores: { testado: 3, crescimento: 1 } },
      ],
    },
    {
      q: "Quanto “filtro extra” antes de comprar?",
      opts: [
        { t: "Muito — só com todos os indicadores alinhados", scores: { defensivo: 3, cauteloso: 1 } },
        { t: "Médio — maioria dos indicadores", scores: { cauteloso: 2, equilibrado: 2, quantico: 1 } },
        { t: "Pouco ou nenhum — a regra principal basta", scores: { crescimento: 2, testado: 3, classico: 1 } },
        { t: "Não sei — escolha o mais didático", scores: { equilibrado: 2, testado: 1 } },
      ],
    },
  ];

  function el(id) {
    return document.getElementById(id);
  }

  function getSaved() {
    try {
      return JSON.parse(localStorage.getItem(LS_PERFIL) || "null");
    } catch {
      return null;
    }
  }

  function savePerfil(p) {
    localStorage.setItem(LS_PERFIL, JSON.stringify({ id: p.id, at: Date.now() }));
  }

  function findPerfil(id) {
    return PERFIS.find((p) => p.id === id) || PERFIS[2];
  }

  /** Aplica parâmetros reais no motor + UI nativa */
  function applyPerfil(p) {
    savePerfil(p);
    try {
      const ENG = window.__OCTO_ENG;
      if (ENG) {
        ENG.trader = p.trader;
        ENG.modo = p.modo;
        ENG.filtro = p.filtro;
        ENG.filtroN = p.filtroN;
        ENG.stopVivo = !!p.stopVivo;
        ENG.auto = !!p.auto;
        if (typeof window.__OCTO_aplicarBarra === "function") window.__OCTO_aplicarBarra(p.barra);
        else {
          ENG.barra = p.barra;
          ENG.risco = p.barra;
        }
        if (p.modo === "quantica") ENG.modo = "quantica";
        if (typeof window.__OCTO_salvar === "function") window.__OCTO_salvar();
        if (typeof window.__OCTO_tick === "function") window.__OCTO_tick();
      }
      // sincroniza selects nativos se existirem
      const map = [
        ["hgTrader", p.trader],
        ["hgModo", p.modo],
        ["hgFiltro", p.filtro],
        ["hgFiltroN", String(p.filtroN)],
        ["hgBarra", String(p.barra)],
      ];
      map.forEach(([id, val]) => {
        const n = el(id);
        if (n) {
          n.value = val;
          n.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      const sv = el("hgStopVivo");
      if (sv) sv.checked = !!p.stopVivo;
    } catch (e) {
      console.warn("[perfis] apply", e);
    }
    simplifyUI(p);
    const badge = el("perfilBadge");
    if (badge) {
      badge.style.display = "flex";
      badge.innerHTML = `<span style="font-size:18px">${p.emoji}</span><div><b>${p.nome}</b><br><small style="opacity:.7">${p.tagline}</small></div>`;
    }
  }

  /** Esconde cards técnicos — painel para leigo */
  function simplifyUI(p) {
    document.body.classList.add("perfil-simples");
    const hideIds = [
      "hgDetalhes", // mapa qubits, histórico denso, curva
    ];
    hideIds.forEach((id) => {
      const n = el(id);
      if (n) n.style.display = "none";
    });
    // esconde cards por cabeçalho
    document.querySelectorAll(".card").forEach((card) => {
      const h = (card.querySelector(".card-header") || {}).textContent || "";
      if (/Parâmetros de Trade|Segurança|Agressividade|Análise em Progresso|Regra do Holograma|Circuito de 8/i.test(h)) {
        card.classList.add("perfil-hide");
      }
    });
    // resumo único
    let box = el("perfilResumoCard");
    if (!box) {
      box = document.createElement("div");
      box.id = "perfilResumoCard";
      box.className = "card perfil-resumo";
      const head = document.querySelector(".hg-head") || document.querySelector(".card");
      if (head && head.parentNode) head.parentNode.insertBefore(box, head.nextSibling);
      else document.querySelector(".app-wrapper")?.appendChild(box);
    }
    box.style.display = "block";
    box.innerHTML = `
      <div class="card-header">${p.emoji} Seu perfil: ${p.nome}</div>
      <p style="font-size:13px;line-height:1.55;color:var(--text2);margin:0 0 10px">${p.comoInveste}</p>
      <div style="font-size:11px;color:var(--text3);padding:8px;background:var(--bg3);border-radius:8px">
        <b>Combinação ativa:</b> ${p.combinacao}<br>
        <b>Potência:</b> ${p.barra}% · <b>Modo trader:</b> ${p.trader} · <b>Decisão:</b> ${p.modo}
      </div>
      <button type="button" id="btnTrocarPerfil" class="primary" style="margin-top:12px;width:100%">Trocar perfil</button>
    `;
    el("btnTrocarPerfil")?.addEventListener("click", () => {
      localStorage.removeItem(LS_PERFIL);
      localStorage.removeItem("termsAcceptedSwap");
      location.reload();
    });
  }

  function scoreQuiz(answers) {
    const sc = {};
    PERFIS.forEach((p) => (sc[p.id] = 0));
    answers.forEach((oi, qi) => {
      const opt = QUIZ[qi].opts[oi];
      if (!opt) return;
      Object.entries(opt.scores).forEach(([id, v]) => {
        sc[id] = (sc[id] || 0) + v;
      });
    });
    return PERFIS.slice().sort((a, b) => sc[b.id] - sc[a.id]);
  }

  function showQuiz() {
    const overlay = el("perfilQuiz");
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    let step = 0;
    const answers = [];
    const root = el("perfilQuizBody");

    function render() {
      if (step < QUIZ.length) {
        const item = QUIZ[step];
        root.innerHTML = `
          <div style="font-size:12px;color:var(--text3);margin-bottom:8px">Pergunta ${step + 1} de ${QUIZ.length}</div>
          <h2 style="font-family:var(--font-head);font-size:18px;margin:0 0 16px">${item.q}</h2>
          <div class="perfil-opts">
            ${item.opts
              .map(
                (o, i) =>
                  `<button type="button" class="perfil-opt" data-i="${i}">${o.t}</button>`,
              )
              .join("")}
          </div>`;
        root.querySelectorAll(".perfil-opt").forEach((btn) => {
          btn.onclick = () => {
            answers[step] = +btn.dataset.i;
            step++;
            render();
          };
        });
        return;
      }
      const ranked = scoreQuiz(answers);
      const sug = ranked[0];
      root.innerHTML = `
        <h2 style="font-family:var(--font-head);font-size:18px;margin:0 0 8px">Sugestão: ${sug.emoji} ${sug.nome}</h2>
        <p style="font-size:13px;color:var(--text2);margin:0 0 14px">${sug.tagline}. ${sug.resumo}</p>
        <p style="font-size:12px;color:var(--text3);margin:0 0 10px">Ou escolha outro perfil:</p>
        <div class="perfil-grid">
          ${PERFIS.map(
            (p) => `
            <button type="button" class="perfil-card" data-id="${p.id}">
              <div style="font-size:22px">${p.emoji}</div>
              <b>${p.nome}</b>
              <small>${p.tagline}</small>
            </button>`,
          ).join("")}
        </div>`;
      root.querySelectorAll(".perfil-card").forEach((btn) => {
        btn.onclick = () => {
          const p = findPerfil(btn.dataset.id);
          overlay.style.display = "none";
          showTermosPerfil(p);
        };
      });
    }
    render();
  }

  function showTermosPerfil(p) {
    const overlay = el("perfilTermos");
    const body = el("perfilTermosBody");
    if (!overlay || !body) return;
    body.innerHTML = `
      <h2 style="font-family:var(--font-head);font-size:18px;margin:0 0 6px">${p.emoji} ${p.nome}</h2>
      <p style="font-size:12px;color:var(--text3);margin:0 0 14px">Como o seu capital será operado neste perfil</p>
      <div style="font-size:13px;line-height:1.6;color:var(--text2)">
        <p><b>Como o sistema investe no seu caso</b></p>
        <p>${p.comoInveste}</p>
        <p><b>Combinação técnica aplicada</b></p>
        <p style="font-family:var(--font-mono);font-size:12px;background:var(--bg3);padding:10px;border-radius:8px">${p.combinacao}</p>
        <p><b>O que isso significa na prática</b></p>
        <ul style="margin:0;padding-left:18px">
          <li>Modo do trader: <b>${labelTrader(p.trader)}</b></li>
          <li>Decisão da regra: <b>${labelModo(p.modo)}</b>${p.modo === "quantica" ? " — o circuito de 8 qubits simulado entra de verdade no cálculo do sinal a cada ciclo" : ""}</li>
          <li>Potência do risco (barra): <b>${p.barra}%</b> (define janela, limiar, stop e exposição juntos)</li>
          <li>Filtro de entrada: <b>${labelFiltro(p)}</b></li>
          <li>Stop móvel: <b>${p.stopVivo ? "ligado" : "desligado"}</b></li>
        </ul>
        <p style="margin-top:14px"><b>Avisos (educacional)</b></p>
        <ul style="margin:0;padding-left:18px">
          <li>Conteúdo educacional — não é recomendação de investimento.</li>
          <li>Cripto pode resultar em perda total do valor operado.</li>
          <li>Performance passada (backtests) não garante resultado futuro.</li>
          <li>Taxa de serviço: 2% somente sobre o lucro de operações vencedoras, com aprovação na wallet.</li>
          <li>A OctoCookie nunca pede seed phrase nem chave privada.</li>
        </ul>
      </div>
      <button type="button" id="btnAceitarPerfil" class="primary" style="width:100%;margin-top:18px">Entendi — abrir o bot com este perfil</button>
    `;
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";
    el("btnAceitarPerfil").onclick = () => {
      localStorage.setItem("termsAcceptedSwap", "1");
      applyPerfil(p);
      overlay.style.display = "none";
      document.body.style.overflow = "";
      // esconde termos genéricos antigos
      const tp = el("termsPopup");
      if (tp) tp.style.display = "none";
    };
  }

  function labelTrader(t) {
    return { original: "Trader clássico (só prévia do holograma)", combinado: "Clássico + limitador do Holograma", holograma: "Só Holograma (manda as ordens)" }[t] || t;
  }
  function labelModo(m) {
    return { tendencia: "Tendência de preço", quantica: "Circuito quântico simulado", escala: "Escala (experimental)" }[m] || m;
  }
  function labelFiltro(p) {
    if (p.filtro === "off") return "desligado";
    if (p.filtro === "estrito") return "estrito (4/4 indicadores)";
    return `votação (${p.filtroN}/4)`;
  }

  function injectUI() {
    if (el("perfilQuiz")) return;
    const style = document.createElement("style");
    style.textContent = `
      .perfil-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:9999;display:none;align-items:center;justify-content:center;padding:16px}
      .perfil-modal{background:var(--bg2,#111);border:1px solid var(--border,#333);border-radius:16px;max-width:520px;width:100%;max-height:90vh;overflow:auto;padding:22px}
      .perfil-opts{display:flex;flex-direction:column;gap:8px}
      .perfil-opt,.perfil-card{text-align:left;background:var(--bg3,rgba(255,255,255,.08));border:1px solid var(--border,#333);border-radius:12px;padding:12px 14px;color:var(--text,#eee);cursor:pointer;font-family:inherit;font-size:13px}
      .perfil-opt:hover,.perfil-card:hover{border-color:var(--blue,#60a5fa)}
      .perfil-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
      .perfil-card{display:flex;flex-direction:column;gap:4px;min-height:88px}
      .perfil-card small{color:var(--text3,#888);font-size:11px}
      body.perfil-simples .perfil-hide{display:none!important}
      #perfilBadge{display:none;align-items:center;gap:10px;padding:8px 12px;background:var(--bg3);border-radius:12px;margin-bottom:12px;font-size:13px}
      .perfil-resumo{border:1px solid rgba(96,165,250,.35)!important}
      @media(max-width:560px){.perfil-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);

    const quiz = document.createElement("div");
    quiz.id = "perfilQuiz";
    quiz.className = "perfil-overlay";
    quiz.innerHTML = `<div class="perfil-modal"><div style="font-size:12px;color:var(--text3);margin-bottom:4px">Bot Trading · perfil</div><div id="perfilQuizBody"></div></div>`;
    document.body.appendChild(quiz);

    const termos = document.createElement("div");
    termos.id = "perfilTermos";
    termos.className = "perfil-overlay";
    termos.innerHTML = `<div class="perfil-modal" id="perfilTermosBody"></div>`;
    document.body.appendChild(termos);

    const badge = document.createElement("div");
    badge.id = "perfilBadge";
    const top = document.querySelector(".oc-top-bar") || document.querySelector(".app-wrapper");
    if (top) top.insertBefore(badge, top.firstChild);
  }

  function boot() {
    injectUI();
    const saved = getSaved();
    const termsOk = localStorage.getItem("termsAcceptedSwap");

    // Intercepta o popup genérico de termos: o fluxo novo é quiz → termos do perfil
    const termsPopup = el("termsPopup");
    if (termsPopup) termsPopup.style.display = "none";

    if (!saved || !termsOk) {
      setTimeout(showQuiz, 350);
      return;
    }
    const p = findPerfil(saved.id);
    // espera ENG existir (script principal)
    const tryApply = () => {
      if (!window.__OCTO_ENG) {
        setTimeout(tryApply, 200);
        return;
      }
      applyPerfil(p);
    };
    tryApply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => setTimeout(boot, 100));
  } else {
    setTimeout(boot, 100);
  }

  window.OctoPerfis = { PERFIS, applyPerfil, showQuiz, findPerfil };
})();
