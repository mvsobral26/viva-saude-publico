"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obterEventosCoincidentesRepeticao = obterEventosCoincidentesRepeticao;
exports.identificarOportunidadeEficiencia = identificarOportunidadeEficiencia;
exports.listarOportunidadesEficiencia = listarOportunidadesEficiencia;
exports.obterResumoOportunidade = obterResumoOportunidade;
function contarEventos(eventos, tipo) {
    return eventos.filter((evento) => evento.tipo === tipo);
}
function existeJanelaCurta(eventos, janelaMaxima) {
    if (eventos.length < 2)
        return false;
    const ordenados = [...eventos].sort((a, b) => a.diasAtras - b.diasAtras);
    for (let i = 0; i < ordenados.length - 1; i += 1) {
        if (Math.abs(ordenados[i + 1].diasAtras - ordenados[i].diasAtras) <= janelaMaxima) {
            return true;
        }
    }
    return false;
}
function eventosEmJanela(eventos, janela) {
    return eventos.filter((evento) => evento.diasAtras <= janela);
}
function maiorGrupoCoincidente(eventos, janela) {
    if (eventos.length < 3)
        return [];
    const ordenados = [...eventos].sort((a, b) => a.diasAtras - b.diasAtras);
    let melhorGrupo = [];
    let inicio = 0;
    for (let fim = 0; fim < ordenados.length; fim += 1) {
        while (ordenados[fim].diasAtras - ordenados[inicio].diasAtras > janela) {
            inicio += 1;
        }
        const grupoAtual = ordenados.slice(inicio, fim + 1);
        if (grupoAtual.length > melhorGrupo.length ||
            (grupoAtual.length === melhorGrupo.length &&
                grupoAtual.length >= 3 &&
                grupoAtual[grupoAtual.length - 1].diasAtras - grupoAtual[0].diasAtras <
                    (melhorGrupo[melhorGrupo.length - 1]?.diasAtras ?? Infinity) -
                        (melhorGrupo[0]?.diasAtras ?? 0))) {
            melhorGrupo = grupoAtual;
        }
    }
    return melhorGrupo.length >= 3 ? melhorGrupo : [];
}
function obterEventosCoincidentesRepeticao(beneficiario) {
    return maiorGrupoCoincidente(beneficiario.eventos ?? [], 30);
}
function grupoRedundante(exames) {
    const grupos = exames.reduce((acc, exame) => {
        const key = (exame.nome ?? 'Exame').trim();
        acc[key] = acc[key] ? [...acc[key], exame] : [exame];
        return acc;
    }, {});
    let melhorNome = null;
    let melhorGrupo = [];
    Object.entries(grupos).forEach(([nome, grupo]) => {
        if (grupo.length >= 2 && existeJanelaCurta(grupo, 30)) {
            if (grupo.length > melhorGrupo.length) {
                melhorGrupo = grupo;
                melhorNome = nome;
            }
        }
    });
    return { nome: melhorNome, grupo: melhorGrupo };
}
function getCustoBase(tipo, score) {
    const multiplicador = Math.max(1, Math.round(score / 20));
    if (tipo === 'PA evitável')
        return 1450 + multiplicador * 430;
    if (tipo === 'Exame com possível redundância')
        return 980 + multiplicador * 330;
    if (tipo === 'Consulta com baixa resolutividade')
        return 760 + multiplicador * 260;
    return 900 + multiplicador * 270;
}
function getImpacto(tipo, score) {
    const base = tipo === 'PA evitável' ? 78 :
        tipo === 'Exame com possível redundância' ? 66 :
            tipo === 'Consulta com baixa resolutividade' ? 58 : 61;
    const ajuste = score >= 80 ? 3 : score <= 30 ? -2 : 0;
    return Math.max(45, Math.min(92, base + ajuste));
}
function getAcao(tipo) {
    if (tipo === 'PA evitável')
        return 'Retomar acompanhamento clínico estruturado';
    if (tipo === 'Exame com possível redundância')
        return 'Revisar indicação e evitar duplicidade';
    if (tipo === 'Consulta com baixa resolutividade')
        return 'Centralizar cuidado e definir plano assistencial';
    return 'Atuar para reduzir recorrência assistencial';
}
function montarFrequencia(tipo, eventos) {
    if (tipo === 'PA evitável') {
        const pa = eventosEmJanela(contarEventos(eventos, 'Pronto atendimento'), 45);
        return `${pa.length} ida(s) ao PA em até 45 dias`;
    }
    if (tipo === 'Exame com possível redundância') {
        const redundante = grupoRedundante(contarEventos(eventos, 'Exame'));
        return `${redundante.grupo.length} ocorrência(s) de ${redundante.nome ?? 'exame repetido'} em até 30 dias`;
    }
    if (tipo === 'Consulta com baixa resolutividade') {
        const consultas = eventosEmJanela(contarEventos(eventos, 'Consulta'), 120);
        return `${consultas.length} consulta(s) em até 120 dias`;
    }
    const janela30 = maiorGrupoCoincidente(eventos, 30);
    return `${janela30.length} evento(s) coincidentes em até 30 dias`;
}
function identificarOportunidadeEficiencia(beneficiario) {
    const eventos = beneficiario.eventos ?? [];
    const pa = contarEventos(eventos, 'Pronto atendimento');
    const exames = contarEventos(eventos, 'Exame');
    const consultas = contarEventos(eventos, 'Consulta');
    const redundante = grupoRedundante(exames);
    if (redundante.grupo.length >= 2)
        return 'Exame com possível redundância';
    const pa45 = eventosEmJanela(pa, 45);
    if (pa45.length >= 2)
        return 'PA evitável';
    const consultas120 = eventosEmJanela(consultas, 120);
    if (consultas120.length >= 3)
        return 'Consulta com baixa resolutividade';
    const janela30 = maiorGrupoCoincidente(eventos, 30);
    if (janela30.length >= 3)
        return 'Repetição assistencial';
    return null;
}
function gerarOportunidade(beneficiario, tipo) {
    return {
        id: `${beneficiario.id}-${tipo.toLowerCase().replace(/[^a-z0-9]+/gi, '-')}`,
        beneficiarioId: String(beneficiario.id),
        nome: beneficiario.nome,
        area: beneficiario.area,
        score: beneficiario.score,
        risco: beneficiario.risco,
        tipo,
        frequencia: montarFrequencia(tipo, beneficiario.eventos ?? []),
        custo: getCustoBase(tipo, beneficiario.score),
        impacto: getImpacto(tipo, beneficiario.score),
        acao: getAcao(tipo),
    };
}
function listarOportunidadesEficiencia(beneficiarios) {
    return beneficiarios
        .map((beneficiario) => {
        const tipo = identificarOportunidadeEficiencia(beneficiario);
        if (!tipo)
            return null;
        return gerarOportunidade(beneficiario, tipo);
    })
        .filter((item) => item !== null);
}
function obterResumoOportunidade(beneficiario) {
    const tipo = identificarOportunidadeEficiencia(beneficiario);
    if (!tipo)
        return null;
    const oportunidade = gerarOportunidade(beneficiario, tipo);
    const eventos = beneficiario.eventos ?? [];
    if (tipo === 'PA evitável') {
        const pa45 = eventosEmJanela(contarEventos(eventos, 'Pronto atendimento'), 45);
        return {
            ...oportunidade,
            justificativa: `O histórico mostra ${pa45.length} passagem(ns) por pronto atendimento dentro da janela crítica de 45 dias, sugerindo oportunidade de reforçar seguimento ambulatorial e reduzir uso evitável da rede.`,
        };
    }
    if (tipo === 'Exame com possível redundância') {
        const redundante = grupoRedundante(contarEventos(eventos, 'Exame'));
        return {
            ...oportunidade,
            justificativa: `Há repetição real de ${redundante.nome ?? 'um mesmo exame'} em janela clínica curta de até 30 dias, com oportunidade concreta de revisar indicação, sequência diagnóstica e reduzir duplicidade.`,
        };
    }
    if (tipo === 'Consulta com baixa resolutividade') {
        const consultas120 = eventosEmJanela(contarEventos(eventos, 'Consulta'), 120);
        return {
            ...oportunidade,
            justificativa: `O histórico reúne ${consultas120.length} consulta(s) dentro de 120 dias, com manutenção de criticidade operacional e indício de baixa resolutividade assistencial.`,
        };
    }
    const janela30 = maiorGrupoCoincidente(eventos, 30);
    const linhas = Array.from(new Set(janela30.map((evento) => evento.especialidadeAssistencial).filter(Boolean)));
    const complementoLinhas = linhas.length === 1
        ? ` no eixo de ${linhas[0]}`
        : linhas.length > 1
            ? ` atravessando ${linhas.join(', ')}`
            : '';
    return {
        ...oportunidade,
        justificativa: `Há ${janela30.length} evento(s) coincidentes na janela fixa de 30 dias${complementoLinhas}, com oportunidade de melhor coordenação para reduzir repetição e racionalizar a jornada de cuidado.`,
    };
}
