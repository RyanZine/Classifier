//O tfjs-node 4.22 usa funções do 'util' que foram removidas a partir do Node 23.
//Elas são recriadas aqui antes de carregar o TensorFlow.
import util from 'node:util';

util.isNullOrUndefined ??= value => value === null || value === undefined;
util.isArray ??= Array.isArray;

const tf = await import('@tensorflow/tfjs-node');

export default tf;
