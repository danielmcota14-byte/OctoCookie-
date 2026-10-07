// Compara o motor que está DENTRO do octocookie.html com o Motor original do Python, passo a passo.
// 1) python gerar_esperado.py <pasta_do_holograma_quantico>   (gera expected.json)
// 2) node rodar_paridade.mjs
import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const html = fs.readFileSync(path.join(aqui, '../../public/octocookie-app/octocookie.html'), 'utf8');
const a = html.indexOf('const Q=(function(){'), fim = "if (typeof window !== 'undefined') window.HG_CORE = HG_CORE;";
const b = html.indexOf(fim) + fim.length;
const ctx = { window: {}, Math, console }; vm.createContext(ctx);
vm.runInContext(html.slice(a, b) + '\nglobalThis.K = HG_CORE;', ctx);
const K = ctx.K, E = JSON.parse(fs.readFileSync(path.join(aqui, 'expected.json'), 'utf8')), custo = 0.001;
let bad = 0, n = 0;
const near = (x, y, t = 1e-6) => (x === null || y === null ? x === y : Math.abs(x - y) <= t * Math.max(1, Math.abs(y)));
const chk = (nome, x, y, t) => { n++; if (!near(x, y, t)) { bad++; if (bad < 15) console.log('DIVERGE', nome, x, y); } };
for (const sc of E.cenarios) { const closes = sc.closes, live = sc.live;
  for (const cs of sc.cases) {
    const tag = `s${sc.seed}/${cs.modo}/b${cs.barra}/${cs.stopvivo ? 'vivo' : 'fech'}`, pr = K.L.paramsBarra(cs.barra);
    chk(tag + ' janela', pr.janela, cs.init.janela); chk(tag + ' lim', pr.lim / 100, cs.init.lim); chk(tag + ' stop', pr.stop / 100, cs.init.stop); chk(tag + ' risco', K.arPar(pr.expo), cs.init.risco);
    const janela = pr.janela, lim = pr.lim / 100, bt = K.backtest(closes, K.sinalTendencia(closes, janela), lim, custo);
    for (const [k, kp] of [['regra', 'regra'], ['bh', 'bh'], ['trocas', 'trocas'], ['n', 'n'], ['posFinal', 'pos_final'], ['probN', 'prob_n'], ['prob', 'prob']]) chk(tag + ' bt_t.' + k, bt[k], cs.init.bt_t[kp]);
    if (cs.barra === 100) { const bq = K.backtest(closes, K.sinalQuantico(closes, 30, 0.03), 0.3, custo); for (const [k, kp] of [['regra', 'regra'], ['trocas', 'trocas'], ['posFinal', 'pos_final']]) chk(tag + ' bt_q.' + k, bq[k], cs.init.bt_q[kp]); }
    const C = { janela, lim, modo: cs.modo, lq: 0.3, stopPct: pr.stop / 100, stopVivo: cs.stopvivo };
    let s = { regraPos: cs.init.reg, pos: cs.init.pos, stopBloq: false, topo: null }; const w = { usdc: 1000, eth: 0, entrada: null };
    let reb = true, pronto = false, expoAp = 1; const risco = K.arPar(pr.expo);
    cs.steps.forEach((e, i) => {
      const p = live[i], an = K.Q.analisarQuantico(K.Q.features(closes.concat([p]), janela, lim * 100)), d = K.decidir(C, closes, p, s, an);
      const flip = pronto && d.st.pos !== s.pos; s = d.st;
      if (flip || reb || (cs.modo === 'escala' && pronto && s.pos === 1 && Math.abs(d.expo - expoAp) > 0.10)) { expoAp = d.expo; K.rebalVirtual(w, p, s.pos, risco, d.expo, custo); reb = false; }
      pronto = true;
      chk(tag + ` #${i} pos`, s.pos, e.pos); chk(tag + ` #${i} regra`, s.regraPos, e.regra); chk(tag + ` #${i} stop`, s.stopBloq ? 1 : 0, e.stop ? 1 : 0);
      chk(tag + ` #${i} usdc`, w.usdc, e.usdc); chk(tag + ` #${i} eth`, w.eth, e.eth); chk(tag + ` #${i} sn`, d.sn, e.sn); chk(tag + ` #${i} expo`, d.expo, e.expo);
    });
    const pj = K.projFechadas(closes, cs.barra, custo);
    chk(tag + ' proj.ret', pj.ret, cs.proj.ret); chk(tag + ' proj.dd', pj.dd, cs.proj.dd); chk(tag + ' proj.vant', pj.vant, cs.proj.vant); chk(tag + ' proj.perda', pj.perda30, cs.proj.perda);
    chk(tag + ' barra_calc', K.L.barraAuto(K.curvaFechadas(closes, custo), 25), cs.barra_calc);
  } }
console.log(`${n} comparações, ${bad} divergências`); process.exit(bad ? 1 : 0);
