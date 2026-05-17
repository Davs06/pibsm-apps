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
    cookie: { secure: false }
}));

// Middleware de Autenticação
const authMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// ==========================================
// FUNÇÃO INTELIGENTE: Pega o último boletim
// ==========================================
async function getUltimoBoletim() {
    try {
        // Pega todos, ordena do mais novo para o mais velho e recorta só o NÚMERO 1
        const { data, error } = await supabase
            .from('boletins')
            .select('*')
            .order('id', { ascending: false })
            .limit(1);

        if (error) throw error;

        // Se houver dados, devolve o primeiro da lista. Se não, devolve vazio.
        return data && data.length > 0 ? data[0] : {};
    } catch (error) {
        console.error("Erro ao buscar último boletim:", error.message);
        return {};
    }
}

// ==========================================
// ROTAS PÚBLICAS (Mobile e Print)
// ==========================================

app.get('/', async (req, res) => {
    const boletim = await getUltimoBoletim();
    res.render('mobile', { data: boletim });
});

app.get('/mobile', async (req, res) => {
    const boletim = await getUltimoBoletim();
    res.render('mobile', { data: boletim });
});

app.get('/print', async (req, res) => {
    const boletim = await getUltimoBoletim();
    res.render('print', { data: boletim });
});

// ==========================================
// SISTEMA DE LOGIN
// ==========================================

app.get('/login', (req, res) => {
    res.render('login', { erro: null });
});

app.post('/login', (req, res) => {
    const { usuario, senha } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';

    if (usuario === adminUser && senha === adminPass) {
        req.session.loggedIn = true;
        res.redirect('/admin');
    } else {
        res.render('login', { erro: 'Usuário ou senha incorretos!' });
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ==========================================
// ROTAS PROTEGIDAS (Painel Admin)
// ==========================================

// Carrega o painel COM OS DADOS DA SEMANA PASSADA (O Último Inserido)
app.get('/admin', authMiddleware, async (req, res) => {
    const boletim = await getUltimoBoletim();
    res.render('admin', { data: boletim });
});

// Salva um NOVO boletim no banco de dados e mantém o histórico
app.post('/admin', authMiddleware, async (req, res) => {
    try {
        const { error } = await supabase
            .from('boletins')
            .insert([req.body]);

        if (error) throw error;

        // Vai para a tela de impressão conferir o novo boletim
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