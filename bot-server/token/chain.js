// Acesso à blockchain: verificação do contrato, leitura de dados, validação de pagamentos e emissão (mint) controlada.
// Nada aqui confia no navegador: tudo é conferido na rede via RPC do servidor.
import { ethers } from 'ethers';
import { iface, REQUIRED_FUNCTIONS, OPTIONAL_FUNCTIONS, selector, TOKEN_ABI } from './abi.js';
import { EXPECTED_CODEHASH } from './bytecode.js';

const TRANSFER_TOPIC = iface.getEvent('Transfer').topicHash;
const pad = (a) => ethers.zeroPadValue(a, 32);
const low = (a) => String(a || '').toLowerCase();

export class ChainService {
  /** provider: qualquer objeto compatível com ethers.Provider (nos testes, um simulado). */
  constructor(cfg, { provider = null, now = () => Date.now() } = {}) {
    this.cfg = cfg; this.now = now;
    this.provider = provider || (cfg.rpcUrl ? new ethers.JsonRpcProvider(cfg.rpcUrl, cfg.chainId || undefined, { staticNetwork: !!cfg.chainId }) : null);
    this.contract = this.provider && cfg.contract ? new ethers.Contract(cfg.contract, TOKEN_ABI, this.provider) : null;
    this.signer = null; this.cache = null;
    if (cfg.minterKey && this.provider) { try { this.signer = new ethers.Wallet(cfg.minterKey, this.provider); } catch { this.signer = null; } }
  }

  /** Verifica rede, código implantado, correspondência ABI×bytecode e dados básicos. Resultado em cache por 60 s. */
  async inspect(force = false) {
    if (!force && this.cache && this.now() - this.cache.at < 60_000) return this.cache;
    const r = { at: this.now(), ready: false, issues: [...this.cfg.issues], caps: {}, info: null };
    try {
      if (r.issues.length || !this.provider) { if (!this.provider) r.issues.push('Sem RPC configurado.'); return (this.cache = r); }
      const net = await this.provider.getNetwork();
      if (Number(net.chainId) !== this.cfg.chainId) { r.issues.push(`Rede incorreta: o RPC responde chainId ${net.chainId}, esperado ${this.cfg.chainId}.`); return (this.cache = r); }
      const code = await this.provider.getCode(this.cfg.contract);
      if (!code || code === '0x') {
        r.issues.push('Não há contrato implantado neste endereço, nesta rede (é uma carteira ou a rede está errada). Confira TOKEN_CONTRACT_ADDRESS e TOKEN_CHAIN_ID.');
        return (this.cache = r);
      }
      const has = (fn) => code.toLowerCase().includes(selector(fn).slice(2).toLowerCase());
      if (!this.cfg.skipSelectorCheck) {
        const faltam = REQUIRED_FUNCTIONS.filter((f) => !has(f));
        if (faltam.length) { r.issues.push('O bytecode implantado não corresponde ao ABI (faltam: ' + faltam.join(', ') + '). Se for um contrato proxy, defina TOKEN_SKIP_SELECTOR_CHECK=1.'); return (this.cache = r); }
      }
      for (const f of OPTIONAL_FUNCTIONS) r.caps[f] = this.cfg.skipSelectorCheck ? null : has(f);
      const c = this.contract, [name, symbol, decimals, totalSupply] = await Promise.all([c.name(), c.symbol(), c.decimals(), c.totalSupply()]);
      const tokenPrice = r.caps.tokenPrice === false ? null : await c.tokenPrice().catch(() => null);
      const owner = r.caps.owner === false ? null : await c.owner().catch(() => null);
      r.info = { name, symbol, decimals: Number(decimals), totalSupply: totalSupply.toString(), tokenPriceWei: tokenPrice == null ? null : tokenPrice.toString(), bytecodeIdentical: ethers.keccak256(code) === EXPECTED_CODEHASH, owner: owner ? ethers.getAddress(owner) : null };
      const treasury = this.cfg.treasury || (owner ? ethers.getAddress(owner) : null);
      if (!treasury) { r.issues.push('Não foi possível definir a tesouraria: defina TOKEN_TREASURY_ADDRESS (o contrato não informa owner()).'); return (this.cache = r); }
      if (low(treasury) === low(ethers.ZeroAddress)) { r.issues.push('Tesouraria inválida (owner() é o endereço zero): defina TOKEN_TREASURY_ADDRESS.'); return (this.cache = r); }
      if (low(treasury) === low(this.cfg.contract)) { r.issues.push('A tesouraria não pode ser o endereço do contrato.'); return (this.cache = r); }
      r.info.treasury = treasury; r.info.treasuryIsOwner = !this.cfg.treasury;
      r.ready = true;
    } catch (e) { r.issues.push('Falha ao consultar a rede: ' + (e.shortMessage || e.message)); }
    return (this.cache = r);
  }
  async ready() { return (await this.inspect()).ready; }

  async balanceOf(address) { return (await this.contract.balanceOf(address)).toString(); }

