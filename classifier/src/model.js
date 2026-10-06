import tf from './tf.js';

//Cria e compila aa estrutura da Rede Neural Sequencial
export function createModel() {
    const model = tf.sequential();

    //camada oculta com 8 neronios e função de ativação ReLU
    model.add(tf.layers.dense({
        inputShape: [4], //Vetor de entrada com 4 posições
        units: 8,
        activation: 'relu'
    }));

    //camada de saída com 2 neurônios com ativação softmax
    model.add(tf.layers.dense({
        units: 2, //retorna 2 saídas [prob_basic, prob_pro]
        activation: 'softmax'
    }));

    //Compilação do modelo (otimizador + função de perda)
    model.compile({
        optimizer: tf.train.adam(0.05),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    return model;
}