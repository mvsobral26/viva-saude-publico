import type { Beneficiario, DeclaracaoSaude, EspecialidadeAssistencial, EventoMedico, Medicamento, Usuario } from '../types';

export const usuariosMock: Usuario[] = [
  {
    id: 1,
    nome: 'Marcus Sobral',
    email: 'fiap@vivamais.com.br',
    senha: '123456',
    precisa2FA: true,
    codigo2FA: '123456',
    perfil: 'Administrador',
  },
];

type PerfilMock =
  | 'REDUNDANCIA_EXAME'
  | 'PA_EVITAVEL'
  | 'CONSULTA_BAIXA_RESOL'
  | 'REPETICAO_ASSISTENCIAL'
  | 'ESTAVEL';

type CategoriaExame =
  | 'cardio'
  | 'metabolico'
  | 'respiratorio'
  | 'renal'
  | 'neuro'
  | 'onco'
  | 'ortho'
  | 'geral';

const AREAS = [
  'Marketing', 'RH', 'Projetos', 'TI', 'Operações', 'Logística',
  'Comercial', 'Qualidade', 'Financeiro', 'Compras', 'Atendimento', 'Jurídico',
] as const;

const NOMES = [
  'Marcelo', 'Alexandre', 'Raquel', 'Aline', 'Cristiane', 'Juliana', 'Fernanda', 'Gabriela',
  'Priscila', 'Felipe', 'Simone', 'Diego', 'Patrícia', 'Paulo', 'Tatiane', 'Helena',
  'Lívia', 'Roberto', 'Amanda', 'Renato', 'Camila', 'Murilo', 'Bruno', 'Beatriz',
  'Carlos', 'Rodrigo', 'Débora', 'Vanessa', 'Henrique', 'Leonardo', 'Bianca', 'Tatiana',
  'Isabela', 'Larissa', 'Mariana', 'Natália', 'Renata', 'Clarissa', 'Sabrina', 'Luana',
  'Viviane', 'Mirela', 'Carolina', 'Lorena', 'Evelyn', 'Mônica', 'Talita', 'Yasmin',
  'Jéssica', 'Nádia', 'Cecília', 'Gustavo', 'Thiago', 'Eduardo', 'Ricardo', 'Vinícius',
  'Caio', 'Rafael', 'Daniel', 'Jonathan', 'André', 'Fábio', 'Otávio', 'Leandro',
  'Márcio', 'Ivan', 'João', 'Mateus', 'Vitor', 'Samuel', 'Igor', 'César',
] as const;

const SOBRENOMES_1 = [
  'Oliveira', 'Costa', 'Ribeiro', 'Martins', 'Alves', 'Souza', 'Freitas', 'Batista',
  'Macedo', 'Nogueira', 'Araújo', 'Pires', 'Barros', 'Fonseca', 'Prado', 'Moreira',
  'Cardoso', 'Moura', 'Rezende', 'Cavalcanti',
] as const;

const SOBRENOMES_2 = [
  'Melo', 'Vieira', 'Teixeira', 'Campos', 'Duarte', 'Rocha', 'Santos', 'Silva',
  'Lima', 'Carvalho', 'Antunes', 'Torres', 'Gomes', 'Moraes', 'Justino', 'Monteiro',
  'Farias', 'Queiroz', 'Peixoto', 'Tavares',
] as const;

const CONSULTAS = [
  'Clínico geral', 'Cardiologia', 'Endocrinologia', 'Gastroenterologia', 'Ortopedia',
  'Pneumologia', 'Nefrologia', 'Neurologia', 'Oncologia', 'Reumatologia',
] as const;

const PROCEDIMENTOS = [
  'Aplicação medicamentosa', 'Endoscopia', 'Colonoscopia', 'Infiltração ambulatorial',
  'Curativo especializado', 'Pequeno procedimento ambulatorial',
] as const;

const PA_MOTIVOS = [
  'Dor torácica', 'Dor abdominal', 'Falta de ar', 'Cefaleia', 'Tontura', 'Dor lombar',
] as const;

const EXAMES: Record<CategoriaExame, readonly string[]> = {
  cardio: ['Ecocardiograma', 'Eletrocardiograma', 'Teste ergométrico', 'Holter 24h', 'MAPA 24h'],
  metabolico: ['Hemoglobina glicada', 'Glicemia em jejum', 'Perfil lipídico', 'Insulina basal', 'Hemograma completo'],
  respiratorio: ['Tomografia de tórax', 'Raio-X de tórax', 'Espirometria', 'Gasometria arterial'],
  renal: ['Creatinina sérica', 'Ureia', 'Urina tipo I', 'Microalbuminúria'],
  neuro: ['Ressonância de crânio', 'Tomografia de crânio', 'Eletroencefalograma', 'Doppler de carótidas'],
  onco: ['Tomografia computadorizada', 'Marcadores tumorais', 'PET-CT', 'Biópsia guiada por imagem'],
  ortho: ['Raio-X de coluna', 'Ressonância lombar', 'Ultrassom de ombro', 'Densitometria óssea', 'Raio-X de joelho'],
  geral: ['Ultrassom abdominal', 'Ecografia pélvica', 'Ultrassom de abdome total', 'Hemograma completo'],
};

