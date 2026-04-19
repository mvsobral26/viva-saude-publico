import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const beneficiario = {
      idade: 67,
      sexo: 'F',
      condicoes: ['diabetes', 'hipertensao'],
      alertas: ['alto custo potencial no curto prazo'],
      custos: {
        custo_12m: 18400,
        evitavel: 6200,
        tendencia: 'alta',
      },
    };

    const prompt = `
Você é um especialista em gestão de saúde populacional.

Analise os dados do beneficiário abaixo e responda em JSON válido.
Não invente dados que não foram fornecidos.
Se alguma informação estiver ausente, baseie-se apenas no que existe.
A resposta deve ser objetiva, clara e útil para priorização operacional.

Dados do beneficiário:
${JSON.stringify(beneficiario, null, 2)}

Formato obrigatório:
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
      beneficiario,
      resposta: respostaParseada,
    });
  } catch (error) {
    console.error('Erro na análise de beneficiário:', error);

    return NextResponse.json(
      {
        ok: false,
        erro: 'Falha ao analisar beneficiário.',
        detalhe: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}