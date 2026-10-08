//armazena os feedbacks dos alunos para usar no retreino do classificador
import fs from 'node:fs';
import path from 'node:path';

const ARQUIVO = process.env.ARQUIVO_FEEDBACKS || './dados/feedbacks.jsonl';

const PLANOS = ['Basic', 'Pro'];
const SENIORIDADES = ['Iniciante', 'Pleno', 'Senior'];

//guarda um feedback; "plano" é o rótulo
export function salvarFeedback({ horasEstudo, senioridade, planoRecomendado, plano}) {
    const registro = {horasEstudo, senioridade, planoRecomendado, plano, data: new Date().toISOString()};

    fs.mkdirSync(path.dirname(ARQUIVO), {recursive: true});
    fs.appendFileSync(ARQUIVO, JSON.stringify(registro) + '\n');

    return registro;
}

//lê os feedbacks válidos. corrompidos ou fora das regras são ignoradas
export function lerFeedbacks() {
    if (!fs.existsSync(ARQUIVO)) return [];

    return fs.readFileSync(ARQUIVO, 'utf8')
    .split('\n')
    .filter(linha => linha.trim())
    .map(linha => {
        try {return JSON.parse(linha); } catch {return null;}
    })
    .filter(ehFeedbackValido);
}

export function ehFeedbackValido(feedback) {
    return feedback !== null
    && typeof feedback.horasEstudo === 'number'
    && feedback.horasEstudo > 0 && feedback.horasEstudo <= 40
    && SENIORIDADES.includes(feedback.senioridade)
    && PLANOS.includes(feedback.plano);
}