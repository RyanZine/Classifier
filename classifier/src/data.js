import tf from './tf.js';
import {buildInputVector} from './processing.js';

//dados brutos de treinamento (histórico de alunos)
export const rawStudents = [ { horasEstudo: 1.0, senioridade: 'Iniciante', plano: 'Basic' },
    { horasEstudo: 2.0, senioridade: 'Iniciante', plano: 'Basic' }, 
    { horasEstudo: 3.0, senioridade: 'Pleno', plano: 'Basic' }, 
    { horasEstudo: 7.5, senioridade: 'Pleno', plano: 'Pro' }, 
    { horasEstudo: 8.5, senioridade: 'Senior', plano: 'Pro' }, 
    { horasEstudo: 9.5, senioridade: 'Senior', plano: 'Pro' } ];

    //função para transformar os dados brutos em vetores de entrada para o modelo
    export function getTrainingTensors() {
        const plans = ['Basic', 'Pro'];

        //vetores de entrada (xs)
        const inputVectors = rawStudents.map(student => buildInputVector(student));

        //vetores de saída (ys) - codificação one-hot dos planos
        const outputVectors = rawStudents.map(student => plans.map(plan => plan === student.plano ? 1 : 0));

        //conversão para tensores 2d
        const xs = tf.tensor2d(inputVectors);
        const ys = tf.tensor2d(outputVectors);

        return { xs, ys };
    }

