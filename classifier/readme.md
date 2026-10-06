# Classifier — Recomendação de Trilhas de Estudo com Machine Learning + LLM

O **Classifier** é uma plataforma de recomendação educacional que combina dois tipos de IA, cada um no papel em que é mais forte:

* Um **modelo de Machine Learning próprio** (TensorFlow.js em Node.js) que **classifica o perfil do aluno** e **aprende continuamente** com os dados que entram na plataforma (treinamento + *fine-tuning*).
* Uma **LLM com escopo limitado** que transforma essa classificação em uma **trilha de estudos personalizada e explicada**, montada apenas a partir do catálogo de conteúdos da própria plataforma.

> O ML decide **quem é o aluno**. A LLM decide **como explicar e sequenciar o caminho** — sem inventar cursos, sem chat livre e com custo previsível.

---

## 🎯 Objetivos

### Objetivo Técnico

Demonstrar um sistema de recomendação de ponta a ponta no ecossistema JavaScript, cobrindo:

* Ingestão e validação de dados de alunos via API.
* Pré-processamento (*Min-Max Normalization*, *One-Hot Encoding*) e vetorização em tensores.
* Classificação com rede neural (`tf.sequential`, camadas **ReLU** e **Softmax**).
* **Ciclo de aprendizado contínuo:** *fine-tuning* periódico com dados novos, avaliação em base de teste e promoção controlada de versões do modelo.
* Integração com LLM usando **saída estruturada (JSON)**, catálogo fechado e limites de custo.

### Objetivo Comercial

Oferecer a **EdTechs, bootcamps e áreas de T&D corporativo** um motor de recomendação *plug-and-play* que:

* **Personaliza o onboarding** de cada aluno no momento do cadastro, aumentando a conversão para o plano adequado.
* **Aumenta a taxa de conclusão** ao entregar uma trilha coerente com o nível e a disponibilidade reais da pessoa.
* **Escala com custo controlado:** a classificação roda localmente em milissegundos e sem custo por requisição; a LLM é chamada **uma vez por trilha gerada**, não a cada interação.
* **Melhora sozinho com o uso:** cada aluno que conclui (ou abandona) uma trilha vira um novo exemplo de treino.

---

## 👥 Público-Alvo

| Segmento | Dor | Como o Classifier resolve |
| --- | --- | --- |
| **EdTechs e plataformas de cursos** | Alunos perdidos em catálogos grandes; baixa conclusão | Trilha personalizada já no cadastro |
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

Endpoint que recebe o perfil do aluno e valida cada campo antes de qualquer processamento. Valores fora do domínio (ex.: senioridade desconhecida, horas negativas) são rejeitados com erro claro, em vez de gerar uma previsão silenciosamente errada.

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
| Novas tentativas e troca de modelo | *Retry* com *backoff* exponencial em erros 429/500/503; lista de modelos em ordem de preferência | Picos de demanda do provedor não derrubam o serviço |
| Trilha padrão | Gerada do catálogo, sem LLM, por ordenação topológica dos pré-requisitos | O aluno sempre recebe uma trilha |
| Sem dados pessoais no prompt | Só horas, senioridade, plano e confiança | Privacidade e conformidade com a LGPD |
| Uma geração por aluno | A LLM é chamada só ao gerar ou atualizar a trilha | Custo previsível em escala |

### 5. Feedback

A plataforma registra o que aconteceu depois da recomendação: **conclusão da trilha, abandono, avaliação do aluno e mudança de plano**. Esses eventos viram os **rótulos** dos novos exemplos de treino.

### 6. Aprendizado contínuo (fine-tuning)

Executado periodicamente (ex.: `npm run retrain`), fora do caminho da requisição:

1. Carrega o modelo em produção e os dados novos rotulados.
2. Treina com **dados novos + amostra dos antigos**, evitando o *esquecimento catastrófico*.
3. Avalia o novo modelo em uma **base de teste separada**.
4. **Promove a nova versão só se ela superar a atual** (*champion/challenger*); caso contrário, mantém a anterior.
5. Salva o modelo versionado (`model.json` + `weights.bin` + parâmetros de pré-processamento).

---

## 📋 Requisitos do Sistema

### Requisitos Funcionais (RF)

