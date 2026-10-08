//Arquivo responsavel pelo processamento de dados e preparação para o modelo de classificação

//normalização min - max
export function normalizeValue(value, min, max) {
    if (max === min) return 0;
    return(value - min) / (max - min);
}

//one-hot encoding
export function oneHotEncode(value, categories) {
    return categories.map(category => category === value ? 1 : 0);
}

//monta o vetor de entrada de um aluno
export function buildInputVector(student, minHours = 0, maxHours = 10) {
    const levels = ['Iniciante', 'Pleno', 'Senior'];

    //normaliza o valor de horas de estudo
    const hoursNorm = normalizeValue(student.horasEstudo, minHours, maxHours);

    //codificação do nível de senioridade
    const levelEncoded = oneHotEncode(student.senioridade, levels);

    //Junta todos os atributos
    return [...levelEncoded, hoursNorm];
}
