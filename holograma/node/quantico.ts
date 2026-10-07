// Circuito de 8 qubits simulado em Node (sem Qiskit). Mesmo circuito do Python:
// RY codifica a demanda (ETH, qubits 0-3), CNOT+X faz o complemento (USDC, qubits 4-7), CZ encadeia 0-1-2-3.
// Todas as portas são reais, então o vetor de estado é real.
export const ARESTAS: [number, number][] = [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [6, 7], [0, 4], [1, 5], [2, 6], [3, 7]];
const N = 8;

/** Autovalores/autovetores de matriz simétrica real (Jacobi cíclico). Autovetor i = coluna i de V. */
export function eigSym(M: number[][]) {
  const n = M.length;
  const A = M.map((r) => r.slice());
  const V: number[][] = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sw = 0; sw < 80; sw++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
    if (off < 1e-24) break;
    for (let p = 0; p < n - 1; p++) for (let q = p + 1; q < n; q++) {
      if (Math.abs(A[p][q]) < 1e-300) continue;
      const th = (A[q][q] - A[p][p]) / (2 * A[p][q]);
      const t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1));
      const c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const a = A[k][p], b = A[k][q]; A[k][p] = c * a - s * b; A[k][q] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = A[p][k], b = A[q][k]; A[p][k] = c * a - s * b; A[q][k] = s * a + c * b; }
      for (let k = 0; k < n; k++) { const a = V[k][p], b = V[k][q]; V[k][p] = c * a - s * b; V[k][q] = s * a + c * b; }
    }
  }
  return { w: A.map((r, i) => r[i]), V };
}

function estado(f: number[]): Float64Array {
  const psi = new Float64Array(1 << N);
  psi[0] = 1;
  const bit = (i: number, q: number) => (i >> q) & 1;
  const ry = (th: number, q: number) => {
    const c = Math.cos(th / 2), s = Math.sin(th / 2);
    for (let i = 0; i < psi.length; i++) if (!bit(i, q)) { const j = i | (1 << q), a = psi[i], b = psi[j]; psi[i] = c * a - s * b; psi[j] = s * a + c * b; }
  };
  const cx = (c: number, t: number) => { for (let i = 0; i < psi.length; i++) if (bit(i, c) && !bit(i, t)) { const j = i | (1 << t); [psi[i], psi[j]] = [psi[j], psi[i]]; } };
  const x = (q: number) => { for (let i = 0; i < psi.length; i++) if (!bit(i, q)) { const j = i | (1 << q); [psi[i], psi[j]] = [psi[j], psi[i]]; } };
  const cz = (a: number, b: number) => { for (let i = 0; i < psi.length; i++) if (bit(i, a) && bit(i, b)) psi[i] = -psi[i]; };
  f.forEach((v, i) => { ry((Math.PI * (1 + v)) / 2, i); cx(i, i + 4); x(i + 4); });
  for (let i = 0; i < 3; i++) cz(i, i + 1);
  return psi;
}

function rho(psi: Float64Array, keep: number[]): number[][] {
  const rest = [...Array(N).keys()].filter((q) => !keep.includes(q));
  const dk = 1 << keep.length, de = 1 << rest.length;
  const R = Array.from({ length: dk }, () => new Array(dk).fill(0));
  for (let e = 0; e < de; e++) {
    let base = 0;
    rest.forEach((q, b) => { if ((e >> b) & 1) base |= 1 << q; });
    const v = new Array(dk).fill(0);
    for (let k = 0; k < dk; k++) { let idx = base; keep.forEach((q, b) => { if ((k >> b) & 1) idx |= 1 << q; }); v[k] = psi[idx]; }
    for (let a = 0; a < dk; a++) for (let b = 0; b < dk; b++) R[a][b] += v[a] * v[b];
  }
  return R;
}
const ent = (R: number[][]) => -eigSym(R).w.reduce((s, l) => (l > 1e-12 ? s + l * Math.log2(l) : s), 0);

/** 4 features direcionais em [-1,1] (tendência longa, base, curta e momentum), só com o passado. */
export function features(c: number[], janela: number, limPct: number): number[] {
  const lim = limPct / 100, i = c.length - 1;
  return [janela * 2, janela, Math.max(2, Math.floor(janela / 3)), 3].map((h) =>
    Math.tanh(Math.log(c[i] / c[Math.max(0, i - h)]) / (lim * Math.sqrt(h / janela))));
}

export function analisarQuantico(f: number[]) {
  const psi = estado(f), todos = [...Array(N).keys()];
  const p1 = todos.map((i) => psi.reduce((s, a, k) => (((k >> i) & 1) ? s + a * a : s), 0));
  const S = todos.map((i) => ent(rho(psi, [i])));
  const mi = todos.map(() => new Array(N).fill(0));
  for (let a = 0; a < N; a++) for (let b = a + 1; b < N; b++) mi[a][b] = mi[b][a] = Math.max(0, (S[a] + S[b] - ent(rho(psi, [a, b]))) / 2);
  const mx = Math.max(...mi.flat(), 1e-9);
  const D2 = mi.map((r, a) => r.map((m, b) => (a === b ? 0 : (1 - m / mx) ** 2)));
  const rm = D2.map((r) => r.reduce((s, x) => s + x, 0) / N), tm = rm.reduce((s, x) => s + x, 0) / N;
  const B = D2.map((r, a) => r.map((x, b) => -0.5 * (x - rm[a] - rm[b] + tm)));
  const { w, V } = eigSym(B);
  const ord = w.map((x, i) => [x, i]).sort((a, b) => b[0] - a[0]).slice(0, 3).map((x) => x[1]);
  const xyz = todos.map((r) => ord.map((k) => V[r][k] * Math.sqrt(Math.max(w[k], 0))));
  const mz = Math.max(...xyz.map((p) => Math.abs(p[2])), 1e-9);
  xyz.forEach((p) => { p[2] /= mz; });
  const sGrupo = ent(rho(psi, [0, 1, 2, 3]));
  const hBorn = -Array.from(psi).reduce((s, a) => { const p = Math.min(Math.max(a * a, 1e-12), 1); return s + p * Math.log2(p); }, 0);
  return {
    qubits: todos.map((i) => ({ nome: i < 4 ? `E${i}` : `U${i - 4}`, grupo: i < 4 ? "ETH" : "USDC", p1: p1[i], s: S[i] })),
    arestas: ARESTAS, mi, coords: xyz, sGrupo, caos: sGrupo / 4, hBorn,
    direcao: [0, 1, 2, 3].reduce((s, i) => s + (2 * p1[i] - 1), 0) / 4,
    circuito: { qubits: 8, cx: 4, profundidade: 5, swaps: 0 },
  };
}
