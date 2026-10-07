const { JSDOM } = require('jsdom'); const fs = require('fs');
const html = fs.readFileSync('/home/claude/out/OctoCookie-Holograma/public/octocookie-app/octocookie.html','utf8');
let seed=5; const rnd=()=>{seed=(seed*16807)%2147483647; return seed/2147483647;};
const N=1000, now=Date.now(); let c=2000; const kl=[];
for(let i=0;i<N;i++){ c*=Math.exp(0.0035+(rnd()-0.5)*0.012); const ct=now-(N-i)*8*3600e3+8*3600e3-1; kl.push([ct-8*3600e3,'0','0','0',String(c),'0',ct]); }
const ult=c; let preco=ult; const carteira={eth:2.0,usdc:0}; const swaps=[]; const errs=[];
const dom=new JSDOM(html,{url:'http://localhost/o.html',runScripts:'dangerously',pretendToBeVisual:true,beforeParse(w){
  w.fetch=async(u)=>{ if(u.includes('/klines')) return {ok:true,status:200,json:async()=>kl}; if(u.includes('/ticker')) return {ok:true,status:200,json:async()=>({price:String(preco)})}; return {ok:false,status:404,json:async()=>({})}; };
  w.Chart=class{constructor(){this.data={labels:[],datasets:[{data:[]}]};}update(){}};
  const tx=()=>({hash:'0x'+'ab'.repeat(32),wait:async()=>({gasUsed:100000n})});
  w.ethers={ parseEther:s=>BigInt(Math.round(parseFloat(s)*1e6))*10n**12n, formatEther:b=>String(Number(b)/1e18), formatUnits:(b,d)=>String(Number(b)/10**d),
    Contract:class{ constructor(addr,abi){ const a=abi.join(' ');
      if(a.includes('balanceOf')){ this.balanceOf=async()=>BigInt(Math.round(carteira.usdc*1e6)); this.allowance=async()=>2n**200n; this.approve=async()=>tx(); }
      if(a.includes('exactInputSingle')){ const ex=async(p,o)=>{swaps.push({tipo:'ETH->USDC',amountIn:p.amountIn,value:o.value});return tx();}; ex.staticCall=async()=>{}; this.exactInputSingle=ex;
        const mc=async(dl,data,o)=>{swaps.push({tipo:'USDC->ETH',amountIn:data[0].p.amountIn});return tx();}; mc.staticCall=async()=>{}; this.multicall=mc;
        this.interface={encodeFunctionData:(n,args)=>({n,p:args[0]})}; } } } };
  w.firebase={initializeApp(){},database(){return {ref(){return {set(){return Promise.resolve();}}}}}};
  w.addEventListener('error',e=>errs.push(e.message)); w.HTMLCanvasElement.prototype.getContext=()=>null;
}});
const w=dom.window,d=w.document,$=id=>d.getElementById(id); const ST=()=>w.eval('state'); const esp=ms=>new Promise(r=>setTimeout(r,ms));
const ok=(c,m)=>{console.log((c?'  OK  ':' FALHA')+' '+m); if(!c) process.exitCode=1;};
const ligarCarteira=()=>w.eval(`state.wallet={sendTransaction:async()=>({hash:'0xfee',wait:async()=>({})})}; state.walletAddress='0xabc'; state.apiStatus.provider=true; state.balance=${carteira.eth};
 state.provider={getBalance:async()=>BigInt(Math.round(${'carteira.eth'.length?0:0}))}`);
(async()=>{
  await esp(1500);
  w.eval(`state.wallet={sendTransaction:async()=>({hash:'0xfee',wait:async()=>({})})}; state.walletAddress='0xabc'; state.apiStatus.provider=true; state.balance=2;`);
  ST().provider={getBalance:async()=>BigInt(Math.round(carteira.eth*1e6))*10n**12n,getFeeData:async()=>({maxFeePerGas:1n,maxPriorityFeePerGas:1n})};
  console.log('--- cenário A: barra 50% (risco 50%), carteira 2 ETH / 0 USDC ---');
  const sl=$('hgBarra'); sl.value='50'; sl.dispatchEvent(new w.Event('input')); await esp(600);
  w.startBot(); w.confirmFeeConsentAndStart(); await esp(3000);
  const E=w.HG.estado; console.log('   risco',E.risco,'pos',E.pos,'swaps',JSON.stringify(swaps.map(s=>({...s,amountIn:String(s.amountIn),value:s.value&&String(s.value)}))));
  ok(swaps.length===1&&swaps[0].tipo==='ETH->USDC','vendeu ETH->USDC para chegar a ~50% (não 5% do stake)');
  const eth=Number(swaps[0].amountIn)/1e18; ok(Math.abs(eth-0.995)<0.02,'quantidade vendida ≈ metade do ETH negociável (0.995): '+eth.toFixed(4));
  ok(ST().trades.length===1&&ST().trades[0].txHash.startsWith('0xabab'),'ordem on-chain registrada com hash');
  console.log('--- cenário B: regra manda sair (queda) ---');
  carteira.eth=1.0; swaps.length=0;
  for(const f of [0.8,0.6,0.5]){ preco=ult*f; ST().priceOk=true; w.updatePrice(preco); ST().priceOk=true; await esp(5200); }
  console.log('   pos',E.pos,'swaps',swaps.length, swaps.map(s=>s.tipo+' '+(Number(s.amountIn)/(s.tipo==='ETH->USDC'?1e18:1e6)).toFixed(4)).join(' | '));
  ok(E.pos===0&&swaps.some(s=>s.tipo==='ETH->USDC'),'saiu de ETH on-chain quando a regra virou');
  console.log('--- cenário C: regra volta a comprar: usa USDC da carteira ---');
  carteira.eth=0.01; carteira.usdc=5000; swaps.length=0; E.pos=0;E.regraPos=0;E.reb=true; preco=ult*1.3;
  for(let i=0;i<2;i++){ ST().priceOk=true; w.updatePrice(preco); ST().priceOk=true; await esp(5200); }
  console.log('   pos',E.pos,'swaps',swaps.map(s=>s.tipo+' '+(Number(s.amountIn)/1e6).toFixed(2)).join(' | '));
  console.log('erros JS:',errs.length?errs:'nenhum'); w.stopBot(); process.exit(process.exitCode||0);
})();
