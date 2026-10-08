//Cópia da trilha padrão de classifier/src/llm/trilha.js, sem a parte da LLM,
//para rodar no navegador.

const NIVEIS = ['Iniciante', 'Pleno', 'Senior'];

//trilha montada sem LLM: módulos do nível do aluno para cima, em ordem de pré-requisitos
export function trilhaPadrao(modulos, senioridade) {
    const nivelAluno = NIVEIS.indexOf(senioridade);
    const pendentes = modulos.filter(modulo => NIVEIS.indexOf(modulo.nivel) >= nivelAluno);
    const trilha = [];

    while (pendentes.length > 0) {
        //próximo módulo: aquele cujos pré-requisitos já estão na trilha (ou foram dispensados)
        const i = pendentes.findIndex(modulo => modulo.preRequisitos.every(pre =>
            trilha.some(e => e.id === pre) || !pendentes.some(p => p.id === pre)
        ));

        trilha.push({ ...pendentes[i], justificativa: 'Etapa da trilha padrão.' });
        pendentes.splice(i, 1);
    }

    return { origem: 'padrao', resumo: 'Trilha padrão montada a partir do catálogo.', etapas: trilha };
}
