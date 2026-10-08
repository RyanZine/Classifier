//Testes do modelo de Machine Learning: dados de treino, estrutura, treino e previsão
import {test} from 'node:test';
import assert from 'node:assert/strict';
import tf from '../src/tf.js';
import {rawStudents, getTrainingTensors} from '../src/data.js';
import {createModel} from '../src/model.js';
import {buildInputVector} from '../src/processing.js';

test('os tensores de treino têm um aluno por linha', () => {
    const {xs, ys} = getTrainingTensors();

    assert.deepEqual(xs.shape, [rawStudents.length, 4]);   //3 senioridades + horas
    assert.deepEqual(ys.shape, [rawStudents.length, 2]);   //Basic e Pro

    xs.dispose();
    ys.dispose();
});

test('o modelo tem entrada de 4 posições e saída de 2 probabilidades', () => {
    const model = createModel();

    assert.deepEqual(model.inputs[0].shape, [null, 4]);
    assert.deepEqual(model.outputs[0].shape, [null, 2]);
    assert.equal(model.countParams(), 58);
});

test('o treino reduz o erro e o modelo separa Basic de Pro', async () => {
    const {xs, ys} = getTrainingTensors();
    const model = createModel();

    const historico = await model.fit(xs, ys, { epochs: 100, verbose: 0 });
    const perdas = historico.history.loss;

    assert.ok(perdas.at(-1) < perdas[0], 'a perda final deve ser menor que a inicial');
    assert.ok(perdas.at(-1) < 0.1, `perda final alta demais: ${perdas.at(-1)}`);

    //aluno com muitas horas e sênior → Pro; poucas horas e iniciante → Basic
    const entrada = tf.tensor2d([
        buildInputVector({ horasEstudo: 9, senioridade: 'Senior' }),
        buildInputVector({ horasEstudo: 1.5, senioridade: 'Iniciante' })
    ]);
    const [proSenior, basicIniciante] = await model.predict(entrada).array();

    assert.ok(proSenior[1] > proSenior[0], 'o aluno sênior com 9h deveria ser Pro');
    assert.ok(basicIniciante[0] > basicIniciante[1], 'o aluno iniciante com 1,5h deveria ser Basic');

    //as duas probabilidades de cada aluno somam 1 (softmax)
    assert.ok(Math.abs(proSenior[0] + proSenior[1] - 1) < 1e-5);

    xs.dispose();
    ys.dispose();
    entrada.dispose();
});