* **RF01 — Ingestão:** receber e validar perfis de alunos via API.
* **RF02 — Pré-processamento:** normalizar e codificar atributos de forma idêntica no treino e na inferência.
* **RF03 — Classificação:** retornar o perfil do aluno com probabilidade associada.
* **RF04 — Geração de trilha:** produzir trilha em JSON a partir do perfil e do catálogo, via LLM.
* **RF05 — Validação da trilha:** descartar trilhas com módulos fora do catálogo, repetidos ou fora da ordem de pré-requisitos.
* **RF06 — Feedback:** registrar conclusão, abandono e avaliação das trilhas.
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
* **Processamento em lote** (previsto): para onboarding em massa, quando a trilha não precisa ser instantânea.

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
| Conversão de plano no onboarding | Impacto comercial |
| Acurácia do classificador na base de teste | Qualidade do modelo de ML |
| Custo médio por trilha | Eficiência da LLM |
| Taxa de módulos inválidos devolvidos pela LLM | Efetividade dos limites |

---

## 🛠️ Tecnologias

* **Linguagem:** JavaScript (Node.js, ES Modules)
* **Machine Learning:** `@tensorflow/tfjs-node`
* **LLM:** Google Gemini (`@google/genai`) com saída estruturada em JSON Schema, isolada em `src/llm/gemini.js` para permitir a troca de provedor
* **Configuração:** variáveis de ambiente lidas nativamente pelo Node (`--env-file`)
* **API (planejado):** Fastify ou Express
* **Validação de entrada (planejado):** Zod
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
| Novas tentativas e troca automática de modelo | ✅ Implementado |
| API de ingestão e validação | 🔜 Planejado |
| Coleta de feedback | 🔜 Planejado |
| Fine-tuning com promoção de versões | 🔜 Planejado |
| Docker e deploy | 🔜 Planejado |

> A prova de conceito do classificador (pipeline de ML isolado) está preservada no branch [`conceito/sistema-recomendacao-ml`](https://github.com/RyanZine/Classifier/tree/conceito/sistema-recomendacao-ml).

### Limitações conhecidas

* **Base de treino mínima:** o classificador é treinado com 6 exemplos, suficientes para demonstrar o pipeline, mas não para generalizar. A acurácia de 100% no treino reflete memorização.
* **Trilha padrão e senioridade:** a senioridade mede a experiência em programação, não na área escolhida. Um aluno Pleno pode pular o módulo de entrada de uma área nova (ex.: Scikit-learn em IA). Melhoria prevista: dispensar pelo nível apenas os módulos da base.
* **Validação estrutural:** o sistema confere módulos, ordem e repetição, mas não a coerência do texto das justificativas geradas pela LLM.
* **Modelo por apelido:** `gemini-flash-latest` pode apontar para versões diferentes ao longo do tempo. Em produção, o modelo deve ser fixado por versão.
* **Compatibilidade do TensorFlow.js:** `@tensorflow/tfjs-node` 4.22 exige um ajuste (`src/tf.js`) para rodar no Node 23+ e, no Windows, a cópia manual da `tensorflow.dll` após a instalação.

---

## 📅 Roadmap

| Sprint | Fase | Entregável |
| --- | --- | --- |
| **Sprint 1** | API e ingestão | Servidor HTTP, rota de cadastro, validação e persistência |
| **Sprint 2** | Classificação em serviço | Modelo carregado na inicialização; rota de classificação |
| **Sprint 3** ✅ | LLM e trilhas | Catálogo, prompt, saída estruturada, validação e fallback (protótipo concluído) |
| **Sprint 4** | Aprendizado contínuo | Feedback, `npm run retrain`, avaliação e versionamento |
| **Sprint 5** | Produto | Docker, documentação da API e demonstração pública |

---

## 🚀 Como executar (estado atual)

### Pré-requisitos

* Node.js 20 ou 22 LTS
* npm
* Uma chave da API da Gemini, gerada gratuitamente no [Google AI Studio](https://aistudio.google.com) (opcional: sem ela, o sistema usa a trilha padrão)

### Passo a passo

```bash
git clone https://github.com/RyanZine/Classifier.git
cd Classifier/classifier
npm install
```

Crie um arquivo `.env` na pasta `classifier`, a partir do modelo `.env.example`:

```
GEMINI_API_KEY=sua_chave_aqui
```

Depois:

```bash
npm start                  # classifica um aluno de exemplo e gera a trilha de estudos
npm test                   # testa pré-processamento, tensores, treino e previsão
node teste-validacao.js    # testa a validação e as trilhas padrão (sem chamar a API)
```

> O arquivo `.env` contém a chave da API e **nunca** deve ser enviado ao repositório (já está no `.gitignore`).

---

## 👤 Autor

**Ryan Zinedine**

* **GitHub:** [@RyanZine](https://github.com/RyanZine)
* **LinkedIn:** [Ryan Zinedine](https://linkedin.com/in/seu-perfil)
