import {GoogleGenAI} from '@google/genai';

const esperar = (ms) => new Promise(resolve => setTimeout(resolve, ms));
//504: o prazo da chamada estourou do lado do Google
const ERROS_TEMPORARIOS = [429, 500, 503, 504];

//limites de tempo: o aluno nunca espera mais que o prazo total
const TEMPO_POR_CHAMADA_MS = 15000;
const PRAZO_TOTAL_MS = 30000;
const TEMPO_MINIMO_MS = 10000;   //a API da Gemini recusa prazos menores que 10s

//modelos em ordem de preferência (pode ser trocado no .env, separados por vírgula)
const MODELOS = (process.env.GEMINI_MODELOS || 'gemini-flash-latest,gemini-3.5-flash-lite')
    .split(',')
    .map(modelo => modelo.trim())   //remove espaços: "a, b" → ["a", "b"]
    .filter(Boolean);               //ignora itens vazios: "a,,b" ou vírgula no final

//o cliente é criado só na primeira chamada
let ai;

//envia o pedido e devolve a resposta já convertida em objeto
export async function gerarJSON({ instrucoes, conteudo, schema, tentativas = 2 }) {
    if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY não definida no .env');
    }
    ai ??= new GoogleGenAI({});

    const inicio = Date.now();

    for (const modelo of MODELOS) {
        for (let tentativa = 1; tentativa <= tentativas; tentativa++) {
            const restante = PRAZO_TOTAL_MS - (Date.now() - inicio);
            if (restante < TEMPO_MINIMO_MS) {
                throw new Error('a LLM não respondeu dentro do prazo');
            }

            try {
                const response = await ai.models.generateContent({
                    model: modelo,
                    contents: conteudo,
                    config: {
                        systemInstruction: instrucoes,
                        responseMimeType: 'application/json',
                        responseJsonSchema: schema,
                        //desiste da chamada se passar do limite (ou do que sobra do prazo)
                        httpOptions: { timeout: Math.min(TEMPO_POR_CHAMADA_MS, restante) }
                    }
                });
                return JSON.parse(response.text);
            } catch (erro) {
                //AbortError: a chamada passou do tempo limite
                const estourouTempo = erro.name === 'AbortError';
                if (!estourouTempo && !ERROS_TEMPORARIOS.includes(erro.status)) throw erro;

                console.log(`${modelo}: tentativa ${tentativa} falhou (${estourouTempo ? 'tempo esgotado' : `erro ${erro.status}`}).`);
                if (tentativa < tentativas) await esperar(1000 * 2 ** (tentativa - 1));
            }
        }
    }
    throw new Error('nenhum modelo disponível no momento');
}
