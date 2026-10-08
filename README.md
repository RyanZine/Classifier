# Projects — Engenharia de IA Aplicada

Repositório de **projetos e testes** em Engenharia de IA Aplicada.

Cada pasta é um projeto independente, com código, documentação e testes próprios. Aqui ficam tanto projetos completos, com demonstração publicada, quanto experimentos e provas de conceito usados para estudar uma técnica antes de aplicá-la.

---

## 🎯 Objetivos

* **Aprender na prática:** transformar conceitos de Machine Learning e LLMs em sistemas que funcionam de ponta a ponta.
* **Documentar o processo:** registrar decisões técnicas, limitações e alternativas consideradas, não só o resultado final.
* **Testar tecnologias:** avaliar bibliotecas, modelos e abordagens em cenários concretos antes de usá-los em projetos maiores.
* **Aplicar boas práticas:** testes automatizados, validação de dados, tratamento de falhas e proteção de chaves de API desde o protótipo.
* **Formar um portfólio:** reunir projetos que mostrem como problemas reais são resolvidos com IA.

---

## 📐 Escopo

**Dentro do escopo:**

* Sistemas de recomendação, classificação e outros modelos de Machine Learning.
* Integração com LLMs com escopo controlado (saída estruturada, validação e plano B).
* Protótipos com interface web para demonstrar o funcionamento.
* Testes e experimentos isolados para estudar uma técnica.

**Fora do escopo:**

* Produtos em produção ou com usuários reais.
* Armazenamento de dados pessoais: os projetos usam dados fictícios ou de exemplo.

---

## 📂 Projetos

| Projeto | Descrição | Status | Links |
| --- | --- | --- | --- |
| [**Classifier**](classifier/) | Sistema de recomendação de trilhas de estudo: um classificador em TensorFlow.js recomenda o plano e uma LLM limitada (Gemini) monta a trilha a partir de um catálogo fechado. | Protótipo funcional | [Apresentação](https://ryanzine.github.io/Projects/) · [Simulador](https://ryanzine.github.io/Projects/simulador.html) · [Documentação](classifier/readme.md) |

> A primeira versão do Classifier, só com o pipeline de Machine Learning, está preservada no branch [`conceito/sistema-recomendacao-ml`](https://github.com/RyanZine/Projects/tree/conceito/sistema-recomendacao-ml).

---

## 🗂️ Estrutura

```
Projects/
├── classifier/   # projeto: sistema de recomendação com ML + LLM
├── docs/         # site publicado no GitHub Pages (apresentação e simulador do Classifier)
├── LICENSE
└── README.md     # este arquivo
```

---

## 📏 Convenções

* **Uma pasta por projeto**, com o próprio `README`, `package.json` e dependências.
* **Chaves de API nunca são versionadas:** ficam em um arquivo `.env` local (ignorado pelo Git), e cada projeto traz um `.env.example` com as variáveis necessárias.
* **Testes automatizados** ficam na pasta `testes/` de cada projeto e rodam com `npm test`.
* **Demonstrações públicas** ficam em `docs/`, publicada pelo GitHub Pages.

---

## 🚀 Como executar um projeto

```bash
git clone https://github.com/RyanZine/Projects.git
cd Projects/<pasta-do-projeto>
npm install
```

Os passos específicos (variáveis de ambiente, comandos e testes) estão no `README` de cada projeto.

---

## 👤 Autor

**Ryan Zinedine** · [GitHub](https://github.com/RyanZine)

Distribuído sob a licença [MIT](LICENSE).
