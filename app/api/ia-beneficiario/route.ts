import { NextResponse } from 'next/server';
import { beneficiariosMock } from '../../../../data/mock';
import { ChatOpenAI } from '@langchain/openai';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const beneficiarioId = Number(id);

    const beneficiario = beneficiariosMock.find((b) => b.id === beneficiarioId);

    if (!beneficiario) {
      return NextResponse.json(
        { ok: false, erro: 'Beneficiário não encontrado.' },
        { status: 404 }
      );
    }

    const contexto = {
      id: beneficiario.id,
      nome: beneficiario.nome,
      idade: beneficiario.idade,
      risco: beneficiario.risco,
      score: beneficiario.score,
      condicao: beneficiario.condicao,
      alerta: beneficiario.alerta,
      custo: beneficiario.custoPotencial30d,
      ultimoEventoDias: beneficiario.ultimoEventoDias,
    };

    const prompt = `
Você é um especialista em gestão de saúde populacional.

Analise os dados abaixo e responda em JSON válido.

Dados:
${JSON.stringify(contexto, null, 2)}

Formato:
{
  "resumo_executivo": "",
  "drivers_risco": [],
  "prioridade_acao": "monitorar | atuar_semana | imediato",
  "acao_recomendada": "",
  "justificativa": ""
}
`;

    const model = new ChatOpenAI({
      model: 'gpt-5.4-mini',
      temperature: 0.2,
    });

    const response = await model.invoke(prompt);

    let parsed;

    try {
      parsed = JSON.parse(String(response.content));
    } catch {
      return NextResponse.json(
        {
          ok: false,
          erro: 'JSON inválido da IA',
          resposta_bruta: response.content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      resposta: parsed,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        erro: 'Erro na IA',
        detalhe: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}