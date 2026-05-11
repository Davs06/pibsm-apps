const express = require('express');
const session = require('express-session');
const app = express();

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// Configuração da Sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'segredo_padrao_local',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Em produção com HTTPS ativado via Traefik, pode ser mantido false internamente no container
}));

// Middleware de Autenticação (A "Barreira")
const authMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next(); // Se estiver logado, deixa passar
    } else {
        res.redirect('/login'); // Se não, manda para a tela de login
    }
};

let boletimData = {
    data_boletim: "26/04/2026",
    tema_semana: "Palavra, Comunhão e Missão",
    palavra_pastor: "Amada Igreja,\n\nCelebramos hoje 78 anos de história, lutas, vitórias e da constante fidelidade do Senhor para connosco. Como diz as Escrituras em I Samuel 7.12: \"Ebenézer: até aqui nos ajudou o Senhor!\"\n\nQue a chama do avivamento, o amor pela Palavra de Deus e a paixão inabalável pelas almas continuem ardendo intensamente em nossos corações. Avancemos em comunhão e missão!\n\nUm abraço fraterno,\nPr. Eloy",
    atividades: "26|DOM|09h00 Culto Matutino, 18h00 Culto Vespertino (Aniversário)\n28|TER|15h00 Encontro MCM (Lares), 19h00 Culto nos Lares\n29|QUA|19h30 Culto de Oração\n01|SEX|Day Camp\n03|DOM|09h00 Culto Matutino, 16h30 Encontro Depto., 18h00 Culto Vespertino",
    gratidao: "78 anos PIB São Miguel Paulista.\nIrmã Dalva: gratidão pela recuperação de saúde do filho Artur.\nRetorno de Viagem.",
    oracao: "Pr. Djalma: irmã Rubia internada em estado grave.\nIrmão Toninho – por sua vida.\nIrmã Izauri / Maria Mercês / Rose Casseano – saúde.\nIrmã Helena Caires – pela saúde de Niutemor e esposa.\nIrmã Cristiane Carvalho – recuperação.\nIrmã Iraci – pelas netas Júlia e Elisa.",
    aniversariantes: "20/04|Darlene G. Miranda\n21/04|Aline D. de Oliveira\n22/04|Marcos R. Marzola Celso\n23/04|Léia Raquel de Souza\n28/04|Gabriel Henrique R. da Silva",
    culto_matutino: "Chamada ao culto – E. Miranda\nPrelúdio – Piano Lídia T.\nOração – E. Miranda\nBíblia – I Cor. 15:58\nOfertas – Hino 454 CC\nIntercessão – E. Miranda\nCia Nissi – \"Que Ele Cresça\"\nEncerramento",
    culto_vespertino: "Chamada – Eli Pereira\nLeitura – Efésios 4:1-16\nBoas-vindas – Eli Pereira\nHistória PIBSM – Eli Pereira\nOração – Irmã Ana Rita\nMensagem – Pr. Eloy\nOração/Bênção – Pr. Eloy\nConfraternização",
    // --- NOVOS CAMPOS ADICIONADOS AQUI ---
    equipe_matutino: "Direção: Casal Milton e Luciani\nRegente: Eli Pereira\nPianista: Nilton Figueiredo\nMensagem: Pr. Eloy\nRecepção: Francisca e Francisco\nDiáconos: Erasmo e Marinalva",
    equipe_vespertino: "Direção: Nome e Nome\nRegente: Nome\nPianista: Nome\nMensagem: Pr. Eloy\nRecepção: Nome e Nome\nDiáconos: Nome e Nome"
};

// Rotas Públicas
app.get('/', (req, res) => { res.render('mobile', { data: boletimData }); });
app.get('/mobile', (req, res) => { res.render('mobile', { data: boletimData }); });
app.get('/print', (req, res) => { res.render('print', { data: boletimData }); });

// ==========================================
// SISTEMA DE LOGIN
// ==========================================

// Tela de Login
app.get('/login', (req, res) => {
    res.render('login', { erro: null });
});

// Processa o Login
app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    if (usuario === adminUser && senha === adminPass) {
        req.session.loggedIn = true; // Salva o estado logado
        res.redirect('/admin');
    } else {
        res.render('login', { erro: 'Usuário ou senha incorretos!' });
    }
});

// Fazer Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ==========================================
// ROTAS PROTEGIDAS (Repare no 'authMiddleware' inserido)
// ==========================================

app.get('/admin', authMiddleware, (req, res) => {
    res.render('admin', { data: boletimData });
});

app.post('/admin', authMiddleware, (req, res) => {
    boletimData = req.body;
    res.redirect('/print');
});

app.listen(port, () => {
    console.log(`Servidor ativo na porta ${port}`);
});