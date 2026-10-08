//O simulador da landing page (../docs) usa cópias de arquivos do sistema.
//Estes testes falham se o sistema mudar e as cópias ficarem desatualizadas.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

//compara o conteúdo ignorando a diferença de fim de linha (Windows × Linux)
const ler = (caminho) => fs.readFileSync(new URL(caminho, import.meta.url)).toString('latin1').replace(/\r\n/g, '\n');

const COPIAS = [
    ['../src/catalogo.js', '../../docs/js/catalogo.js'],
    ['../src/processing.js', '../../docs/js/processing.js']
];

for (const [original, copia] of COPIAS) {
    test(`docs: ${copia.split('/').pop()} é igual a src/${original.split('/').pop()}`, () => {
        assert.equal(ler(copia), ler(original), `copie de novo: ${original} → ${copia}`);
    });
}

//o modelo só existe depois do primeiro treino (modelo_salvo/ não vai para o Git)
const temModelo = fs.existsSync(new URL('../modelo_salvo/model.json', import.meta.url));

test('docs: o modelo do simulador é o mesmo modelo treinado', { skip: !temModelo && 'modelo_salvo/ ainda não existe' }, () => {
    for (const arquivo of ['model.json', 'weights.bin']) {
        assert.ok(
            fs.readFileSync(new URL(`../modelo_salvo/${arquivo}`, import.meta.url))
                .equals(fs.readFileSync(new URL(`../../docs/modelo/${arquivo}`, import.meta.url))),
            `copie de novo: modelo_salvo/${arquivo} → docs/modelo/${arquivo}`
        );
    }
});
