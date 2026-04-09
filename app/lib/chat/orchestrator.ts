import type { ChatRequest, ChatResponse } from '../../types/chat';
import { buildResponse } from './responder';
import { isOutOfScopeMedicalQuestion } from './guards';
import { parseIntent } from './parser';
import {
  getAreaSummary,
  getDashboardSummary,
  getRiskDistribution,
  getTopCriticalCases,
} from '../domain/dashboard.service';
import {
  getBeneficiaryScoreExplanation,
  getBeneficiarySummary,
} from '../domain/beneficiary.service';
import {
  listRedundancyCases,
  listRepetitionCases,
} from '../domain/efficiency.service';
import { getAlertsByBeneficiary } from '../domain/alerts.service';

function moeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });
}

export async function handleChat(request: ChatRequest): Promise<ChatResponse> {
  const message = request.message?.trim();

  if (!message) {
    return buildResponse(
      'NAO_ENTENDIDA',
      'Envie uma pergunta sobre criticidade, score, alertas ou eficiência assistencial.',
      [],
      ['Quais são os casos mais críticos?', 'Quem está sem acompanhamento?']
    );
  }

  if (isOutOfScopeMedicalQuestion(message)) {
    return buildResponse(
      'FORA_DE_ESCOPO',
      'Posso explicar dados, score, alertas e oportunidades do Viva+, mas não recomendar tratamento, diagnóstico ou conduta clínica.',
      [],
      ['Explique o score deste beneficiário', 'Quais têm exame com possível redundância?']
    );
  }

  const parsed = parseIntent(message, request.context);

  switch (parsed.intent) {
    case 'LISTAR_CRITICOS': {
      const top = getTopCriticalCases(5);
      const summary = getDashboardSummary();
      const risk = getRiskDistribution();

      return buildResponse(
        'LISTAR_CRITICOS',
        `Hoje a carteira tem ${summary.totalBeneficiarios} beneficiários monitorados, score médio ${summary.scoreMedio} e ${risk.alto} em alto risco. Os casos mais críticos no momento são ${top
          .map((item) => `${item.nome} (score ${item.score})`)
          .join(', ')}.`,
        top.map((item) => ({
          type: 'beneficiario',
          id: item.id,
          label: item.nome,
          href: `/beneficiarios/${item.id}`,
        })),
        ['Quem está sem acompanhamento?', 'Quais têm repetição assistencial?']
      );
    }

    case 'LISTAR_SEM_ACOMPANHAMENTO': {
      const summary = getDashboardSummary();
      return buildResponse(
        'LISTAR_SEM_ACOMPANHAMENTO',
        `A carteira possui ${summary.semAcompanhamento} beneficiários com indício de descontinuidade, considerando status, ausência de acompanhamento regular ou último evento acima de 90 dias.`,
        [{ type: 'rota', label: 'Abrir lista de beneficiários', href: '/beneficiarios' }],
        ['Quais são os casos mais críticos?', 'Resuma esta área']
      );
    }

    case 'EXPLICAR_SCORE': {
      if (!parsed.beneficiaryId) {
        return buildResponse(
          'NAO_ENTENDIDA',
          'Para explicar o score com precisão, abra um beneficiário ou mencione o nome dele na pergunta.',
          [],
          ['Resuma este beneficiário', 'Quais são os casos mais críticos?']
        );
      }

      const data = getBeneficiaryScoreExplanation(parsed.beneficiaryId);
      if (!data) {
        return buildResponse('NAO_ENTENDIDA', 'Não encontrei o beneficiário solicitado.');
      }

      const alertaCritico = data.alertas.find((item) => item.tipo === 'Crítico' || item.tipo === 'Alto');

      return buildResponse(
        'EXPLICAR_SCORE',
        `${data.beneficiario.nome} está classificado em risco ${data.beneficiario.risco} com score ${data.beneficiario.score}. ${data.resumoScore}${alertaCritico ? ` O principal alerta adicional é: ${alertaCritico.mensagem}.` : ''}`,
        [
          {
            type: 'beneficiario',
            id: data.beneficiario.id,
            label: data.beneficiario.nome,
            href: `/beneficiarios/${data.beneficiario.id}/score`,
          },
        ],
        ['Quais alertas este beneficiário possui?', 'Resuma este beneficiário']
      );
    }

    case 'LISTAR_REDUNDANCIA': {
      const items = listRedundancyCases().slice(0, 5);
      return buildResponse(
        'LISTAR_REDUNDANCIA',
        items.length > 0
          ? `Identifiquei ${listRedundancyCases().length} oportunidades de exame com possível redundância. Os principais casos são ${items
              .map((item) => `${item.nome} (${item.frequencia})`)
              .join(', ')}.`
          : 'Não identifiquei oportunidades de exame com possível redundância na carteira atual.',
        items.map((item) => ({
          type: 'eficiencia',
          id: item.beneficiarioId,
          label: item.nome,
          href: `/eficiencia/${item.beneficiarioId}`,
        })),
        ['Quais têm repetição assistencial?', 'Quais são os casos mais críticos?']
      );
    }

    case 'LISTAR_REPETICAO_ASSISTENCIAL': {
      const items = listRepetitionCases().slice(0, 5);
      return buildResponse(
        'LISTAR_REPETICAO_ASSISTENCIAL',
        items.length > 0
          ? `Existem ${listRepetitionCases().length} oportunidades de repetição assistencial. Os casos com maior sinalização são ${items
              .map((item) => `${item.nome} (${item.frequencia})`)
              .join(', ')}.`
          : 'Não identifiquei repetição assistencial relevante na carteira atual.',
        items.map((item) => ({
          type: 'eficiencia',
          id: item.beneficiarioId,
          label: item.nome,
          href: `/eficiencia/${item.beneficiarioId}`,
        })),
        ['Quais têm exame com possível redundância?', 'Quem está sem acompanhamento?']
      );
    }

    case 'RESUMIR_AREA': {
      const areaName = parsed.area ?? request.context?.area;
      if (!areaName) {
        return buildResponse(
          'NAO_ENTENDIDA',
          'Para resumir uma área, mencione o nome da área ou abra a lista já filtrada.',
          [],
          ['Resuma a área Jurídico', 'Quais áreas concentram maior risco?']
        );
      }

      const area = getAreaSummary(areaName);
      if (!area) {
        return buildResponse('NAO_ENTENDIDA', 'Não encontrei essa área na carteira atual.');
      }

      return buildResponse(
        'RESUMIR_AREA',
        `A área ${area.area} possui ${area.total} beneficiários, ${area.alto} em alto risco, score médio ${area.scoreMedio}, ${area.semAcompanhamento} com indício de descontinuidade e custo potencial de ${moeda(area.custoTotal)} em 30 dias.`,
        [
          { type: 'area', label: area.area, href: '/beneficiarios' },
          ...area.topCasos.map((item) => ({
            type: 'beneficiario' as const,
            id: item.id,
            label: item.nome,
            href: `/beneficiarios/${item.id}`,
          })),
        ],
        ['Quais são os casos mais críticos?', 'Quem está sem acompanhamento?']
      );
    }

    case 'RESUMIR_BENEFICIARIO': {
      if (!parsed.beneficiaryId) {
        return buildResponse(
          'NAO_ENTENDIDA',
          'Para resumir um beneficiário com precisão, abra o detalhe dele ou mencione o nome na pergunta.',
          [],
          ['Explique o score deste beneficiário', 'Quais alertas este beneficiário possui?']
        );
      }

      const data = getBeneficiarySummary(parsed.beneficiaryId);
      if (!data) {
        return buildResponse('NAO_ENTENDIDA', 'Não encontrei o beneficiário solicitado.');
      }

      const alertaPrincipal = data.alertas[0]?.mensagem;
      const oportunidade = data.oportunidades?.[0] ?? null;
      const ultimoEvento = data.timeline[0]?.nome;

      return buildResponse(
        'RESUMIR_BENEFICIARIO',
        `${data.beneficiario.nome} tem ${data.beneficiario.idade} anos, pertence à área ${data.beneficiario.area}, está em risco ${data.beneficiario.risco} com score ${data.beneficiario.score} e condição principal "${data.beneficiario.condicao}". ${alertaPrincipal ? `Alerta principal: ${alertaPrincipal}. ` : ''}${oportunidade ? `Há sinal de ${oportunidade.toLowerCase()}. ` : ''}${ultimoEvento ? `O evento mais recente relevante na timeline é ${ultimoEvento}.` : ''}`,
        [
          {
            type: 'beneficiario',
            id: data.beneficiario.id,
            label: data.beneficiario.nome,
            href: `/beneficiarios/${data.beneficiario.id}`,
          },
        ],
        ['Explique o score deste beneficiário', 'Quais alertas este beneficiário possui?']
      );
    }

    case 'EXPLICAR_ALERTAS': {
      if (!parsed.beneficiaryId) {
        return buildResponse(
          'NAO_ENTENDIDA',
          'Para explicar alertas, abra um beneficiário ou mencione o nome dele.',
          [],
          ['Resuma este beneficiário', 'Explique o score deste beneficiário']
        );
      }

      const alertas = getAlertsByBeneficiary(parsed.beneficiaryId);
      const resumo = getBeneficiarySummary(parsed.beneficiaryId);

      if (!resumo) {
        return buildResponse('NAO_ENTENDIDA', 'Não encontrei o beneficiário solicitado.');
      }

      if (alertas.length === 0) {
        return buildResponse(
          'EXPLICAR_ALERTAS',
          `${resumo.beneficiario.nome} não possui alertas adicionais gerados pela regra atual.`,
          [
            {
              type: 'beneficiario',
              id: resumo.beneficiario.id,
              label: resumo.beneficiario.nome,
              href: `/beneficiarios/${resumo.beneficiario.id}`,
            },
          ],
          ['Explique o score deste beneficiário']
        );
      }

      return buildResponse(
        'EXPLICAR_ALERTAS',
        `${resumo.beneficiario.nome} possui ${alertas.length} alerta(s): ${alertas
          .map((item) => `${item.tipo} — ${item.mensagem}`)
          .join(' | ')}.`,
        [
          {
            type: 'beneficiario',
            id: resumo.beneficiario.id,
            label: resumo.beneficiario.nome,
            href: `/beneficiarios/${resumo.beneficiario.id}`,
          },
          { type: 'rota', label: 'Abrir painel de alertas', href: '/alertas' },
        ],
        ['Explique o score deste beneficiário', 'Resuma este beneficiário']
      );
    }

    case 'NAO_ENTENDIDA':
    default:
      return buildResponse(
        'NAO_ENTENDIDA',
        'Ainda não entendi essa solicitação. Neste MVP, posso explicar score, resumir beneficiário, listar casos críticos, sem acompanhamento e oportunidades de eficiência.',
        [],
        [
          'Quais são os casos mais críticos?',
          'Quem está sem acompanhamento?',
          'Quais têm exame com possível redundância?',
        ]
      );
  }
}