  /** Transferências recentes (janela limitada) de/para a carteira. Se o RPC recusar o intervalo, devolve lista vazia + aviso. */
  async transfers(address) {
    try {
      const head = await this.provider.getBlockNumber(), from = Math.max(0, head - this.cfg.historyBlocks);
      const [out, inn] = await Promise.all([
        this.provider.getLogs({ address: this.cfg.contract, topics: [TRANSFER_TOPIC, pad(address)], fromBlock: from, toBlock: head }),
        this.provider.getLogs({ address: this.cfg.contract, topics: [TRANSFER_TOPIC, null, pad(address)], fromBlock: from, toBlock: head }),
      ]);
      const seen = new Set(), items = [];
      for (const l of [...out, ...inn]) {
        const k = l.transactionHash + ':' + l.index; if (seen.has(k)) continue; seen.add(k);
        const p = iface.parseLog(l); if (!p) continue;
        items.push({ txHash: l.transactionHash, block: l.blockNumber, from: p.args[0], to: p.args[1], value: p.args[2].toString(), direction: low(p.args[0]) === low(address) ? 'out' : 'in' });
      }
      return { items: items.sort((a, b) => b.block - a.block).slice(0, 100), fromBlock: from, toBlock: head };
    } catch (e) { return { items: [], warning: 'Não foi possível consultar o histórico on-chain agora (' + (e.shortMessage || e.message) + ').' }; }
  }

  /**
   * Valida um pagamento direto por transfer(). Retorna { status: 'confirmed'|'pending'|'rejected', ... }.
   * Confere: rede, tx existe, sucesso (não revertida), destino = contrato, remetente = carteira vinculada,
   * calldata = transfer(tesouraria, valor exato), evento Transfer correspondente, confirmações e momento (bloco ≥ criação do pedido).
   */
  async verifyPayment(txHash, order) {
    const info = await this.inspect(); if (!info.ready) return { status: 'rejected', motivo: 'Token não verificado na rede: ' + info.issues.join(' ') };
    const net = await this.provider.getNetwork(); if (Number(net.chainId) !== this.cfg.chainId) return { status: 'rejected', motivo: 'Rede incorreta.' };
    const [rc, tx] = await Promise.all([this.provider.getTransactionReceipt(txHash), this.provider.getTransaction(txHash)]);
    if (!rc || !tx) return { status: 'pending', motivo: 'Transação ainda não encontrada/minerada.', confirmations: 0 };
    if (rc.status !== 1) return { status: 'rejected', motivo: 'A transação foi revertida na blockchain.' };
    if (low(rc.to) !== low(this.cfg.contract)) return { status: 'rejected', motivo: 'A transação não foi enviada ao contrato do token.' };
    if (low(tx.from) !== low(order.wallet)) return { status: 'rejected', motivo: 'O remetente não é a carteira vinculada à sua conta.' };
    let parsed; try { parsed = iface.parseTransaction({ data: tx.data }); } catch { parsed = null; }
    if (!parsed || parsed.name !== 'transfer') return { status: 'rejected', motivo: 'A transação não é uma chamada transfer().' };
    if (low(parsed.args[0]) !== low(order.treasury)) return { status: 'rejected', motivo: 'Destinatário diferente da tesouraria do pedido.' };
    if (parsed.args[1].toString() !== order.amountUnits) return { status: 'rejected', motivo: 'Valor diferente do preço do pedido.' };
    const ev = rc.logs.find((l) => low(l.address) === low(this.cfg.contract) && l.topics[0] === TRANSFER_TOPIC);
    const pe = ev && iface.parseLog(ev);
    if (!pe || low(pe.args[0]) !== low(order.wallet) || low(pe.args[1]) !== low(order.treasury) || pe.args[2].toString() !== order.amountUnits) return { status: 'rejected', motivo: 'Evento Transfer não corresponde ao pedido (token com taxa/desconto na transferência?).' };
    const blk = await this.provider.getBlock(rc.blockNumber); const blockMs = Number(blk?.timestamp || 0) * 1000;
    if (!blockMs || blockMs < order.createdAt - 60_000) return { status: 'rejected', motivo: 'A transação é anterior à criação do pedido (reuso de pagamento antigo).' };
    if (blockMs > order.expiresAt + 60_000) return { status: 'rejected', motivo: 'A transação foi minerada depois da expiração do pedido. Fale com o suporte com o hash da transação.' };
    const head = await this.provider.getBlockNumber(), confirmations = head - rc.blockNumber + 1;
    if (confirmations < this.cfg.minConfirmations) return { status: 'pending', motivo: `Aguardando confirmações (${Math.max(confirmations, 0)}/${this.cfg.minConfirmations}).`, confirmations };
    return { status: 'confirmed', confirmations, blockMs, block: rc.blockNumber };
  }

  /**
   * Valida uma emissão (mint) feita FORA do servidor — ex.: pelo admin com a carteira owner no navegador.
   * Confere: rede, recibo com sucesso, destino = contrato, remetente = owner() atual, calldata = mint(destinatário, valor exato),
   * evento Transfer(0x0 → destinatário, valor), bloco posterior à criação da recompensa e confirmações mínimas.
   */
  async verifyMint(txHash, reward) {
    const info = await this.inspect(); if (!info.ready) return { status: 'rejected', motivo: 'Token não verificado na rede: ' + info.issues.join(' ') };
    const net = await this.provider.getNetwork(); if (Number(net.chainId) !== this.cfg.chainId) return { status: 'rejected', motivo: 'Rede incorreta.' };
    const [rc, tx] = await Promise.all([this.provider.getTransactionReceipt(txHash), this.provider.getTransaction(txHash)]);
    if (!rc || !tx) return { status: 'pending', motivo: 'Transação ainda não encontrada/minerada.', confirmations: 0 };
    if (rc.status !== 1) return { status: 'rejected', motivo: 'A transação foi revertida na blockchain.' };
    if (low(rc.to) !== low(this.cfg.contract)) return { status: 'rejected', motivo: 'A transação não foi enviada ao contrato do token.' };
    const owner = await this.contract.owner().catch(() => null);
    if (!owner) return { status: 'rejected', motivo: 'Não foi possível ler owner() para conferir quem emitiu.' };
    if (low(tx.from) !== low(owner)) return { status: 'rejected', motivo: 'A emissão não foi feita pelo owner() do contrato.' };
    let parsed; try { parsed = iface.parseTransaction({ data: tx.data }); } catch { parsed = null; }
    if (!parsed || parsed.name !== 'mint') return { status: 'rejected', motivo: 'A transação não é uma chamada mint().' };
    if (low(parsed.args[0]) !== low(reward.recipient)) return { status: 'rejected', motivo: 'Destinatário do mint diferente do da recompensa.' };
    if (parsed.args[1].toString() !== reward.amountUnits) return { status: 'rejected', motivo: 'Valor do mint diferente do da recompensa.' };
    const ev = rc.logs.find((l) => low(l.address) === low(this.cfg.contract) && l.topics[0] === TRANSFER_TOPIC);
    const pe = ev && iface.parseLog(ev);
    if (!pe || pe.args[0] !== ethers.ZeroAddress || low(pe.args[1]) !== low(reward.recipient) || pe.args[2].toString() !== reward.amountUnits) return { status: 'rejected', motivo: 'Evento Transfer do mint não corresponde à recompensa.' };
    const blk = await this.provider.getBlock(rc.blockNumber); const blockMs = Number(blk?.timestamp || 0) * 1000;
    if (!blockMs || blockMs < reward.createdAt - 60_000) return { status: 'rejected', motivo: 'A transação é anterior à criação da recompensa (reuso de emissão antiga).' };
    const head = await this.provider.getBlockNumber(), confirmations = head - rc.blockNumber + 1;
    if (confirmations < this.cfg.minConfirmations) return { status: 'pending', motivo: `Aguardando confirmações (${Math.max(confirmations, 0)}/${this.cfg.minConfirmations}).`, confirmations };
    return { status: 'confirmed', confirmations, blockMs, block: rc.blockNumber };
  }

  /** Capacidade de emitir tokens com a carteira operacional (só informa; NUNCA presume permissão). */
  async mintCapability() {
    const info = await this.inspect();
    if (!info.ready) return { can: false, why: 'Token não verificado.' };
    if (info.caps.mint === false) return { can: false, why: 'O contrato não tem mint().' };
    if (!this.signer) return { can: false, why: 'Sem TOKEN_MINTER_PRIVATE_KEY: emissão manual (aprovação administrativa).' };
    const owner = await this.contract.owner().catch(() => null);
    if (!owner) return { can: false, why: 'Não foi possível ler owner() para confirmar a permissão.' };
    if (low(owner) !== low(this.signer.address)) return { can: false, why: 'A carteira operacional não é o owner() do contrato.', operator: this.signer.address, owner };
    return { can: true, operator: this.signer.address, owner };
  }

  /** Emite tokens (mint). Só roda por ação explícita do admin. Confere owner e simula antes de enviar (o contrato não tem teto de oferta). */
  async mint(to, amountUnits) {
    const cap = await this.mintCapability(); if (!cap.can) throw new Error('Emissão indisponível: ' + cap.why);
    const c = this.contract.connect(this.signer), amount = BigInt(amountUnits);
      await c.mint.staticCall(to, amount).catch((e) => { throw new Error('A simulação do mint falhou (o contrato recusaria): ' + (e.shortMessage || e.message)); });
    const tx = await c.mint(to, amount);
    return { txHash: tx.hash, wait: () => tx.wait(1, 90_000) };
  }
  async receiptStatus(txHash) { const rc = await this.provider.getTransactionReceipt(txHash); return rc ? (rc.status === 1 ? 'ok' : 'revertida') : 'pendente'; }
}
