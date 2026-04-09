
import { beneficiariosMock } from '/mnt/data/viva_proj/app/data/mock.ts';
const lows=beneficiariosMock.filter(b=>b.risco==='Baixo').sort((a,b)=>b.score-a.score);
const meds=(b:any)=>b.medicamentos.length;
const condCount=(b:any)=>Object.values(b.declaracao.doencasPreexistentes ?? {}).filter(Boolean).length;
console.log('top lows', lows.slice(0,20).map(b=>({id:b.id,score:b.score,cond:b.condicao,meds:meds(b),events:b.eventos.length,pa:b.eventos.filter((e:any)=>e.tipo==='Pronto atendimento').length,name:b.nome})));
const meds2=(b:any)=>b.medicamentos.length;
const medsTop=beneficiariosMock.filter(b=>b.risco==='Médio').sort((a,b)=>b.score-a.score);
console.log('top med', medsTop.slice(0,15).map(b=>({id:b.id,score:b.score,cond:b.condicao,meds:meds2(b),events:b.eventos.length,pa:b.eventos.filter((e:any)=>e.tipo==='Pronto atendimento').length,name:b.nome})));
