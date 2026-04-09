
import { beneficiariosMock } from './app/data/mock.ts';
const sem = beneficiariosMock.filter(b => b.status === 'Sem acompanhamento').map(b => ({
  id: b.id, nome: b.nome, score: b.score, risco: b.risco,
  acompanhamentoRegular: b.declaracao.acompanhamentoRegular,
  acompanhamentoRegularInternacoes: b.declaracao.internacoesExames.acompanhamentoRegular,
  acompanhamentoMedicoAtual: b.declaracao.internacoesExames.acompanhamentoMedicoAtual
}));
const counts = beneficiariosMock.reduce((acc,b)=>{acc[b.status]=(acc[b.status]||0)+1;return acc;}, {} as Record<string, number>);
console.log(JSON.stringify({count: sem.length, sem, counts}, null, 2));