const ESPECIALIDADE_POR_CATEGORIA: Record<CategoriaExame, EspecialidadeAssistencial> = {
  cardio: 'Cardiologia',
  metabolico: 'Endocrinologia',
  respiratorio: 'Pneumologia',
  renal: 'Nefrologia',
  neuro: 'Neurologia',
  onco: 'Oncologia',
  ortho: 'Ortopedia',
  geral: 'Clínica geral',
};

const PROCEDIMENTOS_POR_ESPECIALIDADE: Record<EspecialidadeAssistencial, readonly string[]> = {
  Cardiologia: ['Aplicação medicamentosa', 'Pequeno procedimento ambulatorial'],
  Endocrinologia: ['Aplicação medicamentosa', 'Curativo especializado'],
  Pneumologia: ['Aplicação medicamentosa', 'Curativo especializado'],
  Nefrologia: ['Aplicação medicamentosa', 'Curativo especializado'],
  Neurologia: ['Pequeno procedimento ambulatorial', 'Aplicação medicamentosa'],
  Oncologia: ['Aplicação medicamentosa', 'Curativo especializado'],
  Ortopedia: ['Infiltração ambulatorial', 'Pequeno procedimento ambulatorial'],
  Gastroenterologia: ['Endoscopia', 'Colonoscopia'],
  'Clínica geral': ['Curativo especializado', 'Pequeno procedimento ambulatorial'],
};

const CONSULTAS_POR_ESPECIALIDADE: Record<EspecialidadeAssistencial, readonly string[]> = {
  Cardiologia: ['Cardiologia', 'Clínico geral'],
  Endocrinologia: ['Endocrinologia', 'Clínico geral'],
  Pneumologia: ['Pneumologia', 'Clínico geral'],
  Nefrologia: ['Nefrologia', 'Clínico geral'],
  Neurologia: ['Neurologia', 'Clínico geral'],
  Oncologia: ['Oncologia', 'Clínico geral'],
  Ortopedia: ['Ortopedia', 'Reumatologia'],
  Gastroenterologia: ['Gastroenterologia', 'Clínico geral'],
  'Clínica geral': ['Clínico geral', 'Gastroenterologia'],
};

const EXAMES_POR_ESPECIALIDADE: Partial<Record<EspecialidadeAssistencial, CategoriaExame>> = {
  Cardiologia: 'cardio',
  Endocrinologia: 'metabolico',
  Pneumologia: 'respiratorio',
  Nefrologia: 'renal',
  Neurologia: 'neuro',
  Oncologia: 'onco',
  Ortopedia: 'ortho',
  Gastroenterologia: 'geral',
  'Clínica geral': 'geral',
};

function hash(seed: number) {
  const x = Math.sin(seed * 999) * 10000;
  return x - Math.floor(x);
}

function randInt(seed: number, min: number, max: number) {
  return Math.floor(hash(seed) * (max - min + 1)) + min;
}

function pick<T>(arr: readonly T[], seed: number): T {
  return arr[randInt(seed, 0, arr.length - 1)];
}

function maybe(seed: number, threshold: number) {
  return hash(seed) < threshold;
}

function cpfFromId(id: number) {
  return `100000000${String(id).padStart(2, '0')}`;
}

function buildNome(id: number) {
  return `${pick(NOMES, id)} ${pick(SOBRENOMES_1, id * 3)} ${pick(SOBRENOMES_2, id * 7)}`;
}

