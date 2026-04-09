
import { beneficiariosMock } from '/mnt/data/viva_proj/app/data/mock.ts';
function hasRed15(b:any){
 const exames=b.eventos.filter((e:any)=>e.tipo==='Exame');
 const groups = Object.values(exames.reduce((acc:any,e:any)=>{const k=(e.nome??'Exame').trim(); (acc[k]??=[]).push(e); return acc;},{} as Record<string,any[]>));
 for (const g of groups){
   g.sort((a:any,b:any)=>a.diasAtras-b.diasAtras);
   for (let i=0;i<g.length-1;i++) if (Math.abs(g[i+1].diasAtras-g[i].diasAtras)<=15) return true;
 }
 return false;
}
const total=beneficiariosMock.filter(hasRed15).length;
console.log(total);
