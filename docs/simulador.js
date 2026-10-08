//Simulador do Classifier: roda o classificador no navegador e monta a trilha padrão.
//Mesma interface de classifier/public/app.js, sem servidor e sem LLM.
import {areas, filtrarCatalogo} from './js/catalogo.js';
import {buildInputVector} from './js/processing.js';
import {trilhaPadrao} from './js/trilha-padrao.js';

const formulario = document.querySelector('#formulario');
const selectLinguagem = document.querySelector('#linguagem');
const selectArea = document.querySelector('#area');
const botao = document.querySelector('#botao');
const mensagem = document.querySelector('#mensagem');
const resultado = document.querySelector('#resultado');

const NOMES_LINGUAGENS = { python: 'Python', javascript: 'JavaScript' };

//o modelo foi treinado com no máximo 10h semanais (igual a classifier/src/classificador.js)
const MAX_HORAS_TREINO = 10;

let model;

//1. preenche os selects a partir do catálogo
for (const linguagem of Object.keys(areas)) {
    selectLinguagem.add(new Option(NOMES_LINGUAGENS[linguagem] ?? linguagem, linguagem));
}

function atualizarAreas() {
    selectArea.replaceChildren();

    for (const [chave, nome] of Object.entries(areas[selectLinguagem.value])) {
        if (chave !== 'base') {
            selectArea.add(new Option(nome, chave));
        }
    }
}

selectLinguagem.addEventListener('change', atualizarAreas);
atualizarAreas();

//2. carrega o mesmo modelo treinado do sistema real
async function carregarModelo() {
    model = await tf.loadLayersModel('modelo/model.json');
    botao.disabled = false;
    botao.textContent = 'Gerar recomendação';
}

//3. classifica o aluno no navegador
async function classificar(aluno) {
    const horas = Math.min(aluno.horasEstudo, MAX_HORAS_TREINO);

    const entrada = tf.tensor2d([buildInputVector({ ...aluno, horasEstudo: horas })]);
    const predicao = model.predict(entrada);
    const [probBasic, probPro] = await predicao.data();

    entrada.dispose();
    predicao.dispose();

    return {
        plano: probPro > probBasic ? 'Pro' : 'Basic',
        probabilidades: { Basic: probBasic, Pro: probPro }
    };
}

//4. envia o formulário
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();

    const aluno = {
        horasEstudo: Number(document.querySelector('#horas').value),
        senioridade: document.querySelector('#senioridade').value,
        linguagem: selectLinguagem.value,
        area: selectArea.value
    };

    resultado.hidden = true;
    botao.disabled = true;

    try {
        const classificacao = await classificar(aluno);
        const trilha = trilhaPadrao(filtrarCatalogo(aluno.linguagem, aluno.area), aluno.senioridade);

        mostrarResultado({ ...classificacao, trilha }, aluno.horasEstudo);
        mensagem.hidden = true;
    } catch (erro) {
        mostrarMensagem(`Erro na simulação: ${erro.message}`, true);
    } finally {
        botao.disabled = false;
    }
});

function mostrarMensagem(texto, ehErro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('erro', ehErro);
    mensagem.hidden = false;
}

//5. desenha o plano (ML) e a trilha (catálogo)
function mostrarResultado({ plano, probabilidades, trilha }, horasSemana) {
    document.querySelector('#plano').textContent = plano;
    preencherBarra('basic', probabilidades.Basic);
    preencherBarra('pro', probabilidades.Pro);

    const origem = document.querySelector('#origem');
    origem.textContent = 'Trilha padrão (simulação)';
    origem.classList.add('padrao');

    document.querySelector('#resumo').textContent = trilha.resumo;

    const totalHoras = trilha.etapas.reduce((soma, etapa) => soma + etapa.horas, 0);
    const semanas = Math.ceil(totalHoras / horasSemana);
    document.querySelector('#total').textContent =
        `${trilha.etapas.length} módulos · ${totalHoras}h no total · cerca de ${semanas} semanas`;

    document.querySelector('#etapas').replaceChildren(...trilha.etapas.map(criarEtapa));

    resultado.hidden = false;
    resultado.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function preencherBarra(nome, probabilidade) {
    const porcentagem = `${(probabilidade * 100).toFixed(1)}%`;
    document.querySelector(`#barra-${nome}`).style.width = porcentagem;
    document.querySelector(`#valor-${nome}`).textContent = porcentagem;
}

function criarEtapa(etapa) {
    const item = document.createElement('li');

    const titulo = document.createElement('h3');
    titulo.textContent = etapa.titulo;

    const detalhes = document.createElement('p');
    detalhes.className = 'detalhes';
    detalhes.textContent = `${etapa.nivel} · ${etapa.horas}h`;

    item.append(titulo, detalhes);
    return item;
}

carregarModelo().catch(() => {
    botao.textContent = 'Simulador indisponível';
    mostrarMensagem('Não foi possível carregar o modelo de Machine Learning. Recarregue a página.', true);
});
