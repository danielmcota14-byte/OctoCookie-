import sys, json, math, random, types, time
PASTA = sys.argv[1] if len(sys.argv) > 1 else '.'   # pasta com holograma_quantico.py e teste_rapido.py
sys.path.insert(0, PASTA)
import numpy as np
import holograma_quantico as H
import teste_rapido as T

SEEDS=[7,11,23,42,99,2024]
def serie(n, p0, drift_seq, vol):
    c=[p0]
    for i in range(n-1):
        d=drift_seq[(i//80)%len(drift_seq)]
        c.append(c[-1]*math.exp(random.gauss(d, vol)))
    return c
out={'cenarios':[]}
H.gas_mainnet=lambda:(12.0,0.5)
for seed in SEEDS:
  random.seed(seed)
  closes = serie(1000, 2500, [0.003,-0.004,0.002,0.0,-0.003,0.005], 0.012)
  live=[closes[-1]]
  for i in range(300):
    d = (-0.02 if (i//25)%2 else 0.02)
    live.append(live[-1]*math.exp(random.gauss(d,0.02)))
  live=live[1:]
  H.velas_8h=lambda c=closes: list(c)
  cases=[]
  for modo in ['quantica','tendencia','escala']:
    for barra in [100,55,0]:
      for stopvivo in [False, True]:
          a=types.SimpleNamespace(simulado=False,janela=30,limiar=3.0,custo_pct=0.10,limiar_q=0.3,decisao=modo,risco=100,saldo=1000.0,stop_pct=0.0,stop_vivo=stopvivo)
          seq=iter(live)
          cur={'p':live[0]}
          H.preco_vivo=lambda: cur['p']
          m=H.Motor(a); m.barra=float(barra)
          cur['p']=closes[-1]
          m.carregar()
          init_pos=m.pos; init_reg=m.regra_pos
          steps=[]
          for p in live:
              cur['p']=p
              m.t_velas=time.time()
              m.passo()
              steps.append(dict(pos=m.pos,regra=m.regra_pos,stop=bool(m.stop_bloq),topo=m.topo,usdc=m.usdc,eth=m.eth,entrada=m.entrada,sn=m.sn,expo=m.expo,risco=m.risco))
          proj=m.proj(); 
          cases.append(dict(modo=modo,barra=barra,stopvivo=stopvivo,
            init=dict(pos=init_pos,reg=init_reg,bt_t=m.bt_t,bt_q=m.bt_q,janela=m.janela,lim=m.lim,stop=m.stop_pct,risco=m.risco),
            steps=steps,proj=proj,barra_calc=m.barra_calc(),curva=m.curva_barra()))

  out['cenarios'].append(dict(seed=seed,closes=closes,live=live,cases=cases))
json.dump(out,open('expected.json','w'))
print(sum(len(x['cases']) for x in out['cenarios']),'casos')
