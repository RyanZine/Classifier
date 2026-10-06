import {areas, filtrarCatalogo} from './src/catalogo.js';
import {validarEtapas, trilhaPadrao} from './src/llm/trilha.js';

const modulos = filtrarCatalogo('python', 'dados');

//respostas simuladas da LLM
const casos = {
    'trilha válida':      [{ moduloId: 'py-logica' }, { moduloId: 'py-fundamentos' }, { moduloId: 'py-pandas' }],
    'módulo inventado':   [{ moduloId: 'py-logica' }, { moduloId: 'curso-falso' }],
    'módulo repetido':    [{ moduloId: 'py-logica' }, { moduloId: 'py-logica' }],
    'ordem errada':       [{ moduloId: 'py-pandas' }, { moduloId: 'py-fundamentos' }],
    'trilha vazia':       []
};

console.log('--- VALIDAÇÃO (aluno Iniciante) ---');
for (const [nome, etapas] of Object.entries(casos)) {
    try {
        validarEtapas(etapas, modulos, 'Iniciante');
        console.log(`${nome}: aceita`);
    } catch (erro) {
        console.log(`${nome}: rejeitada → ${erro.message}`);
    }
}

console.log('\n--- TRILHA PADRÃO ---');
for (const senioridade of ['Iniciante', 'Pleno', 'Senior']) {
    const trilha = trilhaPadrao(filtrarCatalogo('python', 'financas'), senioridade);
    console.log(`${senioridade}: ${trilha.etapas.map(e => e.id).join(' > ')}`);
}

//confere se a trilha padrão de TODAS as áreas passa na própria validação
let total = 0;
for (const linguagem in areas) {
    for (const area in areas[linguagem]) {
        if (area === 'base') continue;
        for (const senioridade of ['Iniciante', 'Pleno', 'Senior']) {
            const mods = filtrarCatalogo(linguagem, area);
            const etapas = trilhaPadrao(mods, senioridade).etapas.map(e => ({ moduloId: e.id }));
            validarEtapas(etapas, mods, senioridade);
            total++;
        }
    }
}
console.log(`\nTrilhas padrão válidas: ${total} de ${total}`);
