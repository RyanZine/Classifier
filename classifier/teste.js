import tf from './src/tf.js';
import { normalizeValue, oneHotEncode, buildInputVector } from './src/processing.js';
import { rawStudents, getTrainingTensors } from './src/data.js';
import { createModel } from './src/model.js';

//--- processing.js ---
console.log('--- NORMALIZAÇÃO (normalizeValue) ---');
console.log('5 entre 0 e 10 =', normalizeValue(5, 0, 10));

console.log('--- ONE-HOT (oneHotEncode) ---');
console.log("'Pleno' =", oneHotEncode('Pleno', ['Iniciante', 'Pleno', 'Senior']));

console.log('--- VETOR DE ENTRADA (buildInputVector) ---');
console.log(rawStudents[0], '=>', buildInputVector(rawStudents[0]));

//--- data.js ---
const { xs, ys } = getTrainingTensors();

console.log('--- TENSOR DE ENTRADA (xs) ---');
xs.print();

console.log('--- TENSOR DE SAÍDA (ys) ---');
ys.print();

//--- model.js ---
const model = createModel();

console.log('--- ESTRUTURA DO MODELO ---');
model.summary();

console.log('--- TREINAMENTO ---');
const history = await model.fit(xs, ys, { epochs: 100, verbose: 0 });
const lastEpoch = history.history.loss.length - 1;
console.log('loss final:', history.history.loss[lastEpoch].toFixed(4));
console.log('accuracy final:', history.history.acc[lastEpoch].toFixed(4));

console.log('--- PREVISÃO (novo aluno) ---');
const newStudent = { horasEstudo: 8.0, senioridade: 'Senior' };
const prediction = model.predict(tf.tensor2d([buildInputVector(newStudent)]));
console.log(newStudent, '=> [prob_basic, prob_pro]');
prediction.print();
