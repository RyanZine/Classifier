//Testes do armazenamento de feedbacks (JSON Lines), em um arquivo temporário
import {test, after} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

//as variáveis precisam existir antes de importar o módulo (ele lê o caminho ao carregar)
const pasta = fs.mkdtempSync(path.join(os.tmpdir(), 'classifier-feedback-'));
process.env.ARQUIVO_FEEDBACKS = path.join(pasta, 'feedbacks.jsonl');

const {salvarFeedback, lerFeedbacks, ehFeedbackValido} = await import('../src/feedback.js');

after(() => fs.rmSync(pasta, { recursive: true, force: true }));

test('sem arquivo, não há feedbacks', () => {
    assert.deepEqual(lerFeedbacks(), []);
});

test('salva um feedback por linha e lê de volta', () => {
    salvarFeedback({ horasEstudo: 4, senioridade: 'Pleno', planoRecomendado: 'Pro', plano: 'Basic' });
    salvarFeedback({ horasEstudo: 9, senioridade: 'Senior', planoRecomendado: 'Pro', plano: 'Pro' });

    const linhas = fs.readFileSync(process.env.ARQUIVO_FEEDBACKS, 'utf8').trim().split('\n');
    assert.equal(linhas.length, 2);

    const feedbacks = lerFeedbacks();
    assert.equal(feedbacks.length, 2);
    assert.equal(feedbacks[0].plano, 'Basic');
    assert.ok(feedbacks[0].data, 'cada feedback recebe a data de registro');
});

test('ignora linhas corrompidas e registros inválidos sem perder os válidos', () => {
    fs.appendFileSync(process.env.ARQUIVO_FEEDBACKS, '{"horasEstudo": 5, "senioridade": "Ple\n');
    fs.appendFileSync(process.env.ARQUIVO_FEEDBACKS, JSON.stringify({ horasEstudo: 99, senioridade: 'Pleno', plano: 'Pro' }) + '\n');

    assert.equal(lerFeedbacks().length, 2);
});

test('ehFeedbackValido confere horas, senioridade e plano', () => {
    const valido = { horasEstudo: 6, senioridade: 'Iniciante', plano: 'Basic' };

    assert.equal(ehFeedbackValido(valido), true);
    assert.equal(ehFeedbackValido({ ...valido, horasEstudo: 0 }), false);
    assert.equal(ehFeedbackValido({ ...valido, senioridade: 'Sênior' }), false);
    assert.equal(ehFeedbackValido({ ...valido, plano: 'Premium' }), false);
    assert.equal(ehFeedbackValido(null), false);
});
