const express = require('express');
const session = require('express-session');
const multer = require('multer');
const app = express();
const supabase = require('./config/supabase');

const port = process.env.PORT || 3000;

// Configuração do Multer (Armazenamento em RAM com limite de 50MB)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB
    }
});

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
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    res.render('mobile', { data: boletim, lang });
});

app.get('/mobile', async (req, res) => {
    const boletim = await getUltimoBoletim();
    // Se não passar nada, o padrão é 'pt'
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    res.render('mobile', { data: boletim, lang });
});

app.get('/print', async (req, res) => {
    const boletim = await getUltimoBoletim();
    const lang = req.query.lang === 'en' ? 'en' : 'pt';
    res.render('print', { data: boletim, lang });
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
        let boletimData = { ...req.body };

        const { error } = await supabase
            .from('boletins')
            .insert([boletimData]);

        if (error) throw error;

        // Vai para a tela de impressão conferir o novo boletim
        res.redirect('/print');
    } catch (error) {
        console.error("Erro ao salvar no Supabase:", error.message);
        res.status(500).send("Erro interno ao tentar salvar o boletim no banco de dados.");
    }
});

// Rota independente para fazer o Upload de Vídeo e anexá-lo ao último boletim
app.post('/admin/upload-video', authMiddleware, (req, res) => {
    upload.single('video_file')(req, res, async (err) => {
        // Tratamento de erro do tamanho do arquivo pelo Multer
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).send("ERRO: O vídeo é demasiado grande! O limite máximo é de 50MB. Por favor, comprima o vídeo.");
            }
            return res.status(400).send("Erro no envio do arquivo: " + err.message);
        } else if (err) {
            return res.status(500).send("Erro interno ao processar arquivo.");
        }

        try {
            if (!req.file) {
                return res.status(400).send("Nenhum arquivo de vídeo enviado.");
            }

            const file = req.file;
            const fileExt = file.originalname.split('.').pop();
            const fileName = `boletim_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `avisos/${fileName}`;

            // Upload para o bucket "comunicacoes"
            const { error: uploadError } = await supabase.storage
                .from('comunicacoes')
                .upload(filePath, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false
                });

            if (uploadError) {
                console.error("Erro no upload do Storage:", uploadError);
                throw uploadError;
            }

            // Gerar a URL pública do vídeo
            const { data: urlData } = supabase.storage
                .from('comunicacoes')
                .getPublicUrl(filePath);
            
            const videoUrl = urlData.publicUrl;

            // Procurar o ID do último boletim criado
            const { data: latestBoletins, error: fetchError } = await supabase
                .from('boletins')
                .select('id')
                .order('id', { ascending: false })
                .limit(1);

            if (fetchError) throw fetchError;

            if (latestBoletins && latestBoletins.length > 0) {
                const latestId = latestBoletins[0].id;
                
                // Atualizar o último boletim com o link do vídeo
                const { error: updateError } = await supabase
                    .from('boletins')
                    .update({ video_avisos: videoUrl })
                    .eq('id', latestId);
                    
                if (updateError) throw updateError;
            }

            // Retornar ao admin após o sucesso
            res.redirect('/admin');
        } catch (error) {
            console.error("Erro ao enviar o vídeo:", error.message);
            res.status(500).send("Erro interno ao tentar enviar o vídeo.");
        }
    });
});

// ==========================================
// INICIA O SERVIDOR
// ==========================================
app.listen(port, () => {
    console.log(`Servidor ativo na porta ${port}`);
});