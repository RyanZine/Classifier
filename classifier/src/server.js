import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import {fileURLToPath} from 'node:url';
import { gerarTrilha } from './llm/trilha.js';
import { areas } from './catalogo.js';
import {carregarModelo, classificar} from './classificador.js';
import {salvarFeedback} from './feedback.js';

const PORTA = Number(process.env.PORT) || 3000;

//Instância
const app = Fastify({logger: true});

//plugin (para a pasta public)
await app.register(fastifyStatic, {
    root: fileURLToPath(new URL('../public', import.meta.url))
});

//contrato de entrada
const schemaAluno = {
    type: 'object',
    properties: {
        horasEstudo: { type: 'number', minimum: 1, maximum: 40 },
        senioridade: { type: 'string', enum: ['Iniciante', 'Pleno', 'Senior'] },
        linguagem:   { type: 'string', enum: Object.keys(areas) },
        area:        { type: 'string' }
    },
    required: ['horasEstudo', 'senioridade', 'linguagem', 'area'],
    additionalProperties: false
};

//contrato do feedback: o perfil do aluno, o plano recomendado e o plano que ele considerou certo
const schemaFeedback = {
    type: 'object',
    properties: {
        horasEstudo:      { type: 'number', minimum: 1, maximum: 40 },
        senioridade:      { type: 'string', enum: ['Iniciante', 'Pleno', 'Senior'] },
        planoRecomendado: { type: 'string', enum: ['Basic', 'Pro'] },
        plano:            { type: 'string', enum: ['Basic', 'Pro'] }
    },
    required: ['horasEstudo', 'senioridade', 'planoRecomendado', 'plano'],
    additionalProperties: false
};

//padronização dos erros
app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
        return reply.code(400).send({erro: `Dados inválidos: ${error.message}`});
    }
    request.log.error(error);
    return reply.code(500).send({erro: 'Erro interno no servidor.'});
});

//lista de linguagens e áreas para montar o formulário
app.get('/areas', async () => areas);

//recebe os dados do aluno e devolve o plano + trilha
app.post('/recomendar', { schema: { body: schemaAluno}}, async (request, reply) => {
    const {horasEstudo, senioridade, linguagem, area} = request.body;

    //regra que depende de dois campos: a área precisa existir naquela linguagem
    if (area === 'base' || !areas[linguagem][area]) {
        return reply.code(400).send({erro: `Área "${area}" não existe para ${linguagem}.`});
    }

    //plano recomendado
    const classificacao = await classificar({horasEstudo, senioridade});
    const confianca = Math.max(classificacao.probabilidades.Basic, classificacao.probabilidades.Pro);

    //LLM: trilha de estudos
    const trilha = await gerarTrilha({
        aluno: {
            horasEstudoSemana: horasEstudo,
            senioridade,
            plano: classificacao.plano,
            confianca: `${(confianca * 100).toFixed(1)}%`
        },
        linguagem,
        area
    });

    return {...classificacao, trilha};
});

//recebe o feedback do aluno sobre o plano; vira exemplo de treino no próximo retreino
app.post('/feedback', { schema: { body: schemaFeedback } }, async (request, reply) => {
    salvarFeedback(request.body);
    return reply.code(201).send({ ok: true });
});

//carrega o modelo antes de aceitar pedidos
await carregarModelo();
await app.listen({port: PORTA});