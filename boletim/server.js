const fs = require('fs');
const os = require('os');
const path = require('path');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const app = express();
const supabase = require('./config/supabase');

// Permite comunicação com serviços internos/Traefik com certificados auto-assinados
if (!process.env.NODE_TLS_REJECT_UNAUTHORIZED) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

// Inicializa a IA (requer que GEMINI_API_KEY esteja no .env)
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const port = process.env.PORT || 3000;

// Configuração do Multer legado (Armazenamento em RAM com limite de 50MB para o Supabase)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

// Configuração do Multer em disco temporário para upload ao YouTube via n8n (suporta até 500MB sem estourar RAM)
const youtubeUpload = multer({
  storage: multer.diskStorage({
    destination: os.tmpdir(),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `boletim_yt_${Date.now()}_${Math.random().toString(36).substring(7)}${ext}`);
    },
  }),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

// ==========================================
// CONFIGURAÇÃO DA SESSÃO
// ==========================================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'segredo_padrao_local',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

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
    console.error('Erro ao buscar último boletim:', error.message);
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

    // Sanitiza o campo de vídeo de avisos
    if (boletimData.video_avisos && boletimData.video_avisos.trim() !== '') {
      boletimData.video_avisos = boletimData.video_avisos.trim();
    } else {
      boletimData.video_avisos = null;
    }

    // Integração com Gemini para tradução automática
    try {
      if (genAI) {
        const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
        const candidateModels = [
          primaryModel,
          'gemini-3.1-flash-lite',
          'gemini-3-flash-preview',
          'gemini-3.5-flash-lite',
        ];

        const prompt = `
                Translate the following Portuguese church bulletin texts into English. 
                Return strictly a valid JSON object with the exact following keys: 
                "tema_semana_en", "palavra_pastor_en", "atividades_en", "gratidao_en", 
                "oracao_en", "aniversariantes_en", "culto_matutino_en", 
                "culto_vespertino_en", "equipe_matutino_en", "equipe_vespertino_en".
                
                Portuguese texts to translate:
                - tema_semana_en: "${boletimData.tema_semana || ''}"
                - palavra_pastor_en: "${boletimData.palavra_pastor || ''}"
                - atividades_en: "${boletimData.atividades || ''}"
                - gratidao_en: "${boletimData.gratidao || ''}"
                - oracao_en: "${boletimData.oracao || ''}"
                - aniversariantes_en: "${boletimData.aniversariantes || ''}"
                - culto_matutino_en: "${boletimData.culto_matutino || ''}"
                - culto_vespertino_en: "${boletimData.culto_vespertino || ''}"
                - equipe_matutino_en: "${boletimData.equipe_matutino || ''}"
                - equipe_vespertino_en: "${boletimData.equipe_vespertino || ''}"
                
                Keep formatting such as newlines, | and abbreviations if appropriate. If a field is empty, return an empty string for it.
                Only return the JSON, without markdown formatting like \`\`\`json.
                `;

        let responseText = '';
        let attempts = 0;
        while (attempts < 3) {
          const currentModelName = candidateModels[Math.min(attempts, candidateModels.length - 1)];
          try {
            const model = genAI.getGenerativeModel({ model: currentModelName });
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
            break;
          } catch (err) {
            attempts++;
            if (attempts >= 3) throw err;
            console.warn(
              `[Gemini] Falha na tentativa ${attempts} (modelo ${currentModelName}). A tentar novamente em 2 segundos... (${err.message})`
            );
            await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        }

        // Limpeza caso o Gemini retorne o JSON dentro de blocos markdown
        const jsonStr = responseText
          .replace(/```json/gi, '')
          .replace(/```/gi, '')
          .trim();
        const translated = JSON.parse(jsonStr);

        // Adicionar as traduções ao objeto final
        boletimData = { ...boletimData, ...translated };
      } else {
        console.warn('GEMINI_API_KEY não configurada no .env. A saltar a tradução...');
      }
    } catch (translationError) {
      console.error('Erro na tradução com Gemini:', translationError);
      // Ignoramos o erro de tradução para garantir que o boletim em PT é sempre salvo
    }

    const { error } = await supabase.from('boletins').insert([boletimData]);

    if (error) throw error;

    // Vai para a tela de impressão conferir o novo boletim
    res.redirect('/print');
  } catch (error) {
    console.error('Erro ao salvar no Supabase:', error.message);
    res.status(500).send('Erro interno ao tentar salvar o boletim no banco de dados.');
  }
});