function buildDeclaracao(id: number): DeclaracaoSaude {
  const diabetes = maybe(id * 11, 0.22);
  const hipertensao = maybe(id * 13, 0.28);
  const obesidade = maybe(id * 17, 0.20);
  const tabagismo = maybe(id * 19, 0.10);
  const alcoolFrequente = maybe(id * 23, 0.12);
  const atividadeFisicaRegular = !maybe(id * 29, 0.35);
  const internacaoRecente = maybe(id * 31, 0.08);
  const acompanhamentoRegular = !maybe(id * 37, 0.22);

  const autoavaliacaoSaude: 'Boa' | 'Regular' | 'Ruim' =
    maybe(id * 41, 0.12) ? 'Ruim' : maybe(id * 43, 0.28) ? 'Regular' : 'Boa';

  return {
    hipertensao,
    diabetes,
    tabagismo,
    alcoolFrequente,
    atividadeFisicaRegular,
    internacaoRecente,
    acompanhamentoRegular,
    doencasPreexistentes: {
      hipertensao,
      diabetes,
      obesidade,
      cardiopatia: maybe(id * 47, 0.10),
      insuficienciaCardiaca: maybe(id * 53, 0.06),
      arritmia: maybe(id * 59, 0.06),
      asma: maybe(id * 61, 0.08),
      bronquite: maybe(id * 67, 0.06),
      dpoc: maybe(id * 71, 0.04),
      doencaRenalCronica: maybe(id * 73, 0.07),
      historicoOncologico: maybe(id * 79, 0.05),
      tumorBenigno: maybe(id * 83, 0.04),
      parkinson: maybe(id * 89, 0.02),
      alzheimer: maybe(id * 97, 0.02),
      epilepsia: maybe(id * 101, 0.02),
      doencaNeurologica: maybe(id * 103, 0.05),
      depressao: maybe(id * 107, 0.09),
      ansiedade: maybe(id * 109, 0.12),
      doencaAutoimune: maybe(id * 113, 0.03),
      hiv: maybe(id * 127, 0.01),
      herniaDeDisco: maybe(id * 131, 0.06),
      artrose: maybe(id * 137, 0.06),
      artrite: maybe(id * 139, 0.05),
      osteoporose: maybe(id * 149, 0.04),
    },
    habitosVida: {
      tabagismo,
      alcoolFrequente,
      atividadeFisicaRegular,
      sonoAdequado: !maybe(id * 151, 0.30),
      estresseElevado: maybe(id * 157, 0.32),
    },
    internacoesExames: {
      internacaoRecente,
      acompanhamentoRegular,
      acompanhamentoMedicoAtual: acompanhamentoRegular,
      prontoAtendimentoRecorrente: maybe(id * 163, 0.18),
      exameComplexoRecente: maybe(id * 167, 0.20),
      tomografiaRecente: maybe(id * 173, 0.10),
      ressonanciaRecente: maybe(id * 179, 0.09),
      biopsiaRecente: maybe(id * 181, 0.03),
    },
    dadosFisicos: {
      pesoKg: randInt(id * 191, 56, 104),
      alturaM: +(1.50 + hash(id * 193) * 0.40).toFixed(2),
      imc: +(randInt(id * 197, 20, 36) + hash(id * 199)).toFixed(1),
    },
    tratamentosContinuos: {
      usaMedicacaoContinua: diabetes || hipertensao || obesidade,
      polifarmacia: maybe(id * 211, 0.12),
      insulinoterapia: diabetes && maybe(id * 223, 0.35),
      anticoagulante: maybe(id * 227, 0.05),
      imunossupressor: maybe(id * 229, 0.03),
      tratamentoOncologicoAtual: maybe(id * 233, 0.02),
    },
    percepcaoSaude: {
      dorCronica: maybe(id * 239, 0.14),
      limitacaoMobilidade: maybe(id * 241, 0.08),
      fadigaRecorrente: maybe(id * 251, 0.16),
      autoavaliacaoSaude,
    },
  };
}

function buildCondicao(_: number, declaracao: DeclaracaoSaude) {
  const condicoes: string[] = [];
  if (declaracao.doencasPreexistentes?.diabetes) condicoes.push('Diabetes');
  if (declaracao.doencasPreexistentes?.hipertensao) condicoes.push('Hipertensão');
  if (declaracao.doencasPreexistentes?.obesidade) condicoes.push('Obesidade');
  if (declaracao.doencasPreexistentes?.doencaRenalCronica) condicoes.push('Doença renal crônica');
  if (declaracao.doencasPreexistentes?.asma || declaracao.doencasPreexistentes?.dpoc) condicoes.push('Condição respiratória crônica');
  if (declaracao.doencasPreexistentes?.historicoOncologico) condicoes.push('Histórico oncológico em seguimento');
  if (declaracao.doencasPreexistentes?.doencaNeurologica) condicoes.push('Condição neurológica crônica');
  if (
    declaracao.doencasPreexistentes?.herniaDeDisco ||
    declaracao.doencasPreexistentes?.artrose ||
    declaracao.doencasPreexistentes?.artrite
  ) condicoes.push('Condição osteomuscular crônica');
  return condicoes.length === 0 ? 'Perfil preventivo e estável' : condicoes.join(', ');
}

function inferExamCategory(condicao: string, declaracao: DeclaracaoSaude): CategoriaExame {
  const c = condicao.toLowerCase();
  if (c.includes('oncol') || declaracao.doencasPreexistentes?.historicoOncologico) return 'onco';
  if (c.includes('neurol') || declaracao.doencasPreexistentes?.doencaNeurologica) return 'neuro';
  if (c.includes('renal') || declaracao.doencasPreexistentes?.doencaRenalCronica) return 'renal';
  if (c.includes('respirat') || declaracao.doencasPreexistentes?.asma || declaracao.doencasPreexistentes?.dpoc) return 'respiratorio';
  if (c.includes('osteo') || c.includes('lomb') || c.includes('artr') || c.includes('artro')) return 'ortho';
  if (c.includes('diabetes') || c.includes('obesidade') || declaracao.diabetes || declaracao.doencasPreexistentes?.obesidade) return 'metabolico';
  if (c.includes('hipertens')) return 'cardio';
  if (declaracao.doencasPreexistentes?.cardiopatia || declaracao.doencasPreexistentes?.insuficienciaCardiaca) return 'cardio';
  return 'geral';
}

