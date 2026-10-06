import {gerarJSON} from './gemini.js';
import {filtrarCatalogo, buscarModulo} from '../catalogo.js';

const NIVEIS = ['Iniciante', 'Pleno', 'Senior'];

const instrucoes = `Você monta trilhas de estudo para alunos de programação.
Use SOMENTE módulos do catálogo fornecido.
Respeite os pré-requisitos: um módulo só aparece depois dos seus pré-requisitos.
O aluno pode pular pré-requisitos de nível abaixo do dele.
Ajuste a quantidade de módulos às horas semanais do aluno.
Responda em português do Brasil, com justificativas de no máximo 2 frases.`;

function criarSchema(modulos) {
    return {
        type: 'object',
        properties: {
            resumo: { type: 'string' },
            etapas: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        moduloId: { type: 'string', enum: modulos.map(modulo => modulo.id) },
                        justificativa: { type: 'string' }
                    },
                    required: ['moduloId', 'justificativa']
                }
            }
        },
        required: ['resumo', 'etapas']
    };
}

//gera a trilha com a LLM; se algo der errado, devolve a trilha padrão
export async function gerarTrilha({ aluno, linguagem, area }) {
    const modulos = filtrarCatalogo(linguagem, area);

    try {
        const resposta = await gerarJSON({
            instrucoes,
            conteudo: JSON.stringify({ aluno, catalogo: modulos }),
            schema: criarSchema(modulos)
        });
        const etapas = validarEtapas(resposta.etapas, modulos, aluno.senioridade);
        return { origem: 'llm', resumo: resposta.resumo, etapas };
    } catch (erro) {
        console.warn(`Trilha da LLM descartada (${erro.message}). Usando trilha padrão.`);
        return trilhaPadrao(modulos, aluno.senioridade);
    }
}

//confere a trilha da LLM; lança erro se encontrar qualquer problema
export function validarEtapas(etapas, modulos, senioridade) {
    if (!Array.isArray(etapas) || etapas.length === 0) {
        throw new Error('trilha vazia');
    }

    const nivelAluno = NIVEIS.indexOf(senioridade);
    const trilha = [];

    for (const etapa of etapas) {
        const modulo = modulos.find(m => m.id === etapa.moduloId);

        if (!modulo) {
            throw new Error(`módulo fora do catálogo: "${etapa.moduloId}"`);
        }
        if (trilha.some(e => e.id === modulo.id)) {
            throw new Error(`módulo repetido: "${modulo.id}"`);
        }

        for (const pre of modulo.preRequisitos) {
            const jaNaTrilha = trilha.some(e => e.id === pre);
            const dispensado = NIVEIS.indexOf(buscarModulo(pre).nivel) < nivelAluno;

            if (!jaNaTrilha && !dispensado) {
                throw new Error(`"${modulo.id}" aparece antes do pré-requisito "${pre}"`);
            }
        }

        trilha.push({ ...modulo, justificativa: etapa.justificativa });
    }

    return trilha;
}

//trilha montada sem LLM: módulos do nível do aluno para cima, em ordem de pré-requisitos
export function trilhaPadrao(modulos, senioridade) {
    const nivelAluno = NIVEIS.indexOf(senioridade);
    const pendentes = modulos.filter(modulo => NIVEIS.indexOf(modulo.nivel) >= nivelAluno);
    const trilha = [];

    while (pendentes.length > 0) {
        //próximo módulo: aquele cujos pré-requisitos já estão na trilha (ou foram dispensados)
        const i = pendentes.findIndex(modulo => modulo.preRequisitos.every(pre =>
            trilha.some(e => e.id === pre) || !pendentes.some(p => p.id === pre)
        ));

        trilha.push({ ...pendentes[i], justificativa: 'Etapa da trilha padrão.' });
        pendentes.splice(i, 1);
    }

    return { origem: 'padrao', resumo: 'Trilha padrão montada a partir do catálogo.', etapas: trilha };
}
