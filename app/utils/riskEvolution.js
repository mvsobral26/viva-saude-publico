"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarEvolucaoRisco = gerarEvolucaoRisco;
const alerts_1 = require("./alerts");
const efficiency_1 = require("./efficiency");
function clamp(valor, min, max) {
    return Math.max(min, Math.min(max, valor));
}
function addDriver(drivers, driver) {
    const existente = drivers.find((item) => item.codigo === driver.codigo);
    if (existente) {
        existente.pontos = Math.max(existente.pontos, driver.pontos);
        existente.evidencias = Array.from(new Set([...existente.evidencias, ...driver.evidencias]));
        return;
    }
    drivers.push(driver);
}
function definirNivelPreRisco(score) {
    if (score >= 65)
        return 'Atenção imediata';
    if (score >= 40)
        return 'Pré-risco';
    if (score >= 20)
        return 'Monitorar';
    return 'Estável';
}
function definirJanela(probabilidade) {
    if (probabilidade >= 75)
        return '30 dias';
    if (probabilidade >= 60)
        return '60 dias';
    if (probabilidade >= 40)
        return '90 dias';
    return '120 dias';
}
function definirRiscoFuturo(probabilidade) {
    if (probabilidade >= 70)
        return 'Alto';
    if (probabilidade >= 40)
        return 'Médio';
    return 'Baixo';
}
function contarEventos(beneficiario, tipo, janelaDias) {
    return (beneficiario.eventos ?? []).filter((evento) => {
        if (evento.tipo !== tipo)
            return false;
        if (typeof janelaDias === 'number')
            return evento.diasAtras <= janelaDias;
        return true;
    });
}
function obterExamesRedundantes(beneficiario) {
    const exames = contarEventos(beneficiario, 'Exame').sort((a, b) => a.diasAtras - b.diasAtras);
    if (exames.length < 2)
        return [];
    const redundantes = new Set();
    for (let i = 0; i < exames.length - 1; i += 1) {
        const atual = exames[i];
        const proximo = exames[i + 1];
        if ((atual.nome ?? '').trim() && atual.nome === proximo.nome && Math.abs(atual.diasAtras - proximo.diasAtras) <= 15) {
            redundantes.add(i);
            redundantes.add(i + 1);
        }
    }
    return Array.from(redundantes).map((index) => exames[index]);
}
function obterMaiorGrupoCoincidente(beneficiario, janela = 30) {
    const eventos = [...(beneficiario.eventos ?? [])].sort((a, b) => a.diasAtras - b.diasAtras);
    if (eventos.length < 3)
        return [];
    let melhorGrupo = [];
    let inicio = 0;
    for (let fim = 0; fim < eventos.length; fim += 1) {
        while (inicio < fim && eventos[fim].diasAtras - eventsafe(eventos[inicio]?.diasAtras) > janela) {
            inicio += 1;
        }
        const grupoAtual = eventos.slice(inicio, fim + 1);
        if (grupoAtual.length > melhorGrupo.length) {
            melhorGrupo = grupoAtual;
        }
    }
    return melhorGrupo.length >= 3 ? melhorGrupo : [];
}
function eventsafe(valor) {
    return typeof valor === 'number' ? valor : 0;
}
function categoriaPrincipal(beneficiario, probabilidade) {
    const declaracao = beneficiario.declaracao;
    const doencas = declaracao.doencasPreexistentes;
    const imc = declaracao.dadosFisicos?.imc ?? 0;
    const oportunidade = (0, efficiency_1.identificarOportunidadeEficiencia)(beneficiario);
    const cardiovascularEstruturado = doencas?.cardiopatia === true ||
        doencas?.insuficienciaCardiaca === true ||
        doencas?.arritmia === true ||
        (declaracao.hipertensao &&
            (doencas?.obesidade === true || imc >= 30) &&
            declaracao.atividadeFisicaRegular === false);
    if (cardiovascularEstruturado)
        return 'Risco cardiovascular';
    if (declaracao.diabetes)
        return 'Descompensação metabólica';
    if (oportunidade === 'PA evitável' || oportunidade === 'Repetição assistencial')
        return 'Uso agudo evitável';
    const altaComplexidade = declaracao.tratamentosContinuos?.polifarmacia === true ||
        (beneficiario.medicamentos?.length ?? 0) >= 5 ||
        declaracao.internacaoRecente === true ||
        declaracao.internacoesExames?.internacaoUltimos30Dias === true ||
        doencas?.doencaRenalCronica === true ||
        doencas?.historicoOncologico === true;
    if (altaComplexidade)
        return 'Progressão de complexidade assistencial';
    if (probabilidade >= 60)
        return 'Escalada de custo provável';
    return 'Sem sinal relevante';
}
function gerarEvolucaoRisco(beneficiario) {
    const drivers = [];
    const declaracao = beneficiario.declaracao;
    const doencas = declaracao.doencasPreexistentes;
    const alertas = (0, alerts_1.gerarAlertas)(beneficiario);
    const oportunidade = (0, efficiency_1.identificarOportunidadeEficiencia)(beneficiario);
    if (declaracao.acompanhamentoRegular === false || beneficiario.ultimoEventoDias > 90) {
        addDriver(drivers, {
            codigo: 'sem_acompanhamento',
            label: 'Descontinuidade de acompanhamento',
            pontos: beneficiario.ultimoEventoDias > 180 ? 18 : 14,
            evidencias: [
                declaracao.acompanhamentoRegular === false ? 'Acompanhamento regular declarado como ausente' : 'Intervalo prolongado sem seguimento regular',
                `Último evento relevante há ${beneficiario.ultimoEventoDias} dia(s)`,
            ],
        });
    }
    const pa45 = contarEventos(beneficiario, 'Pronto atendimento', 45);
    if (pa45.length >= 2) {
        addDriver(drivers, {
            codigo: 'pronto_atendimento_recorrente',
            label: 'Uso recorrente de pronto atendimento',
            pontos: 16,
            evidencias: [`${pa45.length} passagem(ns) por pronto atendimento em até 45 dias`],
        });
    }
    const consultas120 = contarEventos(beneficiario, 'Consulta', 120);
    if (consultas120.length >= 3) {
        addDriver(drivers, {
            codigo: 'baixa_resolutividade',
            label: 'Baixa resolutividade assistencial',
            pontos: 12,
            evidencias: [`${consultas120.length} consulta(s) dentro da janela de 120 dias`],
        });
    }
    const repeticao30 = obterMaiorGrupoCoincidente(beneficiario, 30);
    if (repeticao30.length >= 3) {
        addDriver(drivers, {
            codigo: 'repeticao_assistencial',
            label: 'Recorrência assistencial em janela curta',
            pontos: 12,
            evidencias: [`${repeticao30.length} evento(s) concentrados em até 30 dias`],
        });
    }
    const redundantes = obterExamesRedundantes(beneficiario);
    if (redundantes.length >= 2) {
        const nomeExame = redundantes[0]?.nome ?? 'mesmo exame';
        addDriver(drivers, {
            codigo: 'redundancia_exames',
            label: 'Exame repetido em janela clínica curta',
            pontos: 8,
            evidencias: [`Redundância real de ${nomeExame} em até 15 dias`],
        });
    }
    const polifarmacia = declaracao.tratamentosContinuos?.polifarmacia === true || (beneficiario.medicamentos?.length ?? 0) >= 5;
    if (polifarmacia) {
        addDriver(drivers, {
            codigo: 'polifarmacia',
            label: 'Polifarmácia',
            pontos: 10,
            evidencias: [`${beneficiario.medicamentos.length} medicamento(s) ativos no histórico`],
        });
    }
    if (declaracao.internacaoRecente === true || declaracao.internacoesExames?.internacaoUltimos30Dias === true) {
        addDriver(drivers, {
            codigo: 'internacao_recente',
            label: 'Internação recente',
            pontos: 14,
            evidencias: ['Histórico recente de internação com potencial de reentrada ou maior complexidade'],
        });
    }
    if (declaracao.diabetes && declaracao.acompanhamentoRegular === false) {
        addDriver(drivers, {
            codigo: 'diabetes_sem_monitoramento',
            label: 'Diabetes sem acompanhamento regular',
            pontos: 14,
            evidencias: ['Condição crônica com seguimento irregular'],
        });
    }
    if (declaracao.hipertensao && declaracao.acompanhamentoRegular === false) {
        addDriver(drivers, {
            codigo: 'hipertensao_sem_monitoramento',
            label: 'Hipertensão sem acompanhamento regular',
            pontos: 10,
            evidencias: ['Condição cardiovascular/metabólica sem seguimento regular'],
        });
    }
    if (doencas?.cardiopatia || doencas?.insuficienciaCardiaca || doencas?.arritmia) {
        addDriver(drivers, {
            codigo: 'cardiopatia_ativa',
            label: 'Condição cardiovascular relevante',
            pontos: 16,
            evidencias: ['Declaração de cardiopatia, insuficiência cardíaca ou arritmia'],
        });
    }
    const imc = declaracao.dadosFisicos?.imc ?? 0;
    if (doencas?.obesidade || imc >= 30) {
        addDriver(drivers, {
            codigo: 'imc_elevado',
            label: 'IMC elevado / obesidade',
            pontos: 8,
            evidencias: [imc >= 30 ? `IMC informado em ${imc}` : 'Histórico compatível com obesidade'],
        });
    }
    if (declaracao.atividadeFisicaRegular === false) {
        addDriver(drivers, {
            codigo: 'sedentarismo',
            label: 'Sedentarismo',
            pontos: 6,
            evidencias: ['Ausência declarada de atividade física regular'],
        });
    }
    if (declaracao.tabagismo || declaracao.habitosVida?.fumante) {
        addDriver(drivers, {
            codigo: 'fumante',
            label: 'Tabagismo',
            pontos: 7,
            evidencias: ['Tabagismo declarado ou hábito ativo registrado'],
        });
    }
    if (declaracao.habitosVida?.estresseElevado) {
        addDriver(drivers, {
            codigo: 'estresse_elevado',
            label: 'Estresse elevado',
            pontos: 4,
            evidencias: ['Fator comportamental com potencial de piora de adesão e autocuidado'],
        });
    }
    const scorePreRisco = clamp(drivers.reduce((acc, item) => acc + item.pontos, 0), 0, 100);
    const nivelPreRisco = definirNivelPreRisco(scorePreRisco);
    const bonusAlertas = alertas.filter((alerta) => alerta.tipo === 'Crítico').length * 8 +
        alertas.filter((alerta) => alerta.tipo === 'Alto').length * 5 +
        alertas.filter((alerta) => alerta.tipo === 'Médio').length * 2;
    const bonusOportunidade = oportunidade === 'PA evitável'
        ? 10
        : oportunidade === 'Consulta com baixa resolutividade'
            ? 8
            : oportunidade === 'Repetição assistencial'
                ? 7
                : oportunidade === 'Exame com possível redundância'
                    ? 4
                    : 0;
    const probabilidadeRiscoFuturo = clamp(Math.round(beneficiario.score * 0.35 + scorePreRisco * 0.45 + bonusAlertas + bonusOportunidade), 0, 100);
    const riscoFuturo = definirRiscoFuturo(probabilidadeRiscoFuturo);
    const janelaRiscoFuturo = definirJanela(probabilidadeRiscoFuturo);
    const categoria = categoriaPrincipal(beneficiario, probabilidadeRiscoFuturo);
    const justificativaAnalitica = drivers.length > 0
        ? `Projeção sustentada por ${drivers
            .slice(0, 3)
            .map((item) => item.label.toLowerCase())
            .join(', ')}.`
        : 'Sem sinal relevante de progressão assistencial no horizonte analisado.';
    const recomendacaoPrimaria = categoria === 'Risco cardiovascular'
        ? 'Priorizar fluxo humano com acompanhamento cardiometabólico estruturado.'
        : categoria === 'Descompensação metabólica'
            ? 'Reforçar monitoramento glicêmico e adesão terapêutica.'
            : categoria === 'Uso agudo evitável'
                ? 'Atuar sobre coordenação do cuidado e acesso ambulatorial precoce.'
                : categoria === 'Progressão de complexidade assistencial'
                    ? 'Executar revisão clínica intensiva com gestão ativa do plano.'
                    : categoria === 'Escalada de custo provável'
                        ? 'Intervir preventivamente antes da intensificação de uso.'
                        : 'Manter prevenção, vigilância leve e rotina periódica.';
    return {
        nivelPreRisco,
        scorePreRisco,
        riscoFuturo,
        probabilidadeRiscoFuturo,
        janelaRiscoFuturo,
        categoriaPrincipal: categoria,
        drivers,
        justificativaAnalitica,
        recomendacaoPrimaria,
    };
}
