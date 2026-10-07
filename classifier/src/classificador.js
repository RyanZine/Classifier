import fs from 'fs';
import tf from './tf.js';
import { buildInputVector } from './processing.js';
import { getTrainingTensors } from './data.js';
import { createModel } from './model.js';

const CAMINHO_MODELO = './modelo_salvo';

//modelo foi treinado com 10h semanais
const MAX_HORAS_TREINO = 10;

let model;

//carrega o modelo salvo ou treina um novo
export async function carregarModelo() {
    if (fs.existsSync(`${CAMINHO_MODELO}/model.json`)) {
        model = await tf.loadLayersModel(`file://${CAMINHO_MODELO}/model.json`);
        return
    }

    const {xs, ys} = getTrainingTensors();
    model = createModel();
    await model.fit(xs, ys, {epochs: 100, shuffle: true, verbose: 0});
    await model.save(`file://${CAMINHO_MODELO}`);
    xs.dispose();
    ys.dispose();
}

//classifica um aluno e devolve o plano
export async function classificar(aluno) {
    //valores acima do treino são tratados como o máximo conhecido pelo modelo
    const horas = Math.min(aluno.horasEstudo, MAX_HORAS_TREINO);

    const entrada = tf.tensor2d([buildInputVector({...aluno, horasEstudo: horas})]);
    const predicao = model.predict(entrada);
    const [probBasic, probPro] = await predicao.data();

    entrada.dispose();
    predicao.dispose();

    return {
        plano: probPro > probBasic ? 'Pro' : 'Basic',
        probabilidades: {Basic: probBasic, Pro: probPro}
    };
}