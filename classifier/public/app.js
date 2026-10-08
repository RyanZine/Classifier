const formulario = document.querySelector('#formulario');
const selectLinguagem = document.querySelector('#linguagem');
const selectArea = document.querySelector('#area');
const botao = document.querySelector('#botao');
const mensagem = document.querySelector('#mensagem');
const resultado = document.querySelector('#resultado');

//nomes das linguagens
const NOMES_LINGUAGENS = {python: "Python", javascript: "JavaScript"};

//guarda as áreas recebidas do servidor
let areas = {};

//busca linguagens e áreas no servidor e preenche o select de linguagem
async function carregarAreas() {
    const resposta = await fetch('/areas');
    areas = await resposta.json();

    for (const linguagem of Object.keys(areas)) {
        selectLinguagem.add(new Option(NOMES_LINGUAGENS[linguagem] ?? linguagem, linguagem));
    }

    //preenche as áreas da linguagem que já está selecionada
    atualizarAreas();
}

//mostra só as áreas da linguagem escolhida
function atualizarAreas() {
    selectArea.replaceChildren();

    for (const [chave, nome] of Object.entries(areas[selectLinguagem.value])) {
        if (chave !== 'base') {
            selectArea.add(new Option(nome, chave));
        }
    }
}


//quando o aluno trocar a linguagem, as áreas são carregadas
selectLinguagem.addEventListener('change', atualizarAreas);


//envia os dados do aluno ao servidor
formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    //Junta os dados do formulario
    const aluno = {
        horasEstudo: Number(document.querySelector('#horas').value),
        senioridade: document.querySelector('#senioridade').value,
        linguagem: selectLinguagem.value,
        area: selectArea.value
    };

    //estado de carregamento
    mostrarMensagem('Classificando o perfil e gerando a trilha com IA... isso pode levar até 30 segundos.');
    resultado.hidden = true;
    botao.disabled = true;

    try {
        //envia ao servidor
        const resposta = await fetch('/recomendar', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(aluno)
        });
        const dados = await resposta.json();

        //o fetch não lança o erro
        if (!resposta.ok) {
            throw new Error(dados.erro ?? 'Erro ao gerar a recomendação.');
        }

        mostrarResultado(dados, aluno.horasEstudo);
        prepararFeedback(aluno, dados.plano);
        mensagem.hidden = true;
    } catch (erro) {
        mostrarMensagem(erro.message, true);
    } finally {
        botao.disabled = false;
    }
});

//feedback do aluno sobre o plano recomendado
const caixaFeedback = document.querySelector('#feedback');
let ultimaRecomendacao = null;

function prepararFeedback(aluno, planoRecomendado) {
    ultimaRecomendacao = { horasEstudo: aluno.horasEstudo, senioridade: aluno.senioridade, planoRecomendado };

    document.querySelector('#outro-plano').textContent = planoRecomendado === 'Pro' ? 'Basic' : 'Pro';
    caixaFeedback.querySelector('p').textContent = 'Esse plano faz sentido para você?';
    caixaFeedback.querySelectorAll('button').forEach(botaoFeedback => { botaoFeedback.disabled = false; });
    caixaFeedback.hidden = false;
}

caixaFeedback.addEventListener('click', async (evento) => {
    const botaoClicado = evento.target.closest('button');
    if (!botaoClicado || !ultimaRecomendacao) return;

    //👍 confirma o plano recomendado; 👎 indica o outro plano como o certo
    const { planoRecomendado } = ultimaRecomendacao;
    const plano = botaoClicado.dataset.resposta === 'sim'
        ? planoRecomendado
        : (planoRecomendado === 'Pro' ? 'Basic' : 'Pro');

    caixaFeedback.querySelectorAll('button').forEach(botaoFeedback => { botaoFeedback.disabled = true; });

    try {
        const resposta = await fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...ultimaRecomendacao, plano })
        });
        if (!resposta.ok) throw new Error();

        caixaFeedback.querySelector('p').textContent = 'Obrigado! Sua resposta vai ajudar a treinar o modelo.';
        ultimaRecomendacao = null;   //um feedback por recomendação
    } catch {
        caixaFeedback.querySelector('p').textContent = 'Não foi possível enviar sua resposta. Tente de novo.';
        caixaFeedback.querySelectorAll('button').forEach(botaoFeedback => { botaoFeedback.disabled = false; });
    }
});

//mostra avisos
function mostrarMensagem(texto, ehErro = false) {
    mensagem.textContent = texto;
    mensagem.classList.toggle('erro', ehErro);
    mensagem.hidden = false;
}

//desenha o plano (ML) e a trilha (LLM)
function mostrarResultado({ plano, probabilidades, trilha }, horasSemana) {
    //card 1: machine learning
    document.querySelector('#plano').textContent = plano;
    preencherBarra('basic', probabilidades.Basic);
    preencherBarra('pro', probabilidades.Pro);

    //card 2: selo de origem
    const origem = document.querySelector('#origem');
    origem.textContent = trilha.origem === 'llm' ? 'Gerada pela IA' : 'Trilha padrão';
    origem.classList.toggle('padrao', trilha.origem !== 'llm');

    //card 2: resumo e totais
    document.querySelector('#resumo').textContent = trilha.resumo;

    const totalHoras = trilha.etapas.reduce((soma, etapa) => soma + etapa.horas, 0);
    const semanas = Math.ceil(totalHoras / horasSemana);
    document.querySelector('#total').textContent =
        `${trilha.etapas.length} módulos · ${totalHoras}h no total · cerca de ${semanas} semanas`;

    //card 2: lista de etapas
    document.querySelector('#etapas').replaceChildren(...trilha.etapas.map(criarEtapa));

    resultado.hidden = false;
}

//ajusta a largura e o texto de uma barra de probabilidade
function preencherBarra(nome, probabilidade) {
    const porcentagem = `${(probabilidade * 100).toFixed(1)}%`;
    document.querySelector(`#barra-${nome}`).style.width = porcentagem;
    document.querySelector(`#valor-${nome}`).textContent = porcentagem;
}

//cria o item de uma etapa; textContent garante que o texto da LLM nunca vira HTML
function criarEtapa(etapa) {
    const item = document.createElement('li');

    const titulo = document.createElement('h3');
    titulo.textContent = etapa.titulo;

    const detalhes = document.createElement('p');
    detalhes.className = 'detalhes';
    detalhes.textContent = `${etapa.nivel} · ${etapa.horas}h`;

    const justificativa = document.createElement('p');
    justificativa.textContent = etapa.justificativa;

    item.append(titulo, detalhes, justificativa);
    return item;
}

carregarAreas();