// Catálogo de funcionalidades. Os padrões abaixo são só ponto de partida: o admin edita preços/textos em /adm/token
// (as alterações ficam no armazenamento do servidor e o frontend apenas lê /token/catalog).
export const DEFAULT_CATALOG = [
  { id: 'indicadores-avancados', name: 'Indicadores avançados', description: 'Painel com indicadores e ferramentas de análise avançadas.', requirements: ['Conta OctoCookie', 'Carteira vinculada'], priceTokens: '10', durationDays: 30, scope: 'simulation', active: true },
  { id: 'estrategias-lab', name: 'Laboratório de estratégias', description: 'Testes e experimentação de estratégias financeiras em ambiente simulado.', requirements: ['Conta OctoCookie', 'Carteira vinculada'], priceTokens: '15', durationDays: 30, scope: 'simulation', active: true },
  { id: 'bot-elegivel', name: 'Execução de bots elegíveis', description: 'Libera o acesso à execução de bots e estratégias elegíveis. O pagamento NÃO autoriza operações reais por si só: o Bot 24/7 continua exigindo a carteira dedicada e o consentimento do usuário.', requirements: ['Conta OctoCookie', 'Carteira vinculada', 'Bot 24/7 configurado pelo usuário'], priceTokens: '25', durationDays: 30, scope: 'live', active: true },
  { id: 'desafios', name: 'Desafios e competições', description: 'Inscrição em desafios e competições da comunidade.', requirements: ['Conta OctoCookie'], priceTokens: '5', durationDays: 30, scope: 'simulation', active: true },
  { id: 'lab-avancado', name: 'Recursos avançados do laboratório', description: 'Acesso permanente a recursos avançados e funcionalidades especiais para usuários ativos.', requirements: ['Conta OctoCookie', 'Carteira vinculada'], priceTokens: '50', durationDays: null, scope: 'simulation', active: true },
];

const ID_RE = /^[a-z0-9][a-z0-9-]{1,39}$/;
const PRICE_RE = /^\d{1,12}(\.\d{1,18})?$/;
const str = (v, max) => String(v ?? '').trim().slice(0, max);

/** Valida/normaliza um item de catálogo (parcial se `base` for passado). Lança Error com mensagem em português. */
export function normalizeFeature(id, input, base = null) {
  if (!ID_RE.test(id)) throw new Error('id inválido (use a-z, 0-9 e hífen, 2–40 caracteres).');
  const f = { ...(base || { id, name: '', description: '', requirements: [], priceTokens: '', durationDays: null, scope: 'simulation', active: false }) };
  const i = input || {};
  if (i.name !== undefined) f.name = str(i.name, 80);
  if (i.description !== undefined) f.description = str(i.description, 500);
  if (i.requirements !== undefined) {
    if (!Array.isArray(i.requirements)) throw new Error('requirements deve ser uma lista.');
    f.requirements = i.requirements.slice(0, 10).map((r) => str(r, 120)).filter(Boolean);
  }
  if (i.priceTokens !== undefined) {
    const p = String(i.priceTokens).trim();
    if (!PRICE_RE.test(p) || !(Number(p) > 0)) throw new Error('priceTokens deve ser um número decimal positivo (ex.: "12.5").');
    f.priceTokens = p;
  }
  if (i.durationDays !== undefined) {
    if (i.durationDays === null) f.durationDays = null;
    else if (Number.isInteger(i.durationDays) && i.durationDays >= 1 && i.durationDays <= 3650) f.durationDays = i.durationDays;
    else throw new Error('durationDays deve ser inteiro entre 1 e 3650, ou null (permanente).');
  }
  if (i.scope !== undefined) { if (!['simulation', 'live'].includes(i.scope)) throw new Error('scope deve ser "simulation" ou "live".'); f.scope = i.scope; }
  if (i.active !== undefined) f.active = i.active === true;
  if (!f.name) throw new Error('name é obrigatório.');
  if (!f.priceTokens) throw new Error('priceTokens é obrigatório.');
  return f;
}
