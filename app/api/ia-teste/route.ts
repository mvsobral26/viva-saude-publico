import { NextResponse } from 'next/server';
import { ChatOpenAI } from '@langchain/openai';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const model = new ChatOpenAI({
      model: 'gpt-5.4-mini',
      temperature: 0.2,
    });

    const response = await model.invoke(`
Você é um especialista em gestão de saúde populacional.

Resuma em no máximo 3 linhas:
Paciente com diabetes, hipertensão e aumento recente de custo assistencial.
`);

    return NextResponse.json({
      ok: true,
      resposta: response.content,
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