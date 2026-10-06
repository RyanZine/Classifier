# Classifier — Classificador de Perfil de Aluno com TensorFlow.js em Node.js

\--Image of: --Node.js --Image of: --TensorFlow.js --Image of: --JavaScript --Image of: --License

O **Classifier** (repositório: `node-tfjs-student-classifier`) é um microsserviço autônomo de Inteligência Artificial desenvolvido em **Node.js** com **TensorFlow.js**. O sistema analisa o histórico semanal de estudos e o nível de senioridade técnica de um desenvolvedor para classificar seu perfil e recomendar automaticamente o plano de estudos mais adequado (**Basic** ou **Pro**).

---

## 🎯 Objetivos do Projeto

### Objetivo Técnico

Demonstrar a implementação ponta a ponta de um pipeline de Machine Learning no ecossistema JavaScript/Node.js sem dependência de bibliotecas Python ou serviços de nuvem externos. O projeto cobre:

* Sanitização e vetorização de dados brutos (*Min-Max Normalization* e *One-Hot Encoding*).
* Manipulação de Tensores bidimensionais (`tf.tensor2d`).
* Construção e compilação de uma rede neural profunda com camadas **ReLU** e **Softmax**.
* Treinamento por épocas com otimizador **Adam** e avaliação de métricas de perda (*loss*).
* Gerenciamento estrito de memória de tensores via `.dispose()`.

### Objetivo Comercial

Automatizar o processo de *onboarding* e personalização de ofertas em plataformas digitais, direcionando o cliente para o plano ideal no momento do cadastro. A solução atinge **custo zero de infraestrutura de IA**, pois elimina a cobrança por requisição/tokens associada a APIs de terceiros.

---

## 👥 Público-Alvo e Necessidade de Mercado

### Público-Alvo

1. **EdTechs e Plataformas de Ensino:** Plataformas que precisam recomendar cursos, trilhas e planos de forma personalizada.
2. **SaaS e E-commerce:** Empresas que buscam motores de recomendação leves para personalização de ofertas.
3. **Recrutadores e Lideranças Técnicas:** Avaliadores que buscam comprovar domínio técnico em engenharia de software aplicada à IA no ambiente Node.js.

### Valor de Mercado e Resolução de Dores

* **Economia de Escala:** Processamento local sem custos recorrentes de chamadas a APIs pagas.
* **Privacidade e LGPD/GDPR:** Todo o treinamento e inferência ocorrem na memória local, sem tráfego de dados sensíveis do usuário para a nuvem.
* **Ultra Baixa Latência:** Respostas calculadas em menos de **10 milissegundos**, sem gargalos de conexões HTTP externas.

---

## 📋 Requisitos do Sistema

### Requisitos Funcionais (RF)

* **RF01 - Ingestão de Dados:** Recebimento de registros brutos (horas de estudo e nível de senioridade).
* **RF02 - Normalização de Dados:** Aplicação de escala min-max para ajustar as horas de estudo no intervalo $[0, 1]$.
* **RF03 - Codificação Categórica (*One-Hot Encoding*):** Mapeamento binário do nível de senioridade (Iniciante, Pleno, Sênior) em vetores de 3 posições.
* **RF04 - Arquitetura Neural:** Construção de modelo sequencial (`tf.sequential`) com camada oculta **ReLU** e camada de saída **Softmax**.
* **RF05 - Ciclo de Treinamento:** Ajuste de pesos e viéses ao longo de 100 épocas utilizando otimizador **Adam** e função de perda *Categorical Crossentropy*.
* **RF06 - Serviço de Inferência:** Vetorização em tempo real de novos perfis e emissão de recomendação baseada na maior probabilidade.

### Requisitos Não-Funcionais (RNF)

* **RNF01 - Ambiente de Execução:** Compatibilidade com **Node.js v20+ / v22+** e suporte a ES Modules (`import/export`).
* **RNF02 - Engine de IA:** Utilização do pacote nativo `@tensorflow/tfjs-node` com bindings em C++.
* **RNF03 - Performance:** Latência de inferência inferior a **10 ms** por requisição pós-treino.
* **RNF04 - Autonomia:** Execução 100% offline e independente.
* **RNF05 - Gestão de Memória:** Desalocação explícita de tensores da memória V8/C++ através do método `.dispose()`.