function buildMedicamentos(id: number, declaracao: DeclaracaoSaude): Medicamento[] {
  const meds: Medicamento[] = [];
  if (declaracao.doencasPreexistentes?.hipertensao) meds.push({ nome: 'Losartana', classe: 'Anti-hipertensivo' });
  if (declaracao.doencasPreexistentes?.diabetes) meds.push({ nome: 'Metformina', classe: 'Antidiabético' });
  if (declaracao.doencasPreexistentes?.obesidade && maybe(id * 263, 0.55)) meds.push({ nome: 'Orlistate', classe: 'Controle metabólico' });
  if (maybe(id * 269, 0.40)) meds.push({ nome: 'Sinvastatina', classe: 'Estatina' });
  if (maybe(id * 271, 0.18)) meds.push({ nome: 'Omeprazol', classe: 'Gastroprotetor' });
  if (maybe(id * 277, 0.15)) meds.push({ nome: 'AAS', classe: 'Antiagregante' });
  if (maybe(id * 281, 0.08)) meds.push({ nome: 'Furosemida', classe: 'Diurético' });
  return meds.slice(0, 6);
}

function ev(
  tipo: EventoMedico['tipo'],
  diasAtras: number,
  nome?: string,
  categoria?: string,
  status: 'Realizado' | 'Agendado' = 'Realizado',
  especialidadeAssistencial?: EspecialidadeAssistencial
): EventoMedico {
  return { tipo, diasAtras, nome, categoria, status, especialidadeAssistencial };
}

function linhaAssistencialBase(category: CategoriaExame, id: number): EspecialidadeAssistencial {
  if (category === 'geral') {
    return id % 2 === 0 ? 'Gastroenterologia' : 'Clínica geral';
  }
  return ESPECIALIDADE_POR_CATEGORIA[category];
}

function consultaParaLinha(linha: EspecialidadeAssistencial, seed: number) {
  return pick(CONSULTAS_POR_ESPECIALIDADE[linha], seed);
}

function procedimentoParaLinha(linha: EspecialidadeAssistencial, seed: number) {
  return pick(PROCEDIMENTOS_POR_ESPECIALIDADE[linha], seed);
}

function exameParaLinha(linha: EspecialidadeAssistencial, fallback: CategoriaExame, seed: number) {
  const categoria = EXAMES_POR_ESPECIALIDADE[linha] ?? fallback;
  return {
    nome: examName(categoria, seed),
    categoria,
  };
}

function examName(category: CategoriaExame, seed: number) {
  return pick(EXAMES[category], seed);
}

function buildPerfil(id: number): PerfilMock {
  const value = hash(id * 307);
  if (value < 0.18) return 'REDUNDANCIA_EXAME';
  if (value < 0.36) return 'PA_EVITAVEL';
  if (value < 0.56) return 'CONSULTA_BAIXA_RESOL';
  if (value < 0.74) return 'REPETICAO_ASSISTENCIAL';
  return 'ESTAVEL';
}

