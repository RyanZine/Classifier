//Catálogo fechado de módulos da plataforma.
//A LLM só pode montar trilhas com os IDs listados aqui.

//áreas disponíveis por linguagem (o aluno escolhe uma no cadastro)
export const areas = {
    python: {
        'base':          'Fundamentos de Python',
        'ia-ml':         'Inteligência Artificial e Machine Learning',
        'dados':         'Ciência de Dados, Análise e Big Data',
        'web-backend':   'Desenvolvimento Web (Backend e APIs)',
        'automacao':     'Automação, Web Scraping e Scripts de Sistema',
        'devops':        'DevOps, Infraestrutura e Nuvem',
        'seguranca':     'Cibersegurança e Hacking Ético',
        'financas':      'Mercado Financeiro e Quant Trading',
        'cientifica':    'Computação Científica, Engenharia e Bioinformática',
        'iot':           'Internet das Coisas (IoT) e Hardware',
        'desktop':       'Aplicações Desktop (Interface Gráfica)',
        'jogos':         'Desenvolvimento de Jogos'
    },
    javascript: {
        'base':          'Fundamentos de JavaScript',
        'web-frontend':  'Desenvolvimento Web (Frontend)',
        'web-backend':   'Desenvolvimento Web (Backend)',
        'mobile':        'Aplicativos Móveis',
        'desktop':       'Aplicações para Desktop',
        'jogos':         'Desenvolvimento de Jogos',
        'ia-ml':         'Inteligência Artificial e Machine Learning',
        'automacao':     'Automação, Testes e Web Scraping',
        'iot':           'Internet das Coisas (IoT) e Robótica',
        'extensoes-cli': 'Extensões para Navegadores e Ferramentas CLI',
        'web3':          'Blockchain e Web3'
    }
};

export const catalogo = [
    // ===== PYTHON — base =====
    { id: 'py-logica',      linguagem: 'python', area: 'base', titulo: 'Lógica de Programação com Python', nivel: 'Iniciante', horas: 10, preRequisitos: [] },
    { id: 'py-fundamentos', linguagem: 'python', area: 'base', titulo: 'Python: Fundamentos',              nivel: 'Iniciante', horas: 16, preRequisitos: ['py-logica'] },
    { id: 'py-poo',         linguagem: 'python', area: 'base', titulo: 'Orientação a Objetos em Python',   nivel: 'Pleno',     horas: 12, preRequisitos: ['py-fundamentos'] },

    // ===== PYTHON — ia-ml =====
    { id: 'py-ml-fundamentos', linguagem: 'python', area: 'ia-ml', titulo: 'Fundamentos de Machine Learning com Scikit-learn', nivel: 'Iniciante', horas: 18, preRequisitos: ['py-pandas'] },
    { id: 'py-deep-learning',  linguagem: 'python', area: 'ia-ml', titulo: 'Redes Neurais com PyTorch e TensorFlow',           nivel: 'Pleno',     horas: 24, preRequisitos: ['py-ml-fundamentos', 'py-poo'] },
    { id: 'py-llm-apps',       linguagem: 'python', area: 'ia-ml', titulo: 'LLMs com Hugging Face, LangChain e LlamaIndex',    nivel: 'Senior',    horas: 20, preRequisitos: ['py-deep-learning'] },

    // ===== PYTHON — dados =====
    { id: 'py-pandas',       linguagem: 'python', area: 'dados', titulo: 'Análise de Dados com Pandas e NumPy',   nivel: 'Iniciante', horas: 14, preRequisitos: ['py-fundamentos'] },
    { id: 'py-visualizacao', linguagem: 'python', area: 'dados', titulo: 'Visualização com Matplotlib e Seaborn', nivel: 'Pleno',     horas: 10, preRequisitos: ['py-pandas'] },
    { id: 'py-big-data',     linguagem: 'python', area: 'dados', titulo: 'Big Data com Polars e PySpark',         nivel: 'Senior',    horas: 18, preRequisitos: ['py-pandas', 'py-poo'] },

    // ===== PYTHON — web-backend =====
    { id: 'py-flask',   linguagem: 'python', area: 'web-backend', titulo: 'APIs com Flask',                     nivel: 'Iniciante', horas: 12, preRequisitos: ['py-fundamentos'] },
    { id: 'py-fastapi', linguagem: 'python', area: 'web-backend', titulo: 'APIs REST com FastAPI e SQLAlchemy', nivel: 'Pleno',     horas: 16, preRequisitos: ['py-flask', 'py-poo'] },
    { id: 'py-django',  linguagem: 'python', area: 'web-backend', titulo: 'Plataformas Web com Django',         nivel: 'Senior',    horas: 20, preRequisitos: ['py-fastapi'] },

    // ===== PYTHON — automacao =====
    { id: 'py-automacao-arquivos', linguagem: 'python', area: 'automacao', titulo: 'Automação de Arquivos, Excel e PDF com OpenPyXL', nivel: 'Iniciante', horas: 10, preRequisitos: ['py-fundamentos'] },
    { id: 'py-web-scraping',       linguagem: 'python', area: 'automacao', titulo: 'Web Scraping com BeautifulSoup e Scrapy',          nivel: 'Pleno',     horas: 14, preRequisitos: ['py-automacao-arquivos'] },
    { id: 'py-bots',               linguagem: 'python', area: 'automacao', titulo: 'Bots com Selenium, Playwright e PyAutoGUI',        nivel: 'Senior',    horas: 16, preRequisitos: ['py-web-scraping', 'py-poo'] },

    // ===== PYTHON — devops =====
    { id: 'py-scripts-sistema', linguagem: 'python', area: 'devops', titulo: 'Scripts de Sistema e Ferramentas CLI',           nivel: 'Iniciante', horas: 10, preRequisitos: ['py-fundamentos'] },
    { id: 'py-boto3',           linguagem: 'python', area: 'devops', titulo: 'Automação de Nuvem AWS com Boto3',               nivel: 'Pleno',     horas: 14, preRequisitos: ['py-scripts-sistema'] },
    { id: 'py-iac',             linguagem: 'python', area: 'devops', titulo: 'Infraestrutura como Código com Ansible, SaltStack e Fabric', nivel: 'Senior', horas: 18, preRequisitos: ['py-boto3', 'py-poo'] },

    // ===== PYTHON — seguranca =====
    { id: 'py-cripto-redes', linguagem: 'python', area: 'seguranca', titulo: 'Redes e Criptografia com Python',                  nivel: 'Iniciante', horas: 12, preRequisitos: ['py-fundamentos'] },
    { id: 'py-scapy',        linguagem: 'python', area: 'seguranca', titulo: 'Análise de Tráfego com Scapy e Nmap',              nivel: 'Pleno',     horas: 16, preRequisitos: ['py-cripto-redes'] },
    { id: 'py-pentest',      linguagem: 'python', area: 'seguranca', titulo: 'Pentest e Engenharia Reversa com Impacket e Pwntools', nivel: 'Senior', horas: 22, preRequisitos: ['py-scapy', 'py-poo'] },

    // ===== PYTHON — financas =====
    { id: 'py-dados-financeiros', linguagem: 'python', area: 'financas', titulo: 'Dados Financeiros com yfinance',            nivel: 'Iniciante', horas: 10, preRequisitos: ['py-pandas'] },
    { id: 'py-backtesting',       linguagem: 'python', area: 'financas', titulo: 'Backtesting de Estratégias com Backtrader', nivel: 'Pleno',     horas: 16, preRequisitos: ['py-dados-financeiros'] },
    { id: 'py-quant',             linguagem: 'python', area: 'financas', titulo: 'Quant Trading com Zipline e QuantConnect',  nivel: 'Senior',    horas: 22, preRequisitos: ['py-backtesting', 'py-poo'] },

    // ===== PYTHON — cientifica =====
    { id: 'py-scipy',      linguagem: 'python', area: 'cientifica', titulo: 'Computação Numérica com NumPy e SciPy',              nivel: 'Iniciante', horas: 14, preRequisitos: ['py-fundamentos'] },
    { id: 'py-sympy',      linguagem: 'python', area: 'cientifica', titulo: 'Modelagem Matemática com SymPy',                     nivel: 'Pleno',     horas: 10, preRequisitos: ['py-scipy'] },
    { id: 'py-bio-astro',  linguagem: 'python', area: 'cientifica', titulo: 'Bioinformática e Astronomia com Biopython e Astropy', nivel: 'Senior',   horas: 18, preRequisitos: ['py-sympy', 'py-poo'] },

    // ===== PYTHON — iot =====
    { id: 'py-micropython', linguagem: 'python', area: 'iot', titulo: 'MicroPython e CircuitPython',                    nivel: 'Iniciante', horas: 12, preRequisitos: ['py-fundamentos'] },
    { id: 'py-raspberry',   linguagem: 'python', area: 'iot', titulo: 'Projetos com Raspberry Pi (RPi.GPIO)',           nivel: 'Pleno',     horas: 14, preRequisitos: ['py-micropython'] },
    { id: 'py-embarcados',  linguagem: 'python', area: 'iot', titulo: 'Automação Residencial e Sistemas Embarcados',    nivel: 'Senior',    horas: 18, preRequisitos: ['py-raspberry', 'py-poo'] },

    // ===== PYTHON — desktop =====
    { id: 'py-customtkinter', linguagem: 'python', area: 'desktop', titulo: 'Interfaces Gráficas com CustomTkinter',    nivel: 'Iniciante', horas: 10, preRequisitos: ['py-fundamentos'] },
    { id: 'py-pyqt',          linguagem: 'python', area: 'desktop', titulo: 'Aplicações Desktop com PyQt e PySide',     nivel: 'Pleno',     horas: 16, preRequisitos: ['py-customtkinter', 'py-poo'] },
    { id: 'py-flet-kivy',     linguagem: 'python', area: 'desktop', titulo: 'Apps Multiplataforma com Flet e Kivy',     nivel: 'Senior',    horas: 14, preRequisitos: ['py-pyqt'] },

    // ===== PYTHON — jogos =====
    { id: 'py-pygame', linguagem: 'python', area: 'jogos', titulo: 'Jogos 2D com Pygame',             nivel: 'Iniciante', horas: 14, preRequisitos: ['py-fundamentos'] },
    { id: 'py-arcade', linguagem: 'python', area: 'jogos', titulo: 'Jogos 2D Avançados com Arcade',   nivel: 'Pleno',     horas: 12, preRequisitos: ['py-pygame', 'py-poo'] },
    { id: 'py-3d',     linguagem: 'python', area: 'jogos', titulo: 'Jogos 3D com Panda3D e Ursina',   nivel: 'Senior',    horas: 18, preRequisitos: ['py-arcade'] },

    // ===== JAVASCRIPT — base =====
    { id: 'js-logica',      linguagem: 'javascript', area: 'base', titulo: 'Lógica de Programação com JavaScript', nivel: 'Iniciante', horas: 10, preRequisitos: [] },
    { id: 'js-fundamentos', linguagem: 'javascript', area: 'base', titulo: 'JavaScript: Fundamentos',              nivel: 'Iniciante', horas: 16, preRequisitos: ['js-logica'] },
    { id: 'js-assincrono',  linguagem: 'javascript', area: 'base', titulo: 'JavaScript Assíncrono',                nivel: 'Pleno',     horas: 8,  preRequisitos: ['js-fundamentos'] },

    // ===== JAVASCRIPT — web-frontend =====
    { id: 'js-dom',    linguagem: 'javascript', area: 'web-frontend', titulo: 'HTML, CSS e Manipulação do DOM',          nivel: 'Iniciante', horas: 14, preRequisitos: ['js-fundamentos'] },
    { id: 'js-react',  linguagem: 'javascript', area: 'web-frontend', titulo: 'Interfaces com React (e visão de Vue, Angular e Svelte)', nivel: 'Pleno', horas: 20, preRequisitos: ['js-dom', 'js-assincrono'] },
    { id: 'js-nextjs', linguagem: 'javascript', area: 'web-frontend', titulo: 'Aplicações Full Stack com Next.js',       nivel: 'Senior',    horas: 18, preRequisitos: ['js-react'] },

    // ===== JAVASCRIPT — web-backend =====
    { id: 'js-node',    linguagem: 'javascript', area: 'web-backend', titulo: 'Node.js: Fundamentos (e visão de Deno e Bun)', nivel: 'Iniciante', horas: 12, preRequisitos: ['js-fundamentos'] },
    { id: 'js-express', linguagem: 'javascript', area: 'web-backend', titulo: 'APIs REST com Express e Fastify',              nivel: 'Pleno',     horas: 14, preRequisitos: ['js-node', 'js-assincrono'] },
    { id: 'js-nestjs',  linguagem: 'javascript', area: 'web-backend', titulo: 'APIs Escaláveis com NestJS e GraphQL',         nivel: 'Senior',    horas: 20, preRequisitos: ['js-express'] },

    // ===== JAVASCRIPT — mobile =====
    { id: 'js-expo',          linguagem: 'javascript', area: 'mobile', titulo: 'Primeiros Apps Mobile com Expo',                 nivel: 'Iniciante', horas: 12, preRequisitos: ['js-fundamentos'] },
    { id: 'js-react-native',  linguagem: 'javascript', area: 'mobile', titulo: 'Apps com React Native',                          nivel: 'Pleno',     horas: 20, preRequisitos: ['js-expo', 'js-assincrono'] },
    { id: 'js-mobile-hibrido',linguagem: 'javascript', area: 'mobile', titulo: 'Apps Híbridos e Publicação com Ionic e Capacitor', nivel: 'Senior',  horas: 16, preRequisitos: ['js-react-native'] },

    // ===== JAVASCRIPT — desktop =====
    { id: 'js-electron', linguagem: 'javascript', area: 'desktop', titulo: 'Aplicações Desktop com Electron',              nivel: 'Iniciante', horas: 14, preRequisitos: ['js-fundamentos'] },
    { id: 'js-tauri',    linguagem: 'javascript', area: 'desktop', titulo: 'Apps Leves com Tauri',                         nivel: 'Pleno',     horas: 14, preRequisitos: ['js-electron', 'js-assincrono'] },
    { id: 'js-desktop-distribuicao', linguagem: 'javascript', area: 'desktop', titulo: 'Distribuição e Integração com o Sistema (Electron e NW.js)', nivel: 'Senior', horas: 14, preRequisitos: ['js-tauri'] },

    // ===== JAVASCRIPT — jogos =====
    { id: 'js-canvas', linguagem: 'javascript', area: 'jogos', titulo: 'Jogos 2D com Canvas e PixiJS',                nivel: 'Iniciante', horas: 12, preRequisitos: ['js-fundamentos'] },
    { id: 'js-phaser', linguagem: 'javascript', area: 'jogos', titulo: 'Jogos 2D com Phaser',                         nivel: 'Pleno',     horas: 16, preRequisitos: ['js-canvas'] },
    { id: 'js-3d',     linguagem: 'javascript', area: 'jogos', titulo: 'Jogos e Cenas 3D com Three.js e Babylon.js',  nivel: 'Senior',    horas: 20, preRequisitos: ['js-phaser'] },

    // ===== JAVASCRIPT — ia-ml =====
    { id: 'js-ml-fundamentos', linguagem: 'javascript', area: 'ia-ml', titulo: 'Fundamentos de Machine Learning com Brain.js', nivel: 'Iniciante', horas: 12, preRequisitos: ['js-fundamentos'] },
    { id: 'js-tfjs',           linguagem: 'javascript', area: 'ia-ml', titulo: 'Redes Neurais com TensorFlow.js',              nivel: 'Pleno',     horas: 18, preRequisitos: ['js-ml-fundamentos', 'js-assincrono'] },
    { id: 'js-llm-apps',       linguagem: 'javascript', area: 'ia-ml', titulo: 'LLMs com LangChain.js e Transformers.js',      nivel: 'Senior',    horas: 18, preRequisitos: ['js-tfjs'] },

    // ===== JAVASCRIPT — automacao =====
    { id: 'js-puppeteer',     linguagem: 'javascript', area: 'automacao', titulo: 'Automação de Navegador com Puppeteer',          nivel: 'Iniciante', horas: 10, preRequisitos: ['js-fundamentos'] },
    { id: 'js-testes-e2e',    linguagem: 'javascript', area: 'automacao', titulo: 'Testes E2E com Playwright e Cypress',           nivel: 'Pleno',     horas: 14, preRequisitos: ['js-puppeteer', 'js-assincrono'] },
    { id: 'js-automacao-ci',  linguagem: 'javascript', area: 'automacao', titulo: 'Scraping em Escala, CI e Fluxos com n8n e Selenium', nivel: 'Senior', horas: 16, preRequisitos: ['js-testes-e2e'] },

    // ===== JAVASCRIPT — iot =====
    { id: 'js-johnny-five', linguagem: 'javascript', area: 'iot', titulo: 'Arduino e Robótica com Johnny-Five',             nivel: 'Iniciante', horas: 12, preRequisitos: ['js-fundamentos'] },
    { id: 'js-node-red',    linguagem: 'javascript', area: 'iot', titulo: 'Fluxos de IoT com Node-RED',                     nivel: 'Pleno',     horas: 12, preRequisitos: ['js-johnny-five'] },
    { id: 'js-espruino',    linguagem: 'javascript', area: 'iot', titulo: 'Microcontroladores e Hubs de Sensores com Espruino e Cylon.js', nivel: 'Senior', horas: 16, preRequisitos: ['js-node-red', 'js-assincrono'] },

    // ===== JAVASCRIPT — extensoes-cli =====
    { id: 'js-cli',             linguagem: 'javascript', area: 'extensoes-cli', titulo: 'Ferramentas de Linha de Comando com Node.js',          nivel: 'Iniciante', horas: 10, preRequisitos: ['js-node'] },
    { id: 'js-extensoes',       linguagem: 'javascript', area: 'extensoes-cli', titulo: 'Extensões de Navegador com WebExtensions',             nivel: 'Pleno',     horas: 14, preRequisitos: ['js-dom', 'js-assincrono'] },
    { id: 'js-ferramentas-dev', linguagem: 'javascript', area: 'extensoes-cli', titulo: 'Ferramentas de Automação para Desenvolvimento e Infraestrutura', nivel: 'Senior', horas: 14, preRequisitos: ['js-cli', 'js-extensoes'] },

    // ===== JAVASCRIPT — web3 =====
    { id: 'js-web3-fundamentos', linguagem: 'javascript', area: 'web3', titulo: 'Fundamentos de Blockchain e Carteiras (MetaMask)', nivel: 'Iniciante', horas: 10, preRequisitos: ['js-fundamentos'] },
    { id: 'js-ethers',           linguagem: 'javascript', area: 'web3', titulo: 'Contratos Inteligentes com Ethers.js, Web3.js e Viem', nivel: 'Pleno', horas: 18, preRequisitos: ['js-web3-fundamentos', 'js-assincrono'] },
    { id: 'js-dapps',            linguagem: 'javascript', area: 'web3', titulo: 'DApps e DeFi em Ethereum e Solana',               nivel: 'Senior',    horas: 20, preRequisitos: ['js-ethers'] }
];

//Busca um módulo pelo id (devolve undefined se não existir)
export function buscarModulo(id) {
    return catalogo.find(modulo => modulo.id === id);
}

//Devolve só o que interessa ao aluno: base da linguagem + área escolhida
//+ pré-requisitos que estejam em outras áreas (ex.: finanças precisa de Pandas)
export function filtrarCatalogo(linguagem, area) {
    const selecionados = catalogo.filter(modulo =>
        modulo.linguagem === linguagem && (modulo.area === 'base' || modulo.area === area)
    );

    //percorre a lista enquanto ela cresce, adicionando pré-requisitos que faltam
    for (let i = 0; i < selecionados.length; i++) {
        for (const pre of selecionados[i].preRequisitos) {
            if (!selecionados.some(modulo => modulo.id === pre)) {
                selecionados.push(buscarModulo(pre));
            }
        }
    }

    return selecionados;
}
