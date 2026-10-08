//Testes da LLM limitada, sem chamar a API: a validação da resposta e a trilha padrão
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {areas, filtrarCatalogo} from '../src/catalogo.js';
import {validarEtapas, trilhaPadrao} from '../src/llm/trilha.js';

const modulos = filtrarCatalogo('python', 'dados');

//transforma uma lista de ids no formato que a LLM devolve
const resposta = (...ids) => ids.map(moduloId => ({ moduloId, justificativa: '...' }));

test('aceita uma trilha válida e completa com os dados do catálogo', () => {
    const trilha = validarEtapas(resposta('py-logica', 'py-fundamentos', 'py-pandas'), modulos, 'Iniciante');

    assert.deepEqual(trilha.map(etapa => etapa.id), ['py-logica', 'py-fundamentos', 'py-pandas']);
    assert.equal(trilha[2].titulo, 'Análise de Dados com Pandas e NumPy');
});

test('rejeita módulo inventado', () => {
    assert.throws(() => validarEtapas(resposta('py-logica', 'curso-falso'), modulos, 'Iniciante'), /fora do catálogo/);
});

test('rejeita módulo repetido', () => {
    assert.throws(() => validarEtapas(resposta('py-logica', 'py-logica'), modulos, 'Iniciante'), /repetido/);
});

test('rejeita módulo antes do seu pré-requisito', () => {
    assert.throws(() => validarEtapas(resposta('py-pandas', 'py-fundamentos'), modulos, 'Iniciante'), /pré-requisito/);
});

test('rejeita trilha vazia', () => {
    assert.throws(() => validarEtapas([], modulos, 'Iniciante'), /vazia/);
});

test('aluno Pleno pode pular pré-requisitos de nível Iniciante', () => {
    assert.doesNotThrow(() => validarEtapas(resposta('py-pandas'), modulos, 'Pleno'));
});

test('a trilha padrão encurta conforme a senioridade', () => {
    const tamanho = (senioridade) => trilhaPadrao(filtrarCatalogo('python', 'financas'), senioridade).etapas.length;

    assert.ok(tamanho('Iniciante') > tamanho('Pleno'));
    assert.ok(tamanho('Pleno') > tamanho('Senior'));
});

test('a trilha padrão é válida em todas as áreas e senioridades', () => {
    let total = 0;

    for (const linguagem in areas) {
        for (const area in areas[linguagem]) {
            if (area === 'base') continue;

            for (const senioridade of ['Iniciante', 'Pleno', 'Senior']) {
                const mods = filtrarCatalogo(linguagem, area);
                const {etapas} = trilhaPadrao(mods, senioridade);

                assert.ok(etapas.length > 0, `trilha vazia em ${linguagem}/${area}/${senioridade}`);
                assert.doesNotThrow(() => validarEtapas(resposta(...etapas.map(e => e.id)), mods, senioridade));
                total++;
            }
        }
    }

    assert.equal(total, 63);   //21 áreas × 3 senioridades
});
