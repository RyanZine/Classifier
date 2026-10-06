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

Atributos previstos:

| Atributo | Tipo | Exemplo |
| --- | --- | --- |
| `horasEstudo` | numérico (h/semana) | `8` |
| `senioridade` | categórico | `Iniciante`, `Pleno`, `Senior` |
| `objetivo` | categórico | `Front-end`, `Back-end`, `Dados`, `IA` |
| `conhecimentosPrevios` | lista | `["JavaScript", "Git"]` |
| `prazoMeses` | numérico | `6` |

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

A LLM **não decide o perfil** e **não conversa livremente**. Ela recebe:

* o perfil e a confiança calculados pelo classificador;
* os dados do aluno (sem dados pessoais identificáveis);
* o **catálogo fechado** de módulos da plataforma;

e devolve uma trilha em **JSON validado por schema**, por exemplo:

```json
{
  "perfil": "Pro",
  "duracaoSemanas": 12,
  "etapas": [
    {
      "ordem": 1,
      "moduloId": "node-fundamentos",
      "justificativa": "Base necessária para os módulos de API, considerando 8h/semana disponíveis."
    }
  ]
}
```

**Por que "limitada":**

| Limite | Motivo |
| --- | --- |
| Só pode usar módulos do catálogo (IDs validados após a resposta) | Evita recomendar cursos inexistentes (alucinação) |
| Saída estruturada com schema | Resposta sempre processável pelo sistema |
| Teto de tokens por requisição | Custo previsível por trilha |
| Uma geração por aluno (e por atualização de perfil) | Escala sem custo por interação |
| Sem dados pessoais no prompt | Privacidade e conformidade com a LGPD |
| Trilha padrão por perfil quando a LLM estiver indisponível | O serviço continua respondendo |

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
* **RF05 — Validação da trilha:** descartar ou corrigir etapas com módulos fora do catálogo.
* **RF06 — Feedback:** registrar conclusão, abandono e avaliação das trilhas.
* **RF07 — Fine-tuning:** retreinar o modelo com dados novos e promover versões apenas após avaliação.
* **RF08 — Fallback:** entregar trilha padrão por perfil quando a LLM não responder.

### Requisitos Não-Funcionais (RNF)

* **RNF01 — Ambiente:** Node.js 20/22 LTS com ES Modules.
* **RNF02 — Engine de ML:** `@tensorflow/tfjs-node`, inferência local.
* **RNF03 — Latência:** classificação abaixo de 10 ms após o modelo carregado; o modelo é carregado uma única vez na inicialização.
* **RNF04 — Custo:** chamada à LLM limitada a uma por geração de trilha, com teto de tokens.
* **RNF05 — Privacidade:** nenhum dado pessoal identificável enviado à LLM.
* **RNF06 — Memória:** desalocação explícita de tensores com `.dispose()`.
* **RNF07 — Reprodutibilidade:** modelo e parâmetros de pré-processamento versionados juntos.

---

## 💰 Estimativa de custo da LLM

Valores ilustrativos, considerando o modelo padrão `claude-opus-5-5` (US$ 4 por milhão de tokens de entrada e US$ 20 por milhão de saída) e uma trilha com ~3.000 tokens de entrada e ~1.500 de saída:

| Item | Cálculo | Custo aprox. |
| --- | --- | --- |
| Entrada | 3.000 × US$ 4 / 1M | US$ 0,012 |
| Saída | 1.500 × US$ 20 / 1M | US$ 0,030 |
| **Por trilha gerada** | | **≈ US$ 0,04** |

Alavancas para reduzir o custo em escala:

* **Prompt caching** do catálogo e das instruções, que se repetem em toda requisição.
* **Batch API** (≈ 50% mais barata) para onboarding em massa, quando a trilha não precisa ser instantânea.
* Ajuste do nível de esforço (`effort`) do modelo conforme a complexidade do catálogo.
* Modelo configurável por variável de ambiente, para cada cliente escolher o equilíbrio entre custo e qualidade.

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
* **LLM:** Claude API (`@anthropic-ai/sdk`) com saída estruturada
* **API:** Fastify ou Express
* **Validação:** Zod
* **Persistência:** SQLite (desenvolvimento) → PostgreSQL (produção)
* **Infraestrutura:** Docker
* **Controle de versão:** Git & GitHub

---

## 🚦 Status do projeto

| Componente | Status |
| --- | --- |
| Pré-processamento (Min-Max, One-Hot) | ✅ Implementado |
| Classificador TF.js (ReLU + Softmax) | ✅ Implementado |
| Treino, salvamento e carregamento do modelo | ✅ Implementado |
| API de ingestão e validação | 🔜 Planejado |
| Geração de trilha com LLM | 🔜 Planejado |
| Coleta de feedback | 🔜 Planejado |
| Fine-tuning com promoção de versões | 🔜 Planejado |
| Docker e deploy | 🔜 Planejado |

> A prova de conceito do classificador (pipeline de ML isolado) está preservada no branch [`conceito/sistema-recomendacao-ml`](https://github.com/RyanZine/Classifier/tree/conceito/sistema-recomendacao-ml).

---

## 📅 Roadmap

| Sprint | Fase | Entregável |
| --- | --- | --- |
| **Sprint 1** | API e ingestão | Servidor HTTP, rota de cadastro, validação e persistência |
| **Sprint 2** | Classificação em serviço | Modelo carregado na inicialização; rota de classificação |
| **Sprint 3** | LLM e trilhas | Catálogo, prompt, saída estruturada, validação e fallback |
| **Sprint 4** | Aprendizado contínuo | Feedback, `npm run retrain`, avaliação e versionamento |
| **Sprint 5** | Produto | Docker, documentação da API e demonstração pública |

---

## 🚀 Como executar (estado atual)

### Pré-requisitos

* Node.js 20 ou 22 LTS
* npm

### Passo a passo

```bash
git clone https://github.com/RyanZine/Classifier.git
cd Classifier/classifier
npm install
npm start      # treina (ou carrega o modelo salvo) e faz uma previsão de exemplo
npm test       # testa pré-processamento, tensores, treino e previsão
```

---

## 👤 Autor

**Ryan Zinedine**

* **GitHub:** [@RyanZine](https://github.com/RyanZine)
* **LinkedIn:** [Ryan Zinedine](https://linkedin.com/in/seu-perfil)
