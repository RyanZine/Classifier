//Testes do pré-processamento: transforma o aluno no vetor que o modelo entende
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeValue, oneHotEncode, buildInputVector} from '../src/processing.js';

test('normalizeValue leva o valor para o intervalo [0, 1]', () => {
    assert.equal(normalizeValue(5, 0, 10), 0.5);
    assert.equal(normalizeValue(0, 0, 10), 0);
    assert.equal(normalizeValue(10, 0, 10), 1);
});

test('normalizeValue devolve 0 quando mínimo e máximo são iguais (evita divisão por zero)', () => {
    assert.equal(normalizeValue(7, 3, 3), 0);
});

test('oneHotEncode marca só a categoria do valor', () => {
    assert.deepEqual(oneHotEncode('Pleno', ['Iniciante', 'Pleno', 'Senior']), [0, 1, 0]);
});

test('oneHotEncode devolve tudo zero para categoria desconhecida', () => {
    //por isso a API rejeita senioridades fora da lista antes de chegar aqui
    assert.deepEqual(oneHotEncode('Sênior', ['Iniciante', 'Pleno', 'Senior']), [0, 0, 0]);
});

test('buildInputVector monta [Iniciante, Pleno, Senior, horasNormalizadas]', () => {
    assert.deepEqual(buildInputVector({ horasEstudo: 1, senioridade: 'Iniciante' }), [1, 0, 0, 0.1]);
    assert.deepEqual(buildInputVector({ horasEstudo: 8.5, senioridade: 'Senior' }), [0, 0, 1, 0.85]);
});
