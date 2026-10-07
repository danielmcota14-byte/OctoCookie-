import fs from 'fs'; import vm from 'vm'; import path from 'path'; import { fileURLToPath } from 'url';
const aqui = path.dirname(fileURLToPath(import.meta.url));
const load = (file) => {
  const html = fs.readFileSync(file, 'utf8');
  const a = html.indexOf('const Q=(function(){'), fim = "if (typeof window !== 'undefined') window.HG_CORE = HG_CORE;";
  const b = html.indexOf(fim) + fim.length;
  const ctx = { window: {}, Math, console }; vm.createContext(ctx);
  vm.runInContext(html.slice(a, b) + '\nglobalThis.K = HG_CORE;', ctx);
  // funções antigas (globais da página) para comparar
  const i0 = html.indexOf('function calculateRSI'), i1 = html.indexOf('// =============================================\n//  21 SECURITY CHECKS');
  const ctx2 = { Math }; vm.createContext(ctx2); vm.runInContext(html.slice(i0, i1) + '\nglobalThis.O={calculateRSI,calculateSMA,calculateMACD,calculateBollingerBands};', ctx2);
  return { K: ctx.K, O: ctx2.O };
};
const NEW = load(path.join(aqui, '../../public/octocookie-app/octocookie.html'));
// OLD = versão anterior do decidir (sem filtro). Defina OCTO_ANTIGO=<caminho do octocookie.html anterior> para comparar; sem isso, só os testes 1 e 3 rodam.
const OLD = process.env.OCTO_ANTIGO ? load(process.env.OCTO_ANTIGO) : null;
let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
let bad = 0, n = 0; const near = (x, y) => Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(y));
// 1) indicadores em série == funções antigas, prefixo por prefixo
for (let s = 0; s < 4; s++) {
  let c = [2000]; for (let i = 1; i < 300; i++) c.push(c[i - 1] * Math.exp((rnd() - 0.48) * 0.03));
  const S = NEW.K.indSerie(c);
  for (let i = 0; i < c.length; i++) {
    const pre = c.slice(0, i + 1), O = NEW.O;
    const rsi = O.calculateRSI(pre, 14), sma = O.calculateSMA(pre, 20), mac = O.calculateMACD(pre), bb = O.calculateBollingerBands(pre, 20);
    const chk = (nome, x, y) => { n++; if (!near(x, y)) { bad++; if (bad < 10) console.log('DIVERGE', nome, i, x, y); } };
    chk('rsi', S.rsi[i], rsi); chk('hist', S.hist[i], mac.histogram);
    n++; if ((S.sma[i] === null) !== (sma === null)) { bad++; console.log('sma null', i); } else if (sma !== null) { chk('sma', S.sma[i], sma); chk('bbL', S.bbL[i], bb.lower); chk('bbU', S.bbU[i], bb.upper); }
  }
}
console.log(`indicadores em série vs funções antigas: ${n} comparações, ${bad} divergências`);
// 2) decidir com filtro liberado/ausente == decidir antigo (Python), em cenários variados
let n2 = 0, bad2 = 0;
for (let s = 0; s < 6; s++) {
  let c = [2000]; for (let i = 1; i < 400; i++) c.push(c[i - 1] * Math.exp((rnd() - 0.47) * 0.04));
  for (const modo of ['quantica', 'tendencia', 'escala']) for (const stopPct of [0, 0.05]) {
    const C = { janela: 30, lim: 0.03, modo, lq: 0.3, stopPct, stopVivo: false };
    let sN = { regraPos: 0, pos: 0, stopBloq: false, topo: null }, sO = { ...sN };
    for (let k = 0; k < 40; k++) {
      const p = c[c.length - 1] * Math.exp((rnd() - 0.5) * 0.06), a = { direcao: rnd() * 2 - 1, caos: rnd() };
      if (!OLD) break;
      const dN = NEW.K.decidir(C, c, p, sN, a, true), dO = OLD.K.decidir(C, c, p, sO, a), d5 = NEW.K.decidir(C, c, p, sN, a);
      n2++; if (JSON.stringify(dN.st) !== JSON.stringify(dO.st) || dN.s !== dO.s || dN.sn !== dO.sn || dN.expo !== dO.expo || JSON.stringify(d5.st) !== JSON.stringify(dO.st) || dN.bloqEntrada) { bad2++; if (bad2 < 5) console.log('DIVERGE decidir', modo, stopPct, k); }
      sN = dN.st; sO = dO.st;
    }
  }
}
console.log(`decidir (filtro liberado) vs antigo: ${n2} passos, ${bad2} divergências`);
// 3) com filtro bloqueando: nunca entra, mas SAI normalmente
const C = { janela: 30, lim: 0.03, modo: 'tendencia', lq: 0.3, stopPct: 0, stopVivo: false }; let c = [2000]; for (let i = 1; i < 100; i++) c.push(c[i - 1] * 1.004);
let st = { regraPos: 0, pos: 0, stopBloq: false, topo: null }; const a = { direcao: 0, caos: 0 };
let d = NEW.K.decidir(C, c, c[99] * 1.01, st, a, false);
console.log('bloqueado: regra=' + d.st.regraPos + ' pos=' + d.st.pos + ' bloqEntrada=' + d.bloqEntrada, d.st.regraPos === 1 && d.st.pos === 0 && d.bloqEntrada ? 'OK' : 'FALHA');
d = NEW.K.decidir(C, c, c[99] * 1.01, d.st, a, true);
console.log('liberou:   regra=' + d.st.regraPos + ' pos=' + d.st.pos + ' bloqEntrada=' + d.bloqEntrada, d.st.pos === 1 && !d.bloqEntrada ? 'OK' : 'FALHA');
d = NEW.K.decidir(C, c, c[99] * 0.7, d.st, a, false);
console.log('saída com filtro bloqueando: regra=' + d.st.regraPos + ' pos=' + d.st.pos, d.st.pos === 0 && !d.bloqEntrada ? 'OK' : 'FALHA');
process.exit(bad || bad2 ? 1 : 0);