// Rota independente para fazer o Upload de Vídeo e anexá-lo ao último boletim
app.post('/admin/upload-video', authMiddleware, (req, res) => {
  upload.single('video_file')(req, res, async (err) => {
    // Tratamento de erro do tamanho do arquivo pelo Multer
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res
          .status(400)
          .send(
            'ERRO: O vídeo é demasiado grande! O limite máximo é de 50MB. Por favor, comprima o vídeo.'
          );
      }
      return res.status(400).send('Erro no envio do arquivo: ' + err.message);
    } else if (err) {
      return res.status(500).send('Erro interno ao processar arquivo.');
    }

    try {
      if (!req.file) {
        return res.status(400).send('Nenhum arquivo de vídeo enviado.');
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
          upsert: false,
        });

      if (uploadError) {
        console.error('Erro no upload do Storage:', uploadError);
        throw uploadError;
      }

      // Gerar a URL pública do vídeo
      const { data: urlData } = supabase.storage.from('comunicacoes').getPublicUrl(filePath);

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
      console.error('Erro ao enviar o vídeo:', error.message);
      res.status(500).send('Erro interno ao tentar enviar o vídeo.');
    }
  });
});

// ==========================================
// ROTA: UPLOAD DE VÍDEO PARA YOUTUBE VIA N8N
// ==========================================
app.post('/admin/upload-video-youtube', authMiddleware, (req, res) => {
  youtubeUpload.single('video_file')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          error:
            'ERRO: O vídeo é demasiado grande! O limite máximo para esta automação é de 500MB.',
        });
      }
      return res
        .status(400)
        .json({ success: false, error: 'Erro no envio do arquivo: ' + err.message });
    } else if (err) {
      return res
        .status(500)
        .json({ success: false, error: 'Erro interno ao processar o arquivo de vídeo.' });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, error: 'Nenhum arquivo de vídeo foi enviado.' });
    }

    const filePath = req.file.path;

    try {
      const n8nWebhookUrl =
        process.env.N8N_YOUTUBE_WEBHOOK_URL ||
        'https://n8n.pibsaomiguel.com.br/webhook/upload-boletim-youtube';

      // Cria o Blob a partir do arquivo (suporta fs.openAsBlob nativo ou fallback via Buffer)
      const fileBlob =
        typeof fs.openAsBlob === 'function'
          ? await fs.openAsBlob(filePath, { type: req.file.mimetype })
          : new Blob([await fs.promises.readFile(filePath)], { type: req.file.mimetype });
      const formData = new FormData();
      formData.append('data', fileBlob, req.file.originalname);

      // Usa o título enviado ou o próprio nome do arquivo original sem extensão como fallback
      const videoTitle =
        req.body.title && req.body.title.trim() !== ''
          ? req.body.title.trim()
          : path.parse(req.file.originalname).name;

      formData.append('title', videoTitle);

      const response = await fetch(n8nWebhookUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Falha no n8n (status ${response.status}): ${errorText}`);
      }

      let youtubeUrl = null;
      let responseData = null;

      try {
        responseData = await response.json();
        youtubeUrl =
          responseData.youtubeUrl ||
          (responseData.videoId ? `https://youtu.be/${responseData.videoId}` : null);
      } catch (parseErr) {
        console.warn('Resposta do n8n não foi um JSON:', parseErr.message);
      }

      // Se o n8n retornou a URL do vídeo diretamente (modo síncrono)
      if (youtubeUrl) {
        const { data: latestBoletins, error: fetchError } = await supabase
          .from('boletins')
          .select('id')
          .order('id', { ascending: false })
          .limit(1);

        if (!fetchError && latestBoletins && latestBoletins.length > 0) {
          const latestId = latestBoletins[0].id;
          await supabase.from('boletins').update({ video_avisos: youtubeUrl }).eq('id', latestId);
        }

        return res.json({
          success: true,
          videoUrl: youtubeUrl,
          message: 'Vídeo publicado no YouTube com sucesso!',
        });
      }

      // Se o n8n aceitou o upload mas está processando em background (modo assíncrono)
      return res.json({
        success: true,
        videoUrl: null,
        message: 'Vídeo enviado para processamento no n8n com sucesso!',
      });
    } catch (uploadError) {
      const causeInfo = uploadError.cause
        ? ` (${uploadError.cause.message || uploadError.cause})`
        : '';
      console.error('Erro na automação do YouTube via n8n:', uploadError.message, causeInfo);
      return res.status(500).json({
        success: false,
        error: 'Erro na automação do YouTube: ' + uploadError.message + causeInfo,
      });
    } finally {
      // Remove o arquivo temporário do disco
      fs.unlink(filePath, () => {});
    }
  });
});

// ==========================================
// INICIA O SERVIDOR
// ==========================================
app.listen(port, () => {
  console.log(`Servidor ativo na porta ${port}`);
});
