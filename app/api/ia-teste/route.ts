import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const model = new ChatOpenAI({
      model: 'gpt-5.4-mini',
      temperature: 0.2,
    });

    const prompt = `
Você é um especialista em gestão de saúde populacional.

Analise o caso abaixo e responda em JSON válido.

Paciente com diabetes, hipertensão e aumento recente de custo assistencial.

Formato obrigatório:
{
  "resumo_executivo": "",
  "drivers_risco": [],
  "prioridade_acao": "monitorar | atuar_semana | imediato",
  "acao_recomendada": "",
  "justificativa": ""
}
`;

    const response = await model.invoke(prompt);

    let respostaParseada: unknown;

    try {
      respostaParseada = JSON.parse(String(response.content));
    } catch {
      return NextResponse.json(
        {
          ok: false,
          erro: 'A IA respondeu, mas o JSON veio inválido.',
          resposta_bruta: response.content,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      resposta: respostaParseada,
    });
  } catch (error) {
    console.error('Erro no teste de IA:', error);

    return NextResponse.json(
      {
        ok: false,
        erro: 'Falha ao executar teste de IA.',
        detalhe: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}