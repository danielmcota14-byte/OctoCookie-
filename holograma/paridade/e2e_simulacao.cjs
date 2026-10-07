const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync('/home/claude/out/OctoCookie-Holograma/public/octocookie-app/octocookie.html','utf8');
// serie de velas: alta forte e constante => regra em ETH
let seed=5; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
const N=1000, now=Date.now(); let c=2000; const kl=[];
for(let i=0;i<N;i++){ c*=Math.exp(0.0035+ (rnd()-0.5)*0.012); const closeT=now-(N-i)*8*3600e3+8*3600e3-1; kl.push([closeT-8*3600e3,'0','0','0',String(c),'0',closeT]); }
const ult=c; let preco=ult; const falhas={ticker:false}; const chamadas=[];
const errs=[]; const logs=[];
const dom = new JSDOM(html,{url:'http://localhost/octocookie.html',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.fetch=async(u)=>{ chamadas.push(u);
    if(u.includes('/klines')) return {ok:true,status:200,json:async()=>kl};
    if(u.includes('/ticker/price')){ if(falhas.ticker) return {ok:false,status:503,json:async()=>({})}; return {ok:true,status:200,json:async()=>({price:String(preco)})}; }
    return {ok:false,status:404,json:async()=>({})}; };
  w.Chart=class{constructor(){this.data={labels:[],datasets:[{data:[]}]};}update(){}};
  w.ethers={}; w.firebase={initializeApp(){},database(){return {ref(){return {set(){return Promise.resolve();}}}}}};
  w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null;
}});
const w=dom.window, d=w.document; const $=id=>d.getElementById(id);
const ST=()=>w.eval('state');
const esperar=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{ console.log((c?'  OK  ':' FALHA')+' '+m); if(!c) process.exitCode=1; };
(async()=>{
  await esperar(1500);
  console.log('--- pré-visualização (bot parado) ---');
  ok(!!w.HG,'motor HG carregado');
  ok($('hgBarraVal').textContent==='100%','slider mostra 100%');
  ok($('hgSaldo').textContent.startsWith('$1,000'),'saldo virtual: '+$('hgSaldo').textContent);
  ok($('hgProb').textContent.endsWith('%'),'probabilidade histórica: '+$('hgProb').textContent+' | '+$('hgProbSub').textContent.slice(0,40));
  ok($('hgStatus').textContent.includes('Pré-visualização'),'status: '+$('hgStatus').textContent.slice(0,60));
  ok($('hgMapa').innerHTML.includes('<svg')&&$('hgHolo').innerHTML.includes('<svg'),'mapa de qubits e holograma desenhados');
  ok(w.HG.estado.w.eth===0&&w.HG.estado.w.usdc===1000,'nada negociado antes de INICIAR');
  console.log('--- slider ---');
  const sl=$('hgBarra'); sl.value='55'; sl.dispatchEvent(new w.Event('input'));
  ok($('hgBarraVal').textContent==='55%' && w.HG.estado.risco===55 && w.HG.estado.janela===44,'barra 55% => risco '+w.HG.estado.risco+'% janela '+w.HG.estado.janela+' stop '+(w.HG.estado.stopPct*100).toFixed(2)+'%');
  sl.value='100'; sl.dispatchEvent(new w.Event('input'));
  console.log('--- INICIAR sem carteira (simulação) ---');
  w.startBot(); ok($('feeConsentOverlay').style.display==='flex','abre consentimento de taxa');
  w.confirmFeeConsentAndStart(); await esperar(2500);
  const E=w.HG.estado;
  ok(ST().botRunning,'bot rodando');
  ok(E.pos===1&&E.w.eth>0,'regra entrou em ETH: eth='+E.w.eth.toFixed(4)+' usdc='+E.w.usdc.toFixed(2));
  ok(ST().trades.length===1&&ST().trades[0].direction==='BUY','ordem registrada na tabela: '+JSON.stringify(ST().trades[0]).slice(0,110));
  ok($('aiDecision').textContent.startsWith('Em ETH'),'card Sinal: '+$('aiDecision').textContent+' | '+$('aiReason').textContent);
  ok($('hgPos').textContent.startsWith('ETH'),'posição no cabeçalho: '+$('hgPos').textContent);
  ok($('hgStatus').textContent.includes('SIMULAÇÃO'),'status: '+$('hgStatus').textContent.slice(0,55));
  console.log('--- queda forte: stop/saída ---');
  for(const f of [0.97,0.95,0.93,0.9,0.88]){ preco=ult*f; ST().priceOk=true; w.updatePrice(preco); ST().priceOk=true; await esperar(5200); }
  console.log('   pos='+E.pos+' stopBloq='+E.stopBloq+' regra='+E.regraPos+' eth='+E.w.eth.toFixed(4)+' usdc='+E.w.usdc.toFixed(2)+' trades='+ST().trades.length+' sinalQ='+E.sRaw.toFixed(3)+' tend='+(E.sT*100).toFixed(2)+'%');
  const tem=ST().trades.map(t=>t.direction+':'+t.result);
  console.log('   ordens:',tem.join(' '));
  console.log('--- feed de preço falha: não pode operar com preço inventado ---');
  const antes=ST().trades.length; falhas.ticker=true; ST().priceOk=false; ST().priceTs=Date.now()-120000; await esperar(5500);
  ok(ST().trades.length===antes,'sem novas ordens sem preço real'); ok($('hgStatus').textContent.includes('Sem preço real'),'aviso na tela: '+$('hgStatus').textContent.slice(0,70));
  console.log('--- parar ---'); w.stopBot();
  ok(!ST().botRunning,'bot parado');
  console.log('erros JS:',errs.length?errs:'nenhum');
  process.exit(process.exitCode||0);
})();
