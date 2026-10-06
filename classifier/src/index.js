import * as tf from '@tensorflow/tfjs-node';
import {buildInputVector} from './processing.js';
import {getTrainingTensors} from './data.js';
import {createModel} from './model.js';

async function main() {
    console.log('Iniciando classificador de alunos...');

    //carregamento e vetorização dos dados
    console.log('Carregando e vetorizando os dados...');
    const {xs, ys} = getTrainingTensors();

    //construlçao da rede neural
    console.log('Criando e compilando o modelo...');
    const model = createModel();

    //treinamento do modelo
    console.log('Treinando o modelo...');
    await model.fit(xs, ys, {
        epochs: 100,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch,logs) => {
                if ((epoch + 1) % 25 === 0) {
                    console.log( `Época ${(epoch +1).toString().padStart(3, ' ')}/100 | 
                    Loss: ${(logs.loss.toFixed(4))} | Acurácia: ${(logs.acc * 100).toFixed(1)}%`);
                }
            }
        }
    });

    //inferencia em tempo real
    console.log('Executando inferência para Novo Aluno...');
    const novoAluno = {horasEstudo: 8.0, senioridade: 'Pleno'};
    const vetorEntrada = buildInputVector(novoAluno);

    //conversor para tensor 2d e predição
    const inputTensor = tf.tensor2d([vetorEntrada]);
    const predicao = model.predict(inputTensor);
    const probabilidades = await predicao.data();

    const probBasic = (probabilidades[0] * 100).toFixed(2);
    const probPro = (probabilidades[1] * 100).toFixed(2);

    console.log('Diagnóstico de recomendação:');
    console.log(`  Perfil: ${novoAluno.horasEstudo}h/semana | Senioridade: ${novoAluno.senioridade}`);
    console.log(` -Plano Basico: ${probBasic}%`)
    console.log(` -Plano Pro: ${probPro}%`);

    const planoRecomendado = probabilidades[1] > probabilidades[0] ? 'Plano Pro' : 'Plano Básico';
    console.log(`Recomendação final: ${planoRecomendado}`);

    //limpeza de memória
    xs.dispose();
    ys.dispose();
    inputTensor.dispose();
    predicao.dispose();
    console.log('Memória liberada.')
}

main().catch(err => console.error(err));