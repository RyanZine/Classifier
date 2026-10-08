<p align="center">
  <img src="../docs/logo-horizontal.svg" alt="Classifier" width="320">
</p>

# Classifier — Recomendação de Trilhas de Estudo com Machine Learning + LLM

O **Classifier** é uma plataforma de recomendação educacional que combina dois tipos de IA, cada um no papel em que é mais forte:

* Um **modelo de Machine Learning próprio** (TensorFlow.js em Node.js) que **classifica o perfil do aluno** e **aprende continuamente** com os dados que entram na plataforma (treinamento + *fine-tuning*).
* Uma **LLM com escopo limitado** que transforma essa classificação em uma **trilha de estudos personalizada e explicada**, montada apenas a partir do catálogo de conteúdos da própria plataforma.

> O ML decide **quem é o aluno**. A LLM decide **como explicar e sequenciar o caminho** — sem inventar cursos, sem chat livre e com custo previsível.

---

## 🎯 Objetivo

### Objetivo Técnico

Demonstrar um sistema de recomendação de ponta a ponta no ecossistema JavaScript, cobrindo:

* Ingestão e validação de dados de alunos via API.
* Pré-processamento (*Min-Max Normalization*, *One-Hot Encoding*) e vetorização em tensores.
* Classificação com rede neural (`tf.sequential`, camadas **ReLU** e **Softmax**).
* **Ciclo de aprendizado contínuo:** *fine-tuning* periódico com dados novos, avaliação em base de teste e promoção controlada de versões do modelo.
* Integração com LLM usando **saída estruturada (JSON)**, catálogo fechado e limites de custo.

---

## 👥 Público-Alvo

| Segmento | Dor | Como o Classifier resolve |
| --- | --- | --- |
| **EdTechs e plataformas de cursos** | Alunos perdidos em catálogos grandes; baixa conclusão | Trilha personalizada a partir do perfil do aluno |
| **Bootcamps** | Turmas heterogêneas; nivelamento manual | Classificação automática de nível + trilha de nivelamento |
| **T&D corporativo / RH** | Planos de desenvolvimento genéricos | Trilhas por cargo, senioridade e disponibilidade do colaborador |
| **Recrutadores e lideranças técnicas** | Avaliar domínio prático de IA aplicada | Projeto completo: ML próprio + LLM + MLOps em Node.js |

---

## 🧭 Como funciona

```
                 ┌──────────────────────────────────────────────┐
  Aluno ───────► │ 1. API de Ingestão (validação dos dados)     │
                 └──────────────────────┬───────────────────────┘
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │ 2. Pré-processamento → vetor de entrada      │
                 └──────────────────────┬───────────────────────┘
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │ 3. Classificador TF.js → perfil + confiança  │◄──┐
                 └──────────────────────┬───────────────────────┘   │
                                        ▼                           │
                 ┌──────────────────────────────────────────────┐   │
                 │ 4. LLM limitada + catálogo → trilha (JSON)   │   │
                 └──────────────────────┬───────────────────────┘   │
                                        ▼                           │
                 ┌──────────────────────────────────────────────┐   │
                 │ 5. Entrega da trilha + coleta de feedback    │   │
                 └──────────────────────┬───────────────────────┘   │
                                        ▼                           │
                 ┌──────────────────────────────────────────────┐   │
                 │ 6. Fine-tuning periódico com dados novos ────┼───┘
                 └──────────────────────────────────────────────┘
```

### 1. Ingestão de dados

O aluno preenche um formulário na interface web, que envia os dados ao endpoint `POST /recomendar` (servidor Fastify). Cada campo é validado por **JSON Schema** antes de qualquer processamento: valores fora do domínio (ex.: senioridade desconhecida, horas fora do intervalo) são rejeitados com erro claro, em vez de gerar uma previsão silenciosamente errada. Campos não previstos no schema (como nome ou e-mail) são descartados automaticamente e nunca chegam ao modelo nem à LLM.

Atributos do aluno:

| Atributo | Tipo | Exemplo | Usado por | Status |
| --- | --- | --- | --- | --- |
| `horasEstudo` | numérico (h/semana) | `8` | classificador e LLM | ✅ |
| `senioridade` | categórico | `Iniciante`, `Pleno`, `Senior` | classificador e LLM | ✅ |
| `linguagem` | categórico | `python`, `javascript` | filtro do catálogo | ✅ |
| `area` | categórico | `ia-ml`, `dados`, `web-frontend` | filtro do catálogo | ✅ |
| `conhecimentosPrevios` | lista | `["JavaScript", "Git"]` | LLM | 🔜 |
| `prazoMeses` | numérico | `6` | LLM | 🔜 |

### 2. Pré-processamento

* **Min-Max** para atributos numéricos (ex.: horas de estudo → intervalo `[0, 1]`).
* **One-Hot Encoding** para atributos categóricos.
* Os parâmetros de normalização e a ordem das categorias são **versionados junto com o modelo**, garantindo que treino e inferência usem exatamente a mesma transformação.

### 3. Classificador (Machine Learning)

Rede neural sequencial em TensorFlow.js:

| Camada | Tipo | Unidades | Ativação | Função |
| --- | --- | --- | --- | --- |
| Entrada | Tensor 2D | N atributos | — | Vetor do aluno, ex.: `[Iniciante, Pleno, Senior, HorasNorm]` |
| Oculta | Dense | 8+ | **ReLU** | Combinações não-lineares dos atributos |
| Saída | Dense | K perfis | **Softmax** | Probabilidade de cada perfil |

A saída é o **perfil do aluno com o grau de confiança** (ex.: `Pro — 94%`), que alimenta a etapa da LLM.

### 4. LLM limitada → trilha de estudos

#### Catálogo

O catálogo (`src/catalogo.js`) é a lista fechada de módulos da plataforma:

* **2 linguagens:** Python e JavaScript.
* **21 áreas:** 11 de Python (IA e ML, dados, web, automação, DevOps, segurança, finanças, computação científica, IoT, desktop, jogos) e 10 de JavaScript (frontend, backend, mobile, desktop, jogos, IA e ML, automação, IoT, extensões e CLI, Web3).
* **69 módulos:** uma base comum por linguagem, mais 3 módulos por área (Iniciante → Pleno → Senior), cada um com carga horária e pré-requisitos.

Para cada aluno, o catálogo é **filtrado** antes de chegar à LLM: entram só a base da linguagem, a área escolhida e os pré-requisitos que estejam em outras áreas. Em vez de 69 módulos, a LLM recebe de 6 a 8, o que reduz custo e chance de erro.

#### Geração

A LLM **não decide o perfil** e **não conversa livremente**. Ela recebe:

* o plano e a confiança calculados pelo classificador;
* horas de estudo e senioridade do aluno (sem dados pessoais identificáveis);
* o **catálogo filtrado**;

e devolve uma trilha em **JSON definido por schema**, por exemplo:

```json
{
  "resumo": "Trilha focada em IA para um desenvolvedor Pleno, respeitando 8h semanais.",
  "etapas": [
    {
      "moduloId": "py-ml-fundamentos",
      "justificativa": "Introduz os conceitos de aprendizado de máquina com Scikit-learn."
    }
  ]
}
```

O sistema completa cada etapa com os dados oficiais do catálogo (título, nível, horas). A LLM fornece apenas a escolha, a ordem e a justificativa.

#### Por que "limitada"

| Limite | Como é aplicado | Motivo |
| --- | --- | --- |
| Catálogo fechado e filtrado | Só a base, a área e os pré-requisitos do aluno são enviados | Evita recomendações fora do perfil e reduz tokens |
| IDs restritos no schema | `enum` com os IDs do catálogo filtrado | A LLM não consegue inventar módulos |
| Validação após a resposta | Rejeita módulo inexistente, repetido, fora de ordem de pré-requisitos ou trilha vazia | Defesa em camadas: não depende só do provedor |
| Saída estruturada | `responseMimeType: application/json` + JSON Schema | Resposta sempre processável pelo sistema |
| Novas tentativas e troca de modelo | *Retry* com *backoff* exponencial em erros 429/500/503/504 e em estouro de tempo; lista de modelos em ordem de preferência | Picos de demanda do provedor não derrubam o serviço |
| Limite de tempo | 15 s por chamada e 30 s no total; depois disso, trilha padrão | O aluno nunca fica esperando indefinidamente |
| Trilha padrão | Gerada do catálogo, sem LLM, por ordenação topológica dos pré-requisitos | O aluno sempre recebe uma trilha |
| Sem dados pessoais no prompt | Só horas, senioridade, plano e confiança | Privacidade e conformidade com a LGPD |
| Uma geração por aluno | A LLM é chamada só ao gerar ou atualizar a trilha | Custo previsível em escala |

### 5. Feedback

Depois de ver o plano recomendado, o aluno responde se ele faz sentido (👍 / 👎). A resposta vira o **rótulo** de um novo exemplo de treino:

* 👍 confirma o plano recomendado;
* 👎 indica o outro plano como o correto.