---

## 🏗️ Arquitetura do Sistema

A aplicação está dividida em **3 camadas principais**:

```
[Dados Brutos (JS)] ➔ [1. Camada de Pré-Processamento] ➔ Tensores (xs, ys)
                                                               │
                                                               ▼
[Predição / Decisão] 🧮 [3. Camada de Inferência] ◄── [2. Camada Neural (TF.js)]

```

### Detalhamento da Rede Neural

| Camada      | Tipo      | Neurônios / Unidades | Ativação    | Função na Arquitetura                                                 |
| ----------- | --------- | -------------------- | ----------- | --------------------------------------------------------------------- |
| **Entrada** | Tensor 2D | 4 atributos          | N/A         | Recebe o vetor $[HorasNorm, Iniciante, Pleno, Senior]$.             |
| **Oculta**  | Dense     | 8 neurônios          | **ReLU**    | Extrai padrões não-lineares das combinações de entrada.               |
| **Saída**   | Dense     | 2 neurônios          | **Softmax** | Retorna a distribuição de probabilidade $[Prob\_Basic, Prob\_Pro]$. |

---

## 🛠️ Tecnologias Utilizadas

* **Linguagem:** JavaScript (Node.js ES2022)
* **Framework de IA:** `@tensorflow/tfjs-node`
* **Gerenciador de Pacotes:** `npm`
* **Controle de Versão:** Git &amp; GitHub

---

## 🌀 Estratégia de Execução

O projeto foi desenvolvido segundo o **Modelo Espiral (Iterativo e Incremental)**:

1. **Concepção &amp; Prova de Conceito (MVP):** Validação dos scripts de normalização e vetorização de dados.
2. **Ciclo de Arquitetura &amp; Treino:** Construção da topologia da rede neural e ajuste de hiperparâmetros (épocas, taxa de aprendizado e otimizador).
3. **Refatoração &amp; Performance:** Validação dos tempos de resposta e inclusão de descarte explícito de tensores com `.dispose()`.
4. **Documentação &amp; Publicação:** Produção de documentação técnica e estruturação do repositório para exibição em portfólio.

---

## 📅 Cronograma de Desenvolvimento

| Sprint       | Fase                 | Principais Atividades                                                         | Entregável                      |
| ------------ | -------------------- | ----------------------------------------------------------------------------- | ------------------------------- |
| **Sprint 1** | Modelagem &amp; Ingestão | Configuração do projeto Node.js e funções de Normalização / One-Hot Encoding. | Módulo de pré-processamento.    |
| **Sprint 2** | Arquitetura Neural   | Instalação do `@tensorflow/tfjs-node` e montagem das camadas ReLU/Softmax.    | Estrutura do modelo compilada.  |
| **Sprint 3** | Treino &amp; Calibração  | Execução do ciclo de 100 épocas e monitoramento das curvas de *loss*.         | Script de treinamento validado. |
| **Sprint 4** | Inferência &amp; Deploy  | Implementação do pipeline de predição em tempo real e escrita do `README.md`. | Repositório público no GitHub.  |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos

* **Node.js** v20.x ou superior.
* Gerenciador de pacotes **npm**.

### Passo a Passo

1. **Clonar o repositório:**  
```  
git clone https://github.com/seu-usuario/node-tfjs-student-classifier.git  
```
2. **Acessar a pasta do projeto:**  
```  
cd node-tfjs-student-classifier  
```
3. **Instalar as dependências:**  
```  
npm install  
```
4. **Executar o treinamento e a predição:**  
```  
node index.js  
```

---

## 👤 Autor

**Seu Nome**

* **GitHub:** [@RyanZine](https://www.google.com/url?sa=E&amp;q=https%3A%2F%2Fgithub.com%2Fseu-usuario)
* **LinkedIn:** [Ryan Zinedine](https://www.google.com/url?sa=E&amp;q=https%3A%2F%2Flinkedin.com%2Fin%2Fseu-perfil)
* **Cargo/Objetivo:** Desenvolvedor front-end junior
