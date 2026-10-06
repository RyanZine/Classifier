import {GoogleGenAI} from '@google/genai';

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const ERROS_TEMPORARIOS = [429, 500, 503];

//modelos em ordem de preferência (pode ser trocado no .env, separados por vírgula)
const MODELOS = (process.env.GEMINI_MODELOS || 'gemini-flash-latest,gemini-3.5-flash-lite').split(',');

//o cliente é criado só na primeira chamada
let ai;

//envia o pedido e devolve a resposta já convertida em objeto
export async function gerarJSON({ instrucoes, conteudo, schema, tentativas = 3 }) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY não definida no .env');
    }
    ai ??= new GoogleGenAI({});

    for (const modelo of MODELOS) {
        for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
            try {
                const response = await ai.models.generateContent({
                    model: modelo,
                    contents: conteudo,
                    config: {
                        systemInstruction: instrucoes,
                        responseMimeType: 'application/json',
                        responseJsonSchema: schema
                    }
                });
                return JSON.parse(response.text);
            } catch (erro) {
                if (!ERROS_TEMPORARIOS.includes(erro.status)) throw erro;

                console.log(`${modelo}: tentativa ${tentativa} falhou (erro ${erro.status}).`);
                if (tentativa < tentativas) await esperar(2000 * 2 ** (tentativa - 1));
            }
        }
    }
    throw new Error('nenhum modelo disponível no momento');
}
