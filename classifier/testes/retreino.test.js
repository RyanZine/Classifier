//Testes do retreino (campeão × desafiante), em pastas temporárias:
//o modelo e os feedbacks reais nunca são tocados
import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'classifier-retreino-'));
process.env.ARQUIVO_FEEDBACKS = path.join(pasta, 'feedbacks.jsonl');
process.env.PASTA_MODELO = path.join(pasta, 'modelo');
process.env.PASTA_VERSOES = path.join(pasta, 'versoes');
process.env.ARQUIVO_HISTORICO = path.join(pasta, 'retreinos.jsonl');
process.env.MINIMO_FEEDBACKS = '5';

const {separarTreinoTeste, decidirPromocao, retreinar} = await import('../src/retreino.js');
const {salvarFeedback} = await import('../src/feedback.js');

after(() => fs.rmSync(pasta, { recursive: true, force: true }));

test('separarTreinoTeste deixa os 20% mais recentes para teste', () => {
    const feedbacks = Array.from({ length: 10 }, (_, i) => ({ id: i }));
    const { treino, teste } = separarTreinoTeste(feedbacks);

    assert.equal(treino.length, 8);
    assert.deepEqual(teste.map(f => f.id), [8, 9]);
});

test('separarTreinoTeste reserva pelo menos 1 exemplo para teste', () => {
    const { treino, teste } = separarTreinoTeste([{ id: 0 }, { id: 1 }, { id: 2 }]);
    assert.equal(teste.length, 1);
    assert.equal(treino.length, 2);
});

test('o desafiante só é promovido se não for pior que o campeão', () => {
    assert.equal(decidirPromocao(0.8, 0.9), true);
    assert.equal(decidirPromocao(0.8, 0.8), true);
    assert.equal(decidirPromocao(0.9, 0.8), false);
});

test('com poucos feedbacks, não retreina', async () => {
    salvarFeedback({ horasEstudo: 2, senioridade: 'Iniciante', planoRecomendado: 'Basic', plano: 'Basic' });

    const resultado = await retreinar();
    assert.equal(resultado.promovido, false);
    assert.equal(resultado.motivo, 'poucos feedbacks');
    assert.equal(fs.existsSync(path.join(process.env.PASTA_MODELO, 'model.json')), false);
});

test('com feedbacks suficientes, treina, promove e guarda a versão anterior', async () => {
    //feedbacks coerentes com os dados originais: poucas horas → Basic, muitas → Pro
    for (const [horasEstudo, senioridade, plano] of [
        [1.5, 'Iniciante', 'Basic'], [2.5, 'Pleno', 'Basic'], [8, 'Pleno', 'Pro'],
        [9, 'Senior', 'Pro'], [3, 'Iniciante', 'Basic'], [7, 'Senior', 'Pro']
    ]) {
        salvarFeedback({ horasEstudo, senioridade, planoRecomendado: plano, plano });
    }

    //1º retreino: ainda não existe modelo, então o desafiante vira o primeiro campeão
    const primeiro = await retreinar();
    assert.equal(primeiro.promovido, true);
    assert.equal(primeiro.backup, null);
    assert.ok(fs.existsSync(path.join(process.env.PASTA_MODELO, 'model.json')));

    //2º retreino: parte do modelo salvo (fine-tuning) e, se promovido, guarda o anterior
    const segundo = await retreinar();
    assert.ok(segundo.acuraciaCampeao > 0, 'o campeão agora existe e é avaliado');
    if (segundo.promovido) {
        assert.ok(fs.existsSync(path.join(segundo.backup, 'model.json')), 'a versão anterior foi guardada');
    }

    //cada retreino fica registrado no histórico
    const historico = fs.readFileSync(process.env.ARQUIVO_HISTORICO, 'utf8').trim().split('\n');
    assert.equal(historico.length, 2);
});