function buildEventos(id: number, perfil: PerfilMock, category: CategoriaExame): EventoMedico[] {
  const repeated = examName(category, id * 311 + 1);
  const alt1 = examName(category, id * 313 + 2);
  const alt2 = examName(category, id * 317 + 3);

  if (perfil === 'REDUNDANCIA_EXAME') {
    const variant = randInt(id * 331, 0, 3);
    if (variant === 0) return [
      ev('Consulta', randInt(id * 337, 78, 106), pick(CONSULTAS, id + 1), 'Ambulatorial'),
      ev('Consulta', randInt(id * 347, 18, 38), pick(CONSULTAS, id + 2), 'Ambulatorial'),
      ev('Exame', randInt(id * 349, 22, 30), alt1, category),
      ev('Exame', randInt(id * 353, 10, 15), repeated, category),
      ev('Exame', randInt(id * 359, 1, 7), repeated, category),
      ev('Procedimento', randInt(id * 367, 46, 74), pick(PROCEDIMENTOS, id + 3), 'Procedimento'),
    ];
    if (variant === 1) return [
      ev('Consulta', randInt(id * 373, 70, 95), pick(CONSULTAS, id + 4), 'Ambulatorial'),
      ev('Consulta', randInt(id * 379, 8, 24), pick(CONSULTAS, id + 5), 'Ambulatorial'),
      ev('Exame', randInt(id * 383, 24, 29), repeated, category),
      ev('Exame', randInt(id * 389, 11, 16), repeated, category),
      ev('Exame', randInt(id * 397, 38, 62), alt2, category),
      ev('Pronto atendimento', randInt(id * 401, 47, 58), `PA - ${pick(PA_MOTIVOS, id + 6)}`, 'Urgência'),
    ];
    if (variant === 2) return [
      ev('Consulta', randInt(id * 409, 82, 112), pick(CONSULTAS, id + 7), 'Ambulatorial'),
      ev('Exame', randInt(id * 419, 20, 28), repeated, category),
      ev('Exame', randInt(id * 421, 6, 13), repeated, category),
      ev('Exame', randInt(id * 431, 47, 75), alt1, category),
      ev('Exame', randInt(id * 433, 76, 110), alt2, category),
      ev('Procedimento', randInt(id * 439, 20, 40), pick(PROCEDIMENTOS, id + 8), 'Procedimento'),
      ev('Procedimento', randInt(id * 443, 58, 82), pick(PROCEDIMENTOS, id + 9), 'Procedimento'),
    ];
    return [
      ev('Consulta', randInt(id * 449, 74, 100), pick(CONSULTAS, id + 10), 'Ambulatorial'),
      ev('Consulta', randInt(id * 457, 28, 44), pick(CONSULTAS, id + 11), 'Ambulatorial'),
      ev('Consulta', randInt(id * 461, 4, 12), pick(CONSULTAS, id + 12), 'Ambulatorial'),
      ev('Exame', randInt(id * 463, 24, 29), repeated, category),
      ev('Exame', randInt(id * 467, 9, 15), repeated, category),
      ev('Exame', randInt(id * 479, 48, 70), alt1, category),
      ev('Internação', randInt(id * 487, 82, 104), 'Internação clínica', 'Hospitalar'),
    ];
  }

  if (perfil === 'PA_EVITAVEL') {
    const count = randInt(id * 491, 2, 4);
    const bases = [42, 21, 9, 3];
    const events: EventoMedico[] = [
      ev('Consulta', randInt(id * 499, 78, 102), pick(CONSULTAS, id + 13), 'Ambulatorial'),
      ev('Consulta', randInt(id * 503, 19, 39), pick(CONSULTAS, id + 14), 'Ambulatorial'),
      ev('Exame', randInt(id * 509, 46, 70), examName(category, id + 15), category),
    ];
    for (let i = 0; i < count; i += 1) {
      events.push(ev('Pronto atendimento', bases[i] + randInt(id * (521 + i), 0, 2), `PA - ${pick(PA_MOTIVOS, id + i)}`, 'Urgência'));
    }
    return events;
  }

  if (perfil === 'CONSULTA_BAIXA_RESOL') {
    const count = randInt(id * 541, 3, 5);
    const bases = [116, 82, 47, 18, 4];
    const events: EventoMedico[] = [
      ev('Exame', randInt(id * 547, 22, 34), examName(category, id + 16), category),
      ev('Exame', randInt(id * 557, 55, 78), examName(category, id + 17), category),
    ];
    for (let i = 0; i < count; i += 1) {
      events.push(ev('Consulta', bases[i] + randInt(id * (563 + i), 0, 3), pick(CONSULTAS, id + 18 + i), 'Ambulatorial'));
    }
    return events;
  }

  if (perfil === 'REPETICAO_ASSISTENCIAL') {
    const linhaPrincipal = linhaAssistencialBase(category, id);
    const linhaSecundaria =
      linhaPrincipal === 'Cardiologia' ? 'Endocrinologia'
      : linhaPrincipal === 'Ortopedia' ? 'Clínica geral'
      : linhaPrincipal === 'Oncologia' ? 'Clínica geral'
      : linhaPrincipal === 'Gastroenterologia' ? 'Clínica geral'
      : 'Clínica geral';

    const examePrincipalA = exameParaLinha(linhaPrincipal, category, id * 571 + 1);
    const examePrincipalB = exameParaLinha(linhaPrincipal, category, id * 571 + 2);
    const exameSecundario = exameParaLinha(linhaSecundaria, category, id * 571 + 3);
    const variant = randInt(id * 571, 0, 5);

    if (variant === 0) return [
      ev('Consulta', 28, consultaParaLinha(linhaPrincipal, id + 23), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Procedimento', 19, procedimentoParaLinha(linhaPrincipal, id + 24), 'Procedimento', 'Realizado', linhaPrincipal),
      ev('Exame', 9, examePrincipalA.nome, examePrincipalA.categoria, 'Realizado', linhaPrincipal),
      ev('Consulta', randInt(id * 577, 61, 86), consultaParaLinha(linhaSecundaria, id + 25), 'Ambulatorial', 'Realizado', linhaSecundaria),
    ];

    if (variant === 1) return [
      ev('Consulta', 29, consultaParaLinha(linhaPrincipal, id + 26), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Pronto atendimento', 21, `PA - ${pick(PA_MOTIVOS, id + 2)}`, 'Urgência', 'Realizado', linhaPrincipal),
      ev('Procedimento', 12, procedimentoParaLinha(linhaPrincipal, id + 27), 'Procedimento', 'Realizado', linhaPrincipal),
      ev('Exame', 4, examePrincipalA.nome, examePrincipalA.categoria, 'Realizado', linhaPrincipal),
      ev('Exame', randInt(id * 587, 58, 79), exameSecundario.nome, exameSecundario.categoria, 'Realizado', linhaSecundaria),
    ];

    if (variant === 2) return [
      ev('Exame', 27, examePrincipalA.nome, examePrincipalA.categoria, 'Realizado', linhaPrincipal),
      ev('Consulta', 22, consultaParaLinha(linhaPrincipal, id + 29), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Procedimento', 14, procedimentoParaLinha(linhaPrincipal, id + 30), 'Procedimento', 'Realizado', linhaPrincipal),
      ev('Consulta', 5, consultaParaLinha(linhaSecundaria, id + 31), 'Ambulatorial', 'Realizado', linhaSecundaria),
      ev('Internação', randInt(id * 593, 83, 106), 'Internação clínica', 'Hospitalar', 'Realizado', linhaSecundaria),
    ];

    if (variant === 3) return [
      ev('Consulta', 30, consultaParaLinha(linhaPrincipal, id + 32), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Exame', 24, examePrincipalA.nome, examePrincipalA.categoria, 'Realizado', linhaPrincipal),
      ev('Procedimento', 17, procedimentoParaLinha(linhaPrincipal, id + 33), 'Procedimento', 'Realizado', linhaPrincipal),
      ev('Consulta', 8, consultaParaLinha(linhaPrincipal, id + 34), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Exame', randInt(id * 599, 73, 98), exameSecundario.nome, exameSecundario.categoria, 'Realizado', linhaSecundaria),
    ];

    if (variant === 4) return [
      ev('Consulta', 26, consultaParaLinha(linhaPrincipal, id + 35), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Pronto atendimento', 18, `PA - ${pick(PA_MOTIVOS, id + 3)}`, 'Urgência', 'Realizado', linhaSecundaria),
      ev('Exame', 11, examePrincipalA.nome, examePrincipalA.categoria, 'Realizado', linhaPrincipal),
      ev('Procedimento', 6, procedimentoParaLinha(linhaPrincipal, id + 36), 'Procedimento', 'Realizado', linhaPrincipal),
      ev('Consulta', randInt(id * 601, 88, 114), consultaParaLinha(linhaSecundaria, id + 37), 'Ambulatorial', 'Realizado', linhaSecundaria),
      ev('Exame', randInt(id * 607, 64, 92), examePrincipalB.nome, examePrincipalB.categoria, 'Realizado', linhaPrincipal),
    ];

    return [
      ev('Consulta', 25, consultaParaLinha(linhaPrincipal, id + 38), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Exame', 20, examePrincipalA.nome, examePrincipalA.categoria, 'Realizado', linhaPrincipal),
      ev('Procedimento', 13, procedimentoParaLinha(linhaPrincipal, id + 39), 'Procedimento', 'Realizado', linhaPrincipal),
      ev('Consulta', 7, consultaParaLinha(linhaPrincipal, id + 40), 'Ambulatorial', 'Realizado', linhaPrincipal),
      ev('Exame', 2, examePrincipalB.nome, examePrincipalB.categoria, 'Realizado', linhaPrincipal),
      ev('Consulta', randInt(id * 613, 67, 96), consultaParaLinha(linhaSecundaria, id + 41), 'Ambulatorial', 'Realizado', linhaSecundaria),
    ];
  }

  const events: EventoMedico[] = [
    ev('Consulta', randInt(id * 607, 64, 90), pick(CONSULTAS, id + 34), 'Ambulatorial'),
    ev('Exame', randInt(id * 613, 18, 38), examName(category, id + 35), category),
  ];
  if (maybe(id * 617, 0.35)) events.push(ev('Consulta', randInt(id * 619, 4, 12), pick(CONSULTAS, id + 36), 'Ambulatorial'));
  if (maybe(id * 631, 0.20)) events.push(ev('Procedimento', randInt(id * 641, 54, 80), pick(PROCEDIMENTOS, id + 5), 'Procedimento'));
  return events;
}

function calcularScore(id: number, declaracao: DeclaracaoSaude, eventos: EventoMedico[], medicamentos: Medicamento[]) {
  let score = 8;
  if (declaracao.doencasPreexistentes?.diabetes) score += 16;
  if (declaracao.doencasPreexistentes?.hipertensao) score += 14;
  if (declaracao.doencasPreexistentes?.obesidade) score += 12;
  if (!declaracao.atividadeFisicaRegular) score += 10;
  if (!declaracao.acompanhamentoRegular) score += 10;
  if (declaracao.internacaoRecente) score += 14;
  if (declaracao.tabagismo) score += 8;
  if (eventos.filter((e) => e.tipo === 'Pronto atendimento').length >= 2) score += 12;
  if (eventos.filter((e) => e.tipo === 'Exame').length >= 3) score += 8;
  if (medicamentos.length >= 4) score += 8;
  if (declaracao.percepcaoSaude?.autoavaliacaoSaude === 'Ruim') score += 10;
  return Math.min(100, Math.round(score));
}

function calcularRisco(score: number): 'Alto' | 'Médio' | 'Baixo' {
  if (score >= 72) return 'Alto';
  if (score >= 42) return 'Médio';
  return 'Baixo';
}

function buildStatus(score: number, id: number) {
  if (score >= 90) return 'Atenção imediata';
  if (score >= 75) return 'Monitoramento intensivo';
  if (score >= 55) return pick(['Monitoramento pendente', 'Acompanhamento pendente', 'Sem acompanhamento'], id);
  return pick(['Em dia', 'Monitoramento pendente', 'Acompanhamento pendente'], id);
}

function buildAlerta(score: number, condicao: string) {
  if (score >= 85) return 'Alto custo potencial no curto prazo';
  if (condicao.includes('Diabetes')) return 'Diabetes sem acompanhamento regular';
  if (condicao.includes('Hipertensão')) return 'Hipertensão sem acompanhamento regular';
  if (condicao.includes('Obesidade')) return 'Sedentarismo declarado';
  return 'Perfil estável, manter prevenção';
}

function calcularTransferenciasRisco(totalMedio: number, totalBaixo: number) {
  return {
    doMedioParaAlto: Math.round(totalMedio * 0.15),
    doBaixoParaAlto: Math.round(totalBaixo * 0.19),
  };
}

function contarEventosPorTipo(eventos: EventoMedico[], tipo: EventoMedico['tipo']) {
  return eventos.filter((evento) => evento.tipo === tipo);
}

function existeGrupoExameRedundante(eventos: EventoMedico[]) {
  const exames = contarEventosPorTipo(eventos, 'Exame');
  const grupos = exames.reduce((acc, exame) => {
    const chave = (exame.nome ?? 'Exame').trim();
    acc[chave] = acc[chave] ? [...acc[chave], exame] : [exame];
    return acc;
  }, {} as Record<string, EventoMedico[]>);

  return Object.values(grupos).some((grupo) => {
    const ordenados = [...grupo].sort((a, b) => a.diasAtras - b.diasAtras);
    for (let i = 0; i < ordenados.length - 1; i += 1) {
      if (Math.abs(ordenados[i + 1].diasAtras - ordenados[i].diasAtras) <= 15) {
        return true;
      }
    }
    return false;
  });
}


const EXAMES_SEGUIMENTO_ATIVO = new Set<string>([
  'Hemoglobina glicada',
  'Glicemia em jejum',
  'Perfil lipídico',
  'Insulina basal',
  'Microalbuminúria',
  'Creatinina sérica',
  'Ureia',
  'Urina tipo I',
  'Ecocardiograma',
  'Eletrocardiograma',
  'Holter 24h',
  'MAPA 24h',
  'Espirometria',
  'Gasometria arterial',
  'Tomografia de tórax',
  'Raio-X de tórax',
  'Tomografia computadorizada',
  'Marcadores tumorais',
  'PET-CT',
  'Biópsia guiada por imagem',
  'Raio-X de coluna',
  'Ressonância lombar',
  'Ultrassom de ombro',
  'Densitometria óssea',
  'Raio-X de joelho',
  'Ultrassom abdominal',
  'Ecografia pélvica',
  'Ultrassom de abdome total',
]);

function isEventoSeguimentoAtivoParaSemAcompanhamento(evento: EventoMedico) {
  if (evento.status === 'Agendado') return true;
  if (evento.tipo === 'Consulta' && evento.diasAtras <= 45) return true;
  if (evento.tipo === 'Procedimento' && evento.diasAtras <= 45) return true;
  if (evento.tipo === 'Exame' && evento.diasAtras <= 45) {
    return EXAMES_SEGUIMENTO_ATIVO.has((evento.nome ?? '').trim());
  }
  return false;
}

function normalizarEventoSemAcompanhamento(evento: EventoMedico, beneficiarioId: number, indiceEvento: number): EventoMedico {
  if (!isEventoSeguimentoAtivoParaSemAcompanhamento(evento)) {
    return evento;
  }

  const diasAtras = randInt(beneficiarioId * (701 + indiceEvento), 58, 112);

  return {
    ...evento,
    diasAtras,
    status: 'Realizado',
  };
}

function normalizarBeneficiarioSemAcompanhamento(beneficiario: Beneficiario): Beneficiario {
  if (beneficiario.status !== 'Sem acompanhamento') {
    return beneficiario;
  }

  const eventos = beneficiario.eventos
    .map((evento, indiceEvento) => normalizarEventoSemAcompanhamento(evento, beneficiario.id, indiceEvento))
    .sort((a, b) => b.diasAtras - a.diasAtras);

  const ultimoEventoDias = Math.min(...eventos.map((evento) => evento.diasAtras));

  return {
    ...beneficiario,
    ultimoEventoDias,
    declaracao: {
      ...beneficiario.declaracao,
      acompanhamentoRegular: false,
      internacoesExames: {
        ...beneficiario.declaracao.internacoesExames,
        acompanhamentoRegular: false,
        acompanhamentoMedicoAtual: false,
      },
    },
    eventos,
  };
}

function normalizarSemAcompanhamento(beneficiarios: Beneficiario[]) {
  return beneficiarios.map(normalizarBeneficiarioSemAcompanhamento);
}

function calcularIndiceCriticidade(beneficiario: Beneficiario) {
  const { declaracao, eventos, medicamentos, score, condicao } = beneficiario;

  let indice = score * 2;

  if (declaracao.doencasPreexistentes?.diabetes) indice += 18;
  if (declaracao.doencasPreexistentes?.hipertensao) indice += 15;
  if (declaracao.doencasPreexistentes?.obesidade) indice += 11;
  if (declaracao.doencasPreexistentes?.doencaRenalCronica) indice += 18;
  if (declaracao.doencasPreexistentes?.cardiopatia || declaracao.doencasPreexistentes?.insuficienciaCardiaca) indice += 18;
  if (declaracao.doencasPreexistentes?.historicoOncologico) indice += 12;
  if (declaracao.doencasPreexistentes?.dpoc) indice += 12;
  if (!declaracao.acompanhamentoRegular) indice += 16;
  if (declaracao.internacaoRecente) indice += 14;
  if (declaracao.tabagismo) indice += 10;
  if (declaracao.percepcaoSaude?.autoavaliacaoSaude === 'Ruim') indice += 12;
  if (declaracao.percepcaoSaude?.autoavaliacaoSaude === 'Regular') indice += 6;
  if (medicamentos.length >= 4) indice += 10;
  if (medicamentos.length >= 2) indice += 4;
  if (condicao.includes('Doença renal crônica')) indice += 8;
  if (condicao.includes('Histórico oncológico')) indice += 8;

  const pa45 = contarEventosPorTipo(eventos, 'Pronto atendimento').filter((evento) => evento.diasAtras <= 45).length;
  const consultas120 = contarEventosPorTipo(eventos, 'Consulta').filter((evento) => evento.diasAtras <= 120).length;
  const janela30 = eventos.filter((evento) => evento.diasAtras <= 30).length;

  if (pa45 >= 2) indice += 16;
  if (consultas120 >= 3) indice += 12;
  if (janela30 >= 3) indice += 10;
  if (existeGrupoExameRedundante(eventos)) indice += 14;

  return indice;
}

function recalibrarScoreParaRiscoAlto(beneficiario: Beneficiario, origem: 'Médio' | 'Baixo') {
  const indice = calcularIndiceCriticidade(beneficiario);
  const incrementoBase = origem === 'Médio' ? 12 : 24;
  const piso = origem === 'Médio' ? 72 : 74;
  const variacao = Math.min(origem === 'Médio' ? 11 : 14, Math.floor(indice / 28));
  return Math.min(92, Math.max(piso, beneficiario.score + incrementoBase + variacao));
}

function recalibrarRisco(beneficiarios: Beneficiario[]): Beneficiario[] {
  const altosOriginais = beneficiarios.filter((beneficiario) => beneficiario.risco === 'Alto').map((beneficiario) => beneficiario.id);
  const medios = beneficiarios
    .filter((beneficiario) => beneficiario.risco === 'Médio')
    .sort((a, b) => {
      const diffIndice = calcularIndiceCriticidade(b) - calcularIndiceCriticidade(a);
      if (diffIndice !== 0) return diffIndice;
      return b.score - a.score;
    });

  const baixos = beneficiarios
    .filter((beneficiario) => beneficiario.risco === 'Baixo')
    .sort((a, b) => {
      const diffIndice = calcularIndiceCriticidade(b) - calcularIndiceCriticidade(a);
      if (diffIndice !== 0) return diffIndice;
      return b.score - a.score;
    });

  const { doMedioParaAlto, doBaixoParaAlto } = calcularTransferenciasRisco(medios.length, baixos.length);

  const promovidosMedio = new Set(medios.slice(0, doMedioParaAlto).map((beneficiario) => beneficiario.id));
  const promovidosBaixo = new Set(baixos.slice(0, doBaixoParaAlto).map((beneficiario) => beneficiario.id));

  return beneficiarios.map((beneficiario) => {
    const devePromover =
      !altosOriginais.includes(beneficiario.id) &&
      (promovidosMedio.has(beneficiario.id) || promovidosBaixo.has(beneficiario.id));

    if (!devePromover) return beneficiario;

    const origem: 'Médio' | 'Baixo' = promovidosMedio.has(beneficiario.id) ? 'Médio' : 'Baixo';
    const score = recalibrarScoreParaRiscoAlto(beneficiario, origem);

    return {
      ...beneficiario,
      score,
      risco: 'Alto',
      custoPotencial30d: 3000 + score * 180 + beneficiario.eventos.length * 550,
      status: buildStatus(score, beneficiario.id),
      alerta: buildAlerta(score, beneficiario.condicao),
    };
  });
}

const beneficiariosBase: Beneficiario[] = Array.from({ length: 250 }, (_, idx) => {
  const id = idx + 1;
  const declaracao = buildDeclaracao(id);
  const condicao = buildCondicao(id, declaracao);
  const medicamentos = buildMedicamentos(id, declaracao);
  const perfil = buildPerfil(id);
  const categoria = inferExamCategory(condicao, declaracao);
  const eventos = buildEventos(id, perfil, categoria);
  const score = calcularScore(id, declaracao, eventos, medicamentos);
  const risco = calcularRisco(score);
  const ultimoEventoDias = Math.min(...eventos.map((e) => e.diasAtras));
  const custoPotencial30d = 3000 + score * 180 + eventos.length * 550;
  const status = buildStatus(score, id);
  const alerta = buildAlerta(score, condicao);

  return {
    id,
    nome: buildNome(id),
    cpf: cpfFromId(id),
    idade: randInt(id * 647, 24, 67),
    area: pick(AREAS, id),
    score,
    risco,
    ultimoEventoDias,
    custoPotencial30d,
    status,
    condicao,
    alerta,
    declaracao,
    medicamentos,
    eventos,
  };
});

export const beneficiariosMock: Beneficiario[] = normalizarSemAcompanhamento(recalibrarRisco(beneficiariosBase));