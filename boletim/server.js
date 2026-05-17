const express = require('express');
const session = require('express-session');
const app = express();
const supabase = require('./config/supabase');

const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ==========================================
// CONFIGURAÇÃO DA SESSÃO
// ==========================================
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

// ==========================================
// ROTAS PÚBLICAS (Leitura do Supabase)
// ==========================================

// Rota raiz (Mobile)
app.get('/', async (req, res) => {
    try {
        const { data: boletim, error } = await supabase
            .from('boletins')
            .select('*')
            .order('id', { ascending: false })
            .single();

        if (error && error.code !== 'PGRST116') throw error; // Ignora erro de "tabela vazia"

        res.render('mobile', { data: boletim || {} });
    } catch (error) {
        console.error("Erro na rota /:", error.message);
        res.status(500).send("Erro ao carregar o boletim.");
    }
});

// Rota Mobile Explícita
app.get('/mobile', async (req, res) => {
    try {
        const { data: boletim, error } = await supabase
            .from('boletins')
            .select('*')
            .order('id', { ascending: false })
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.render('mobile', { data: boletim || {} });
    } catch (error) {
        console.error("Erro ao procurar dados para o mobile:", error.message);
        res.status(500).send("Erro ao carregar o boletim mobile.");
    }
});

// Rota de Impressão
app.get('/print', async (req, res) => {
    try {
        const { data: boletim, error } = await supabase
            .from('boletins')
            .select('*')
            .order('id', { ascending: false })
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.render('print', { data: boletim || {} });
    } catch (error) {
        console.error("Erro ao buscar dados para impressão:", error.message);
        res.status(500).send("Erro interno ao carregar o boletim.");
    }
});

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
// ROTAS PROTEGIDAS (Painel Admin)
// ==========================================

// Carrega o painel preenchido com o boletim anterior
app.get('/admin', authMiddleware, async (req, res) => {
    try {
        const { data: boletim, error } = await supabase
            .from('boletins')
            .select('*')
            .order('id', { ascending: false })
            .single();

        if (error && error.code !== 'PGRST116') throw error;

        res.render('admin', { data: boletim || {} });
    } catch (error) {
        console.error("Erro ao carregar o admin:", error.message);
        res.render('admin', { data: {} }); // Se falhar, renderiza vazio
    }
});

// Recebe os dados do formulário e salva um NOVO boletim no Supabase
app.post('/admin', authMiddleware, async (req, res) => {
    try {
        // req.body contém todos os dados do formulário
        const { error } = await supabase
            .from('boletins')
            .insert([req.body]);

        if (error) throw error;

        // Se gravou com sucesso, redireciona para a página de impressão para conferir
        res.redirect('/print');
    } catch (error) {
        console.error("Erro ao salvar no Supabase:", error.message);
        res.status(500).send("Erro interno ao tentar salvar o boletim no banco de dados.");
    }
});

// ==========================================
// INICIA O SERVIDOR
// ==========================================
app.listen(port, () => {
    console.log(`Servidor ativo na porta ${port}`);
});