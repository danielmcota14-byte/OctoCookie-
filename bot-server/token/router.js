// Rotas HTTP do token. Públicas/usuário em /token/*, administrativas em /adm/token/* (herdam o login de admin do server.js).
import express from 'express';
import { ethers } from 'ethers';
import { normalizeFeature } from './catalog.js';
import { newId } from './store.js';

const TX_RE = /^0x[0-9a-fA-F]{64}$/;
export const WALLET_MSG_HEAD = 'OctoCookie — vincular carteira';
const nowIso = (n) => new Date(n).toISOString();

export function createTokenRouters({ cfg, chain, store, verifyIdToken, now = () => Date.now() }) {
  const pub = express.Router(), adm = express.Router();
  const hits = new Map();
  const limit = (max) => (req, res, next) => { const k = req.ip + req.path.split('/')[1], t = now(), a = (hits.get(k) || []).filter((x) => t - x < 60_000); a.push(t); hits.set(k, a); if (a.length > max) return res.status(429).json({ erro: 'Muitas requisições. Aguarde um minuto.' }); next(); };
  const wrap = (fn) => async (req, res, next) => { try { await fn(req, res, next); } catch (e) { res.status(e.status || 400).json({ erro: e.message || 'erro' }); } };
  const fail = (msg, status = 400) => Object.assign(new Error(msg), { status });
  pub.use((_q, res, next) => { res.set('Cache-Control', 'no-store'); next(); });

  const requireUser = wrap(async (req, _res, next) => {
    const h = req.headers.authorization || '', tok = h.startsWith('Bearer ') ? h.slice(7) : '';
    if (!verifyIdToken) throw fail('Login indisponível neste servidor.', 503);
    if (tok.split('.').length !== 3) throw fail('Faça login na sua conta OctoCookie.', 401);
    try { const u = await verifyIdToken(tok); req.user = { uid: u.uid, email: u.email }; } catch (e) { throw fail(e.message || 'Token inválido.', e.status || 401); }
    next();
  });
  const guard = (fn) => [requireUser, wrap(fn)]; // requireUser chama next() dentro do wrap: cobre erros assíncronos
  const decimals = async () => { const i = await chain.inspect(); if (!i.ready) throw fail('Token não verificado na rede: ' + i.issues.join(' '), 503); return i.info.decimals; };
  const toUnits = (tokens, dec) => { try { return ethers.parseUnits(String(tokens), dec); } catch { throw fail(`Valor com mais de ${dec} casas decimais.`); } };
  const fmt = (units, dec) => ethers.formatUnits(BigInt(units), dec);

  const publicFeature = (f) => ({ id: f.id, name: f.name, description: f.description, requirements: f.requirements, priceTokens: f.priceTokens, durationDays: f.durationDays, scope: f.scope });

  // ---------- públicas ----------
  pub.get('/config', wrap(async (_q, res) => {
    const i = await chain.inspect();
    res.json({ ready: i.ready, issues: i.ready ? [] : i.issues, chainId: cfg.chainId, contract: cfg.contract, treasury: i.info?.treasury ?? cfg.treasury, treasuryIsOwner: i.info?.treasuryIsOwner ?? false, minConfirmations: cfg.minConfirmations, explorerUrl: cfg.explorerUrl || null, token: i.info ? { name: i.info.name, symbol: i.info.symbol, decimals: i.info.decimals } : null });
  }));
  pub.get('/info', wrap(async (_q, res) => { const i = await chain.inspect(); if (!i.ready) throw fail('Token não verificado na rede: ' + i.issues.join(' '), 503); res.json(i.info); }));
  pub.get('/catalog', (_q, res) => res.json({ features: Object.values(store.catalog()).filter((f) => f.active).map(publicFeature) }));

  pub.get('/transparency', wrap(async (_q, res) => {
    const i = await chain.inspect(), dec = i.ready ? i.info.decimals : null, cap = i.ready ? await chain.mintCapability() : { can: false };
    const pagos = store.allPurchases().filter((p) => p.status === 'confirmed'), mint = store.rewards((r) => r.status === 'minted');
    const soma = (arr, k) => (dec == null ? null : fmt(arr.reduce((s, x) => s + BigInt(x[k]), 0n), dec));
    res.json({
      contrato: { endereco: cfg.contract, chainId: cfg.chainId, verificado: i.ready, avisos: i.ready ? [] : i.issues, supply: i.info?.totalSupply ?? null, bytecodeIdentico: i.info?.bytecodeIdentical ?? null, owner: i.info?.owner ?? null, decimals: dec },
      pagamentos: { metodo: 'transfer() direto do usuário para a tesouraria', tesouraria: i.info?.treasury ?? cfg.treasury, tesourariaEhOwner: i.info?.treasuryIsOwner ?? false, confirmacoesMinimas: cfg.minConfirmations, totalRecebido: soma(pagos, 'amountUnits'), compras: pagos.length },
      emissao: { politica: 'Somente o owner do contrato pode emitir (mint), sem teto de oferta definido no contrato. Recompensas passam por aprovação administrativa; nada é emitido automaticamente.', emissaoPeloServidor: cap.can, totalEmitidoEmRecompensas: soma(mint, 'amountUnits'), recompensas: mint.length },
      queima: { politica: 'Não há queima automática. burn() só será usados após uma regra econômica publicada nesta página.', totalQueimado: '0' },
      recompensas: { regras: 'Contribuições verificadas, desafios e atividades elegíveis; cada recompensa registra motivo, valor, destinatário e referência única.' },
      administracao: { observacao: 'O contrato não tem função de troca de dono (owner fixo). O servidor nunca chama withdrawETH(), recoverTokens(), setPrice() nem buy().' },
    });
  }));

  // ---------- usuário (login Firebase) ----------
  pub.post('/wallet/nonce', limit(20), ...guard(async (req, res) => {
    if (!ethers.isAddress(req.body?.address)) throw fail('Endereço inválido.');
    const address = ethers.getAddress(req.body.address), nonce = ethers.hexlify(ethers.randomBytes(16)), t = now();
    const message = [WALLET_MSG_HEAD, 'Usuário: ' + req.user.uid, 'Carteira: ' + address, 'Nonce: ' + nonce, 'Emitido em: ' + nowIso(t)].join('\n');
    store.setNonce(req.user.uid, { message, address, exp: t + 10 * 60_000 });
    res.json({ message });
  }));
  pub.post('/wallet/link', limit(20), ...guard(async (req, res) => {
    const rec = store.takeNonce(req.user.uid); // uso único
    if (!rec || rec.exp < now()) throw fail('Pedido de assinatura expirado. Tente de novo.');
    const { message, signature } = req.body || {};
    if (message !== rec.message) throw fail('Mensagem diferente da emitida pelo servidor.');
    let quem; try { quem = ethers.verifyMessage(message, String(signature)); } catch { throw fail('Assinatura inválida.'); }
    if (quem !== rec.address) throw fail('A assinatura não é desta carteira.');
    store.linkWallet(req.user.uid, rec.address, req.user.email);
    res.json({ ok: true, address: rec.address });
  }));

  pub.get('/me', limit(60), ...guard(async (req, res) => {
    const uid = req.user.uid, w = store.wallet(uid), i = await chain.inspect(), dec = i.info?.decimals ?? null;
    let balance = null; if (w && i.ready) { try { balance = await chain.balanceOf(w.address); } catch { /* RPC fora: saldo indisponível */ } }
    const feats = store.catalog(), ent = store.entitlements(uid);
    res.json({
      wallet: w, balance, balanceFormatted: balance != null && dec != null ? fmt(balance, dec) : null,
      entitlements: ent, unlocked: Object.fromEntries(ent.filter((e) => e.active).map((e) => [e.featureId, true])),
      orders: store.ordersOf(uid).map((o) => ({ id: o.id, featureId: o.featureId, featureName: feats[o.featureId]?.name || o.featureId, amountTokens: o.amountTokens, status: o.status, txHash: o.txHash || null, createdAt: o.createdAt, expiresAt: o.expiresAt, paidAt: o.paidAt || null })),
      rewards: store.rewards((r) => r.uid === uid || (w && r.recipient.toLowerCase() === w.address.toLowerCase())).map((r) => ({ id: r.id, kind: r.kind, reason: r.reason, amountTokens: r.amountTokens, recipient: r.recipient, status: r.status, txHash: r.txHash || null, createdAt: r.createdAt })),
    });
  }));
  pub.get('/access/:featureId', limit(120), ...guard(async (req, res) => { res.json({ unlocked: store.entitlements(req.user.uid).some((e) => e.featureId === req.params.featureId && e.active) }); }));

  pub.get('/transfers', limit(30), ...guard(async (req, res) => {
    const w = store.wallet(req.user.uid); if (!w) throw fail('Vincule uma carteira primeiro.');
    if (!(await chain.ready())) throw fail('Token não verificado na rede.', 503);
    res.json(await chain.transfers(w.address));
  }));

  pub.post('/orders', limit(30), ...guard(async (req, res) => {
    const uid = req.user.uid, w = store.wallet(uid); if (!w) throw fail('Vincule uma carteira antes de comprar.');
    const f = store.feature(String(req.body?.featureId || '')); if (!f || !f.active) throw fail('Funcionalidade indisponível.', 404);
    const dec = await decimals(), units = toUnits(f.priceTokens, dec).toString(), treasury = (await chain.inspect()).info.treasury;
    const aberto = store.openOrder(uid, f.id, w.address);
    if (aberto && aberto.amountUnits === units && aberto.treasury === treasury) return res.json({ order: aberto, reused: true });
    if (aberto) { aberto.status = 'expired'; store.addOrder(aberto); } // preço/tesouraria mudou: o pedido antigo não vale mais
    const t = now();
    const order = store.addOrder({ id: newId('ord'), uid, featureId: f.id, wallet: w.address, treasury, contract: cfg.contract, chainId: cfg.chainId, decimals: dec, amountUnits: units, amountTokens: fmt(units, dec), status: 'awaiting_payment', createdAt: t, expiresAt: t + cfg.orderTtlMs });
    res.json({ order, reused: false });
  }));

  pub.post('/orders/:id/submit', limit(30), ...guard(async (req, res) => {
    const order = store.order(req.params.id); if (!order || order.uid !== req.user.uid) throw fail('Pedido não encontrado.', 404);
    const hash = String(req.body?.txHash || ''); if (!TX_RE.test(hash)) throw fail('Hash de transação inválido.');
    if (order.status === 'paid') return res.json({ status: order.txHash === hash.toLowerCase() ? 'confirmed' : 'rejected', motivo: order.txHash === hash.toLowerCase() ? undefined : 'Este pedido já foi pago com outra transação.' });
    if (order.status !== 'awaiting_payment') throw fail('Este pedido não aceita mais pagamento (status: ' + order.status + ').', 409);
    if (!store.reserveTx(hash, order.id)) { // reserva síncrona: impede verificação/uso duplicado da mesma tx
      const p = store.purchase(hash);
      if (p?.status === 'confirmed' && p.orderId === order.id) return res.json({ status: 'confirmed' });
      throw fail(p?.status === 'verifying' ? 'Esta transação já está em verificação.' : 'Esta transação já foi utilizada em outro pedido.', 409);
    }
    let v;
    try { v = await chain.verifyPayment(hash, order); } catch (e) { store.releaseTx(hash); throw fail('Falha ao consultar a blockchain: ' + (e.shortMessage || e.message) + '. Tente novamente.', 502); }
    if (v.status !== 'confirmed') { store.releaseTx(hash); return res.status(v.status === 'pending' ? 202 : 422).json(v); }
    store.confirmPurchase(order, store.feature(order.featureId) || { durationDays: null }, hash, v.blockMs);
    res.json({ status: 'confirmed', confirmations: v.confirmations });
  }));

  // ---------- admin ----------
  adm.get('/status', wrap(async (_q, res) => { const i = await chain.inspect(true); res.json({ ready: i.ready, issues: i.issues, info: i.info, caps: i.caps, mint: await chain.mintCapability(), config: { chainId: cfg.chainId, contract: cfg.contract, treasury: i.info?.treasury ?? cfg.treasury, rpcPadrao: cfg.rpcIsDefault, treasuryIsOwner: i.info?.treasuryIsOwner ?? false, minConfirmations: cfg.minConfirmations } }); }));
  adm.get('/catalog', (_q, res) => res.json({ features: Object.values(store.catalog()) }));
  adm.put('/catalog/:id', wrap(async (req, res) => { const id = req.params.id, f = normalizeFeature(id, req.body, store.feature(id)); store.setFeature(f, req.admin?.email || req.admin?.uid); res.json({ ok: true, feature: f }); }));
  adm.get('/purchases', (_q, res) => res.json({ purchases: store.allPurchases() }));
  adm.get('/rewards', (_q, res) => res.json({ rewards: store.rewards() }));
  adm.get('/users', (_q, res) => res.json({ users: store.linkedUsers() })); // contas com carteira vinculada

  adm.post('/rewards', wrap(async (req, res) => {
    const dec = await decimals(), b = req.body || {};
    let recipient = b.recipient, uid = b.uid ? String(b.uid) : null;
    if (uid) { // destinatário = carteira vinculada à conta (o admin não digita endereço)
      const w = store.wallet(uid); if (!w) throw fail('Esta conta ainda não vinculou uma carteira.');
      if (recipient && ethers.isAddress(recipient) && ethers.getAddress(recipient) !== w.address) throw fail('A carteira informada não é a vinculada a esta conta.');
      recipient = w.address;
    }
    if (!ethers.isAddress(recipient)) throw fail('recipient inválido.');
    if (!['contribuicao', 'desafio', 'atividade'].includes(b.kind)) throw fail('kind deve ser contribuicao, desafio ou atividade.');
    const reason = String(b.reason || '').trim(), ref = String(b.ref || '').trim();
    if (reason.length < 3 || reason.length > 300) throw fail('reason deve ter 3–300 caracteres.');
    if (!/^[\w:.-]{3,100}$/.test(ref)) throw fail('ref (identificador único) inválido.');
    const units = toUnits(b.amountTokens, dec); if (units <= 0n) throw fail('amountTokens deve ser positivo.');
    const r = store.addReward({ id: newId('rew'), kind: b.kind, reason, ref, uid, recipient: ethers.getAddress(recipient), amountUnits: units.toString(), amountTokens: fmt(units, dec), status: 'pending', createdAt: now(), createdBy: req.admin?.email || req.admin?.uid });
    res.json({ ok: true, reward: r });
  }));
  const reward = (req) => { const r = store.reward(req.params.id); if (!r) throw fail('Recompensa não encontrada.', 404); return r; };
  adm.post('/rewards/:id/approve', wrap(async (req, res) => { const r = reward(req); if (r.status !== 'pending') throw fail('Só recompensas pendentes podem ser aprovadas.', 409); r.status = 'approved'; r.approvedBy = req.admin?.email || req.admin?.uid; store.saveReward(r, 'recompensa_aprovada', r.approvedBy); res.json({ ok: true, reward: r }); }));
  adm.post('/rewards/:id/reject', wrap(async (req, res) => { const r = reward(req); if (!['pending', 'approved'].includes(r.status)) throw fail('Esta recompensa não pode ser rejeitada.', 409); r.status = 'rejected'; store.saveReward(r, 'recompensa_rejeitada', req.admin?.email || req.admin?.uid); res.json({ ok: true, reward: r }); }));
  // ---- emissão com a carteira do owner (navegador do admin): reservar → assinar → o servidor confere na blockchain ----
  adm.post('/rewards/:id/claim', wrap(async (req, res) => { // trava contra dois admins/cliques emitirem a mesma recompensa
    const r = reward(req); if (r.status !== 'approved') throw fail('Só recompensas aprovadas podem ser emitidas (status: ' + r.status + ').', 409);
    r.status = 'minting'; r.mintVia = 'wallet'; r.txHash = null; r.error = null; r.claimedBy = req.admin?.email || req.admin?.uid;
    store.saveReward(r, 'recompensa_reservada', r.claimedBy); res.json({ ok: true, reward: r });
  }));
  adm.post('/rewards/:id/release', wrap(async (req, res) => { // desistiu/cancelou na carteira: volta para aprovada (só se não há tx enviada)
    const r = reward(req); if (r.status !== 'minting' || r.mintVia !== 'wallet') throw fail('Esta recompensa não está reservada para emissão pela carteira.', 409);
    if (r.txHash) throw fail('Já há uma transação registrada (' + r.txHash + '). Use "Verificar emissão".', 409);
    r.status = 'approved'; r.mintVia = null; store.saveReward(r, 'recompensa_liberada', req.admin?.email || req.admin?.uid); res.json({ ok: true, reward: r });
  }));
  adm.post('/rewards/:id/manual', wrap(async (req, res) => { // registra o hash do mint feito pelo owner; SÓ vira "emitida" depois de conferido na blockchain
    const r = reward(req), by = req.admin?.email || req.admin?.uid, hash = String(req.body?.txHash || '').toLowerCase();
    if (!TX_RE.test(hash)) throw fail('txHash inválido.');
    if (r.status === 'minted') return res.json({ ok: true, reward: r, status: 'confirmed' });
    const via = r.status === 'approved' || (r.status === 'minting' && r.mintVia === 'wallet');
    if (!via) throw fail('Aprove a recompensa antes (status: ' + r.status + ').', 409);
    if (r.txHash && r.txHash !== hash) throw fail('Esta recompensa já tem outra transação registrada (' + r.txHash + ').', 409);
    if (store.rewardByTx(hash, r.id)) throw fail('Esta transação já foi usada em outra recompensa.', 409);
    let v; try { v = await chain.verifyMint(hash, r); } catch (e) { throw fail('Falha ao consultar a blockchain: ' + (e.shortMessage || e.message) + '. Tente novamente.', 502); }
    if (v.status === 'pending') { r.status = 'minting'; r.mintVia = 'wallet'; r.txHash = hash; r.error = null; store.saveReward(r, 'recompensa_mint_aguardando', by); return res.status(202).json({ ...v, reward: r }); }
    if (v.status === 'rejected') { r.status = 'approved'; r.mintVia = null; r.txHash = null; r.error = v.motivo; store.saveReward(r, 'recompensa_mint_recusado', by); throw fail(v.motivo, 422); }
    r.status = 'minted'; r.mintVia = 'wallet'; r.manual = true; r.txHash = hash; r.error = null; r.mintedAt = now(); store.saveReward(r, 'recompensa_emitida_owner', by);
    res.json({ ok: true, status: 'confirmed', confirmations: v.confirmations, reward: r });
  }));
  adm.post('/rewards/:id/mint', wrap(async (req, res) => {
    const r = reward(req), by = req.admin?.email || req.admin?.uid;
    if (req.body?.confirm !== true) throw fail('Envie {"confirm": true} para confirmar a emissão on-chain.');
    if (r.mintVia === 'wallet') throw fail('Esta recompensa está sendo emitida pela carteira do owner: use "Verificar emissão".', 409);
    if (r.status === 'minting' && r.txHash) { // reconciliação de uma emissão anterior que não confirmou a tempo
      const st = await chain.receiptStatus(r.txHash);
      if (st === 'ok') r.status = 'minted'; else if (st === 'revertida') { r.status = 'approved'; r.error = 'Transação ' + r.txHash + ' revertida.'; r.txHash = null; }
      store.saveReward(r, 'recompensa_reconciliada', by); return res.json({ ok: true, reward: r });
    }
    if (r.status !== 'approved') throw fail('Só recompensas aprovadas podem ser emitidas.', 409);
    await decimals();
    r.status = 'minting'; r.error = null; store.saveReward(r, 'recompensa_minting', by); // trava contra duplo clique antes de qualquer await
    let sent;
    try { sent = await chain.mint(r.recipient, r.amountUnits); } catch (e) { r.status = 'approved'; r.error = e.message; store.saveReward(r, 'recompensa_mint_falhou', by); throw fail(e.message); }
    r.txHash = sent.txHash; store.saveReward(r, 'recompensa_mint_enviado', by);
    try { const rc = await sent.wait(); if (rc && rc.status === 1) { r.status = 'minted'; store.saveReward(r, 'recompensa_emitida', by); } else { r.status = 'approved'; r.error = 'mint revertido'; r.txHash = null; store.saveReward(r, 'recompensa_mint_revertido', by); } }
    catch { /* sem confirmação em 90 s: continua 'minting'; chame /mint de novo para reconciliar */ }
    res.json({ ok: true, reward: r });
  }));

  return { pub, adm };
}