O feedback é enviado para `POST /feedback`, validado por JSON Schema e guardado em `dados/feedbacks.jsonl` (formato *JSON Lines*: um registro por linha, só acrescentado no fim do arquivo). Os dados de uso não são versionados.

```json
{"horasEstudo":8,"senioridade":"Pleno","planoRecomendado":"Pro","plano":"Basic","data":"2026-10-08T15:28:56.152Z"}
```

> Feedbacks futuros podem incluir conclusão da trilha, abandono e mudança de plano.

### 6. Aprendizado contínuo (fine-tuning)

Executado sob demanda com `npm run retrain`, nunca a cada clique, para que respostas isoladas (ou maliciosas) não mudem o modelo de imediato:

1. **Lê e valida os feedbacks**; linhas corrompidas ou fora das regras são descartadas. Com menos de 5 feedbacks válidos, o retreino não acontece.
2. **Separa os dados:** os 20% de feedbacks mais recentes ficam para teste; o treino usa **dados originais + feedbacks restantes**, evitando o *esquecimento catastrófico*.
3. **Treina o desafiante** por *fine-tuning*: parte do modelo atual, com taxa de aprendizado menor.
4. **Compara campeão × desafiante** na mesma base de teste (dados originais + feedbacks de teste).
5. **Promove o desafiante só se ele não for pior**; o modelo anterior é guardado em `modelos_anteriores/` para permitir voltar atrás.
6. **Registra cada retreino** em `dados/retreinos.jsonl` (data, acurácias e decisão).

O servidor carrega o modelo na inicialização: depois de um retreino promovido, reinicie-o para usar o modelo novo.

---

## 📋 Requisitos do Sistema

### Requisitos Funcionais (RF)

* **RF01 — Ingestão:** receber e validar perfis de alunos via API.
* **RF02 — Pré-processamento:** normalizar e codificar atributos de forma idêntica no treino e na inferência.
* **RF03 — Classificação:** retornar o perfil do aluno com probabilidade associada.
* **RF04 — Geração de trilha:** produzir trilha em JSON a partir do perfil e do catálogo, via LLM.
* **RF05 — Validação da trilha:** descartar trilhas com módulos fora do catálogo, repetidos ou fora da ordem de pré-requisitos.
* **RF06 — Feedback:** registrar se o plano recomendado faz sentido para o aluno, como rótulo de treino.
* **RF07 — Fine-tuning:** retreinar o modelo com dados novos e promover versões apenas após avaliação.
* **RF08 — Fallback:** entregar trilha padrão, montada a partir do catálogo, quando a LLM não responder ou a resposta for inválida.

### Requisitos Não-Funcionais (RNF)

* **RNF01 — Ambiente:** Node.js 20/22 LTS com ES Modules.
* **RNF02 — Engine de ML:** `@tensorflow/tfjs-node`, inferência local.
* **RNF03 — Latência:** classificação abaixo de 10 ms após o modelo carregado; o modelo é carregado uma única vez na inicialização.
* **RNF04 — Custo:** uma chamada à LLM por geração de trilha, com o catálogo filtrado para reduzir tokens.
* **RNF05 — Privacidade:** nenhum dado pessoal identificável enviado à LLM.
* **RNF06 — Memória:** desalocação explícita de tensores com `.dispose()`.
* **RNF07 — Reprodutibilidade:** modelo e parâmetros de pré-processamento versionados juntos.
* **RNF08 — Tempo de resposta:** a geração da trilha tem prazo máximo de 30 s; esgotado o prazo, o aluno recebe a trilha padrão.
* **RNF09 — Segurança da interface:** todo texto vindo da LLM é exibido como texto puro (`textContent`), nunca interpretado como HTML, prevenindo XSS.

---

## 🖥️ Interface web e API

O servidor Fastify (`src/server.js`) carrega o modelo uma única vez na inicialização e expõe:

| Método | Rota | Função |
| --- | --- | --- |
| `GET` | `/` | Interface web (`public/`) |
| `GET` | `/areas` | Linguagens e áreas do catálogo, usadas para montar o formulário |
| `POST` | `/recomendar` | Recebe o perfil do aluno e devolve plano, probabilidades e trilha |
| `POST` | `/feedback` | Recebe a avaliação do aluno sobre o plano e guarda como exemplo de treino |

Exemplo de pedido:

```json
{ "horasEstudo": 8, "senioridade": "Pleno", "linguagem": "python", "area": "ia-ml" }
```

A interface (HTML, CSS e JavaScript puros) mostra as duas etapas de IA separadamente:

1. **Plano recomendado (Machine Learning):** o plano escolhido e as probabilidades de cada classe, em barras.
2. **Trilha de estudos (LLM):** os módulos em ordem, com nível, carga horária, justificativa, total de horas e estimativa de semanas. Um selo indica se a trilha foi **gerada pela IA** ou é a **trilha padrão**.

---

## 💰 Custo da LLM

O protótipo usa a **API da Gemini** em modelos da linha *Flash*, que têm plano gratuito para desenvolvimento.

O custo de uma trilha em produção segue a fórmula:

```
custo por trilha = (tokens de entrada × preço de entrada) + (tokens de saída × preço de saída)
```

Os preços por milhão de tokens variam por modelo e mudam com o tempo; os valores atuais estão na [página oficial de preços da Gemini API](https://ai.google.dev/gemini-api/docs/pricing).

Alavancas já aplicadas ou previstas para manter o custo baixo:

* **Catálogo filtrado** (aplicado): de 6 a 8 módulos por pedido, em vez dos 69.
* **Uma geração por aluno** (aplicado): a LLM não é chamada a cada interação.
* **Modelos *Flash* e *Flash-Lite*** (aplicado): mais rápidos e baratos que os modelos *Pro*.
* **Cache de contexto** (previsto): instruções e catálogo se repetem em toda requisição.
* **Processamento em lote** (previsto): para gerar trilhas de muitos alunos de uma vez, quando a resposta não precisa ser instantânea.

> **Privacidade:** no plano gratuito, o Google pode usar os dados enviados para melhorar seus produtos (confira os termos atuais). Por isso o prompt nunca contém dados pessoais do aluno.

---

## 📈 Escalabilidade e modelo de negócio

* **Multi-tenant:** cada cliente (EdTech, bootcamp, empresa) tem seu próprio catálogo e seu próprio modelo ajustado com os dados dos seus alunos.
* **Custo marginal baixo:** a classificação é local e praticamente gratuita; a LLM entra apenas na geração da trilha.
* **Efeito de rede de dados:** quanto mais alunos usam a plataforma, mais exemplos rotulados e melhor o classificador de cada cliente.
* **Monetização sugerida:** assinatura por aluno ativo, com faixas por volume.

### Métricas de sucesso

| Métrica | O que mede |
| --- | --- |
| Taxa de conclusão de trilha | Qualidade da recomendação |
| Plano recomendado × plano escolhido pelo aluno | Impacto comercial |
| Acurácia do classificador na base de teste | Qualidade do modelo de ML |
| Custo médio por trilha | Eficiência da LLM |
| Taxa de módulos inválidos devolvidos pela LLM | Efetividade dos limites |

---

## 🛠️ Tecnologias

* **Linguagem:** JavaScript (Node.js, ES Modules)
* **Machine Learning:** `@tensorflow/tfjs-node`
* **LLM:** Google Gemini (`@google/genai`) com saída estruturada em JSON Schema, isolada em `src/llm/gemini.js` para permitir a troca de provedor
* **Configuração:** variáveis de ambiente lidas nativamente pelo Node (`--env-file`)
* **API:** Fastify, com `@fastify/static` para servir a interface
* **Validação de entrada:** JSON Schema nativo do Fastify (o mesmo padrão usado para definir a saída da LLM)
* **Interface:** HTML, CSS e JavaScript puros, sem build
* **Persistência (planejado):** SQLite (desenvolvimento) → PostgreSQL (produção)
* **Infraestrutura (planejado):** Docker
* **Controle de versão:** Git & GitHub

---

## 🚦 Status do projeto

| Componente | Status |
| --- | --- |
| Pré-processamento (Min-Max, One-Hot) | ✅ Implementado |
| Classificador TF.js (ReLU + Softmax) | ✅ Implementado |
| Treino, salvamento e carregamento do modelo | ✅ Implementado |
| Catálogo (2 linguagens, 21 áreas, 69 módulos) com filtro por aluno | ✅ Implementado |
| Geração de trilha com LLM (Gemini, JSON Schema) | ✅ Implementado |
| Validação da trilha e trilha padrão (fallback) | ✅ Implementado |
| Novas tentativas, troca automática de modelo e limite de tempo | ✅ Implementado |
| Servidor Fastify com validação por JSON Schema | ✅ Implementado |
| Interface web (formulário, probabilidades e trilha) | ✅ Implementado |
| Persistência dos alunos e das trilhas | 🔜 Planejado |
| Coleta de feedback (👍 / 👎 sobre o plano) | ✅ Implementado |
| Fine-tuning com avaliação, promoção e versionamento | ✅ Implementado |
| Docker e deploy | 🔜 Planejado |

> A prova de conceito do classificador (pipeline de ML isolado) está preservada no branch [`conceito/sistema-recomendacao-ml`](https://github.com/RyanZine/Projects/tree/conceito/sistema-recomendacao-ml).

### Limitações conhecidas

* **Base de treino mínima:** o classificador é treinado com 6 exemplos, suficientes para demonstrar o pipeline, mas não para generalizar. A acurácia de 100% no treino reflete memorização.
* **Trilha padrão e senioridade:** a senioridade mede a experiência em programação, não na área escolhida. Um aluno Pleno pode pular o módulo de entrada de uma área nova (ex.: Scikit-learn em IA). Melhoria prevista: dispensar pelo nível apenas os módulos da base.
* **Validação estrutural:** o sistema confere módulos, ordem e repetição, mas não a coerência do texto das justificativas geradas pela LLM.
* **Latência dependente do provedor:** em horários de pico, a Gemini responde com sobrecarga (erros 429/503), e a trilha pode levar de 20 a 30 segundos ou cair na trilha padrão.
* **Domínio de treino:** o modelo conhece no máximo 10 h semanais; valores maiores são tratados como 10 h na classificação.
* **Modelo por apelido:** `gemini-flash-latest` pode apontar para versões diferentes ao longo do tempo. Em produção, o modelo deve ser fixado por versão.
* **Compatibilidade do TensorFlow.js:** `@tensorflow/tfjs-node` 4.22 exige um ajuste (`src/tf.js`) para rodar no Node 23+ e, no Windows, a cópia manual da `tensorflow.dll` após a instalação.

---

## 📅 Roadmap

| Sprint | Fase | Entregável |
| --- | --- | --- |
| **Sprint 1** 🟡 | API e ingestão | Servidor HTTP, interface e validação ✅; persistência pendente |
| **Sprint 2** ✅ | Classificação em serviço | Modelo carregado na inicialização; rota de recomendação |
| **Sprint 3** ✅ | LLM e trilhas | Catálogo, prompt, saída estruturada, validação e fallback (protótipo concluído) |
| **Sprint 4** ✅ | Aprendizado contínuo | Feedback, `npm run retrain`, avaliação e versionamento |
| **Sprint 5** | Produto | Docker, documentação da API e demonstração pública |

---

## 🚀 Como executar (estado atual)

### Pré-requisitos

* Node.js 20 ou 22 LTS
* npm
* Uma chave da API da Gemini, gerada gratuitamente no [Google AI Studio](https://aistudio.google.com) (opcional: sem ela, o sistema usa a trilha padrão)

### Passo a passo

```bash
git clone https://github.com/RyanZine/Projects.git
cd Projects/classifier
npm install
```

Crie um arquivo `.env` na pasta `classifier`, a partir do modelo `.env.example`:

```
GEMINI_API_KEY=sua_chave_aqui
# opcional: modelos em ordem de preferência
GEMINI_MODELOS=gemini-3.5-flash-lite,gemini-flash-latest
```

Inicie o servidor e abra **http://localhost:3000** no navegador:

```bash
npm run server
```

Outros comandos:

```bash
npm start    # versão de terminal: classifica um aluno de exemplo e gera a trilha
npm test         # roda os testes automatizados (sem chamar a API da LLM)
npm run retrain  # retreina o classificador com os feedbacks coletados
```

### Testes

Os testes ficam em `testes/` e usam o executor nativo do Node (`node:test`):

| Arquivo | O que garante |
| --- | --- |
| `processamento.test.js` | normalização, *one-hot* e vetor de entrada |
| `modelo.test.js` | formato dos tensores, estrutura da rede, treino e separação entre Basic e Pro |
| `catalogo.test.js` | ids únicos, áreas e níveis válidos, pré-requisitos existentes e filtro por aluno |
| `trilha.test.js` | rejeição de respostas inválidas da LLM e trilha padrão válida nas 63 combinações |
| `simulador.test.js` | cópias usadas pelo simulador da landing page (`docs/`) iguais ao sistema |
| `feedback.test.js` | gravação e leitura dos feedbacks, descartando linhas corrompidas e registros inválidos |
| `retreino.test.js` | separação treino/teste, regra de promoção e retreino completo em pastas temporárias |

> O arquivo `.env` contém a chave da API e **nunca** deve ser enviado ao repositório (já está no `.gitignore`).

---

## 👤 Autor

**Ryan Zinedine**

* **GitHub:** [@RyanZine](https://github.com/RyanZine)
* **LinkedIn:** [Ryan Zinedine](https://linkedin.com/in/seu-perfil)
