// ── 1) Carrega .env e Imports ─────────────────────────────
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } = require('@google/generative-ai');
const sequelize = require('./database');
const Conversation = require('./models/conversation');

// ── 2) Configurações Iniciais ─────────────────────────────
const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.GEMINI_API_KEY;
const sessionSecret = process.env.SESSION_SECRET || 'fallback-insecure-secret';

if (!apiKey) {
  console.error('🔑 GEMINI_API_KEY não definida.');
  process.exit(1);
}

app.use(express.json());
app.use(cors({ origin: '*', credentials: true }));
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: 'auto', httpOnly: true, maxAge: 86400000 },
  })
);

// ── 3) Configura Gemini ───────────────────────────────────
const genAI = new GoogleGenerativeAI(apiKey);
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest', safetySettings });
console.log(`✨ Gemini Model: ${model.model}`);

// Texto de sistema para contexto inicial
const SYSTEM_PROMPT_TEXT =
  'Você é Jarvis, um assistente virtual que preserva o contexto de toda a conversa anterior para oferecer respostas consistentes.';

// ── 4) Rotas ───────────────────────────────────────────────
// GET /history: retorna apenas mensagens do usuário e do bot
app.get('/history', async (req, res) => {
  try {
    const conv = await Conversation.findOne({ where: { sessionId: req.sessionID } });
    res.json({
      history: conv ? conv.messages : [],
      conversationId: conv ? conv.id : null,
    });
  } catch (err) {
    console.error('Histórico erro:', err.message);
    res.status(500).json({ error: 'Falha ao obter histórico.' });
  }
});

// POST /chat: envia mensagem e atualiza histórico
app.post('/chat', async (req, res) => {
  const { message: userMessage, conversationId } = req.body;
  if (!userMessage) return res.status(400).json({ error: 'Mensagem é obrigatória.' });

  try {
    // Carrega ou cria conversa (sem system no histórico)
    let conv;
    if (conversationId) {
      conv = await Conversation.findByPk(conversationId);
      if (!conv || conv.sessionId !== req.sessionID) {
        conv = await Conversation.create({ messages: [], sessionId: req.sessionID });
      }
    } else {
      conv = await Conversation.create({ messages: [], sessionId: req.sessionID });
    }

    // Inicia chat incluindo prompt de sistema + histórico salvo
    const chat = model.startChat({
      systemMessage: SYSTEM_PROMPT_TEXT,
      history: conv.messages,
    });
    const result = await chat.sendMessage(userMessage);
    const response = result.response;

    if (!response || !response.candidates?.length || !response.candidates[0].content) {
      const reason = response?.promptFeedback?.blockReason || 'Resposta bloqueada por segurança.';
      return res.status(500).json({ error: reason });
    }

    const botReply = response.text();
    // Atualiza histórico: adiciona user e bot
    conv.messages.push({ role: 'user', parts: [{ text: userMessage }] });
    conv.messages.push({ role: 'model', parts: [{ text: botReply }] });
    await conv.save();

    res.json({ reply: botReply, conversationId: conv.id });
  } catch (err) {
    console.error('Chat erro:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
});

// ── 5) Frontend Estático ───────────────────────────────────
app.use(express.static('public'));
console.log("Servindo arquivos estáticos da pasta 'public'");

// ── 6) Sincroniza DB e Inicia Servidor ────────────────────
sequelize
  .sync()
  .then(() => app.listen(port, () => console.log(`🚀 Server em http://localhost:${port}`)))
  .catch(err => console.error('Sync DB falhou:', err));