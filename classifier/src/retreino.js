//Retreino do classificador com os feedbacks dos alunos.
//Padrão campeão × desafiante: o modelo novo só substitui o atual se não for pior.
//Uso: npm run retrain
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import tf from './tf.js';
import {rawStudents} from './data.js';
import {createModel} from './model.js';
import {buildInputVector} from './processing.js';
import {lerFeedbacks} from './feedback.js';

const PASTA_MODELO = process.env.PASTA_MODELO || './modelo_salvo';
const PASTA_VERSOES = process.env.PASTA_VERSOES || './modelos_anteriores';
const ARQUIVO_HISTORICO = process.env.ARQUIVO_HISTORICO || './dados/retreinos.jsonl';

//só retreina com feedbacks suficientes (poucos exemplos não justificam mudar o modelo)
const MINIMO_FEEDBACKS = Number(process.env.MINIMO_FEEDBACKS) || 5;

//parte dos feedbacks fica de fora do treino para avaliar os modelos
const PROPORCAO_TESTE = 0.2;

//o modelo conhece no máximo 10h semanais (igual a classificador.js)
const MAX_HORAS_TREINO = 10;

const PLANOS = ['Basic', 'Pro'];

//converte exemplos { horasEstudo, senioridade, plano } em tensores de entrada e saída
export function paraTensores(exemplos) {
    const xs = tf.tensor2d(exemplos.map(exemplo =>
        buildInputVector({ ...exemplo, horasEstudo: Math.min(exemplo.horasEstudo, MAX_HORAS_TREINO) })
    ));
    const ys = tf.tensor2d(exemplos.map(exemplo => PLANOS.map(plano => (plano === exemplo.plano ? 1 : 0))));
    return { xs, ys };
}

//separa os feedbacks: os mais recentes ficam para teste, o restante vai para o treino
export function separarTreinoTeste(feedbacks, proporcao = PROPORCAO_TESTE) {
    const quantidadeTeste = Math.max(1, Math.round(feedbacks.length * proporcao));
    return {
        treino: feedbacks.slice(0, -quantidadeTeste),
        teste: feedbacks.slice(-quantidadeTeste)
    };
}

//porcentagem de exemplos em que o modelo acerta o plano
export async function acuracia(model, exemplos) {
    const { xs, ys } = paraTensores(exemplos);
    const predicao = model.predict(xs);
    const acertos = tf.tidy(() => predicao.argMax(1).equal(ys.argMax(1)).sum());
    const total = (await acertos.data())[0];

    tf.dispose([xs, ys, predicao, acertos]);
    return total / exemplos.length;
}

//o desafiante só vence se não for pior que o campeão
export function decidirPromocao(acuraciaCampeao, acuraciaDesafiante) {
    return acuraciaDesafiante >= acuraciaCampeao;
}

async function carregarModeloSalvo() {
    if (!fs.existsSync(`${PASTA_MODELO}/model.json`)) return null;
    return tf.loadLayersModel(`file://${PASTA_MODELO}/model.json`);
}

//fine-tuning: parte do modelo atual e ajusta os pesos com os exemplos novos
async function treinarDesafiante(exemplos) {
    const modeloAtual = await carregarModeloSalvo();
    const model = modeloAtual ?? createModel();

    //modelo carregado do disco vem sem otimizador: precisa compilar de novo.
    //taxa de aprendizado menor no fine-tuning, para ajustar sem apagar o que já sabe
    model.compile({
        optimizer: tf.train.adam(modeloAtual ? 0.01 : 0.05),
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    const { xs, ys } = paraTensores(exemplos);
    await model.fit(xs, ys, { epochs: modeloAtual ? 50 : 100, shuffle: true, verbose: 0 });
    tf.dispose([xs, ys]);

    return model;
}

//guarda o modelo atual como versão anterior e salva o novo no lugar
async function promover(model) {
    let backup = null;

    if (fs.existsSync(`${PASTA_MODELO}/model.json`)) {
        backup = path.join(PASTA_VERSOES, new Date().toISOString().replace(/[:.]/g, '-'));
        fs.cpSync(PASTA_MODELO, backup, { recursive: true });
    }

    await model.save(`file://${PASTA_MODELO}`);
    return backup;
}

function registrarHistorico(registro) {
    fs.mkdirSync(path.dirname(ARQUIVO_HISTORICO), { recursive: true });
    fs.appendFileSync(ARQUIVO_HISTORICO, JSON.stringify(registro) + '\n');
}

export async function retreinar() {
    const feedbacks = lerFeedbacks();
    console.log(`Feedbacks válidos: ${feedbacks.length}`);

    if (feedbacks.length < MINIMO_FEEDBACKS) {
        console.log(`São necessários pelo menos ${MINIMO_FEEDBACKS} feedbacks. Retreino não realizado.`);
        return { promovido: false, motivo: 'poucos feedbacks', feedbacks: feedbacks.length };
    }

    //os dados originais entram no treino e no teste: o modelo não pode "esquecer" o que já sabia
    const { treino, teste } = separarTreinoTeste(feedbacks);
    const exemplosTreino = [...rawStudents, ...treino];
    const exemplosTeste = [...rawStudents, ...teste];
    console.log(`Treino: ${exemplosTreino.length} exemplos | Teste: ${exemplosTeste.length} exemplos`);

    const campeao = await carregarModeloSalvo();
    const acuraciaCampeao = campeao ? await acuracia(campeao, exemplosTeste) : 0;

    console.log('Treinando o desafiante...');
    const desafiante = await treinarDesafiante(exemplosTreino);
    const acuraciaDesafiante = await acuracia(desafiante, exemplosTeste);

    const formatar = (valor) => `${(valor * 100).toFixed(1)}%`;
    console.log(`Acurácia no teste → campeão: ${campeao ? formatar(acuraciaCampeao) : 'sem modelo'} | desafiante: ${formatar(acuraciaDesafiante)}`);

    const promovido = decidirPromocao(acuraciaCampeao, acuraciaDesafiante);
    const backup = promovido ? await promover(desafiante) : null;

    console.log(promovido
        ? `Desafiante promovido.${backup ? ` Versão anterior guardada em ${backup}` : ''}`
        : 'Desafiante descartado: o modelo atual continua em uso.');

    const resultado = {
        data: new Date().toISOString(),
        feedbacks: feedbacks.length,
        acuraciaCampeao,
        acuraciaDesafiante,
        promovido,
        backup
    };
    registrarHistorico(resultado);
    return resultado;
}

//executa só quando chamado direto (npm run retrain), não quando importado pelos testes
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    retreinar().catch(erro => {
        console.error('Erro no retreino:', erro);
        process.exitCode = 1;
    });
}
