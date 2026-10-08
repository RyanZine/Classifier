//Testes das regras do catálogo: a lista fechada de onde a LLM escolhe os módulos
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {areas, catalogo, buscarModulo, filtrarCatalogo} from '../src/catalogo.js';

const NIVEIS = ['Iniciante', 'Pleno', 'Senior'];

test('não há ids repetidos', () => {
    const ids = catalogo.map(modulo => modulo.id);
    assert.equal(new Set(ids).size, ids.length);
});

test('todo módulo usa uma linguagem, área e nível válidos', () => {
    for (const modulo of catalogo) {
        assert.ok(areas[modulo.linguagem]?.[modulo.area], `"${modulo.id}" usa área inexistente "${modulo.area}"`);
        assert.ok(NIVEIS.includes(modulo.nivel), `"${modulo.id}" tem nível inválido "${modulo.nivel}"`);
    }
});

test('todo pré-requisito existe e é da mesma linguagem', () => {
    for (const modulo of catalogo) {
        for (const pre of modulo.preRequisitos) {
            const requisito = buscarModulo(pre);
            assert.ok(requisito, `"${modulo.id}" depende de "${pre}", que não existe`);
            assert.equal(requisito.linguagem, modulo.linguagem, `"${modulo.id}" depende de "${pre}", de outra linguagem`);
        }
    }
});

test('cada área tem 3 módulos (Iniciante, Pleno e Senior)', () => {
    for (const linguagem in areas) {
        for (const area in areas[linguagem]) {
            if (area === 'base') continue;
            const niveis = catalogo
                .filter(modulo => modulo.linguagem === linguagem && modulo.area === area)
                .map(modulo => modulo.nivel);
            assert.deepEqual(niveis.sort(), [...NIVEIS].sort(), `${linguagem}/${area}`);
        }
    }
});

test('buscarModulo devolve undefined para id inexistente', () => {
    assert.equal(buscarModulo('curso-inventado'), undefined);
});

test('filtrarCatalogo traz a base, a área e os pré-requisitos de outras áreas', () => {
    const ids = filtrarCatalogo('python', 'financas').map(modulo => modulo.id);

    assert.ok(ids.includes('py-fundamentos'), 'faltou a base');
    assert.ok(ids.includes('py-quant'), 'faltou a área');
    assert.ok(ids.includes('py-pandas'), 'faltou o pré-requisito de outra área (dados)');
    assert.ok(ids.every(id => id.startsWith('py-')), 'entrou módulo de outra linguagem');
});
