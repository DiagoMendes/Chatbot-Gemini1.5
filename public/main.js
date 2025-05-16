// ── Imports e Seletores ───────────────────────────────────
const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const container = document.getElementById('chat-container');
const voiceToggle = document.getElementById('voice-toggle');
const voiceSelect = document.getElementById('voice-select');
const rateInput = document.getElementById('rate-input');
const pitchInput = document.getElementById('pitch-input');

// ── Estado da Conversa e Voz ──────────────────────────────
let currentConversationId = null;
let voiceEnabled = true;
let voices = [];

// ── Início: Carrega histórico e configura sintetizador ─────
document.addEventListener('DOMContentLoaded', () => {
  loadChatHistory();
  // Popula vozes quando disponíveis
  speechSynthesis.addEventListener('voiceschanged', () => {
    voices = speechSynthesis.getVoices();
    populateVoiceOptions();
  });

  // Controles de voz
  voiceToggle.addEventListener('change', () => (voiceEnabled = voiceToggle.checked));
  rateInput.addEventListener('input', () => {
    document.getElementById('rate-value').textContent = rateInput.value;
  });
  pitchInput.addEventListener('input', () => {
    document.getElementById('pitch-value').textContent = pitchInput.value;
  });
});

// ── Função: Popula lista de vozes ──────────────────────────
function populateVoiceOptions() {
  voiceSelect.innerHTML = '';
  voices.forEach((voice, i) => {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceSelect.appendChild(option);
  });
}

// ── Carrega histórico de chat ─────────────────────────────
async function loadChatHistory() {
  try {
    const res = await fetch('/history');
    if (!res.ok) throw new Error('Falha ao carregar histórico');
    const data = await res.json();
    if (data.history?.length && data.conversationId) {
      currentConversationId = data.conversationId;
      data.history.forEach(({ role, parts }) => addMessage(parts[0]?.text || '', role));
    }
  } catch (error) {
    console.error(error);
  }
}

// ── Submete mensagem ─────────────────────────────────────
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userMessage = input.value.trim();
  if (!userMessage) return;

  addMessage(userMessage, 'user');
  input.value = '';

  try {
    const res = await fetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, conversationId: currentConversationId }),
    });
    const data = await res.json();
    const botReply = data.reply || '—';
    addMessage(botReply, 'model');
    currentConversationId = data.conversationId;

    if (voiceEnabled && window.speechSynthesis) speakText(botReply);
  } catch (err) {
    console.error(err);
    addMessage('Erro de conexão.', 'model');
  }
});

// ── Função: Sintetiza texto (chunk ou inteiro) ─────────────
function speakText(text) {
  if (!voices.length) {
    // Fallback: voz padrão
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = parseFloat(rateInput.value);
    utt.pitch = parseFloat(pitchInput.value);
    window.speechSynthesis.speak(utt);
    return;
  }

  // Divide por sentenças menores
  const sentences = text.match(/[^\.\!\?]+[\.\!\?]?/g) || [text];
  let index = 0;

  function speakSentence() {
    if (index >= sentences.length) return;
    const utt = new SpeechSynthesisUtterance(sentences[index].trim());
    const selVoice = voices[voiceSelect.value];
    if (selVoice) utt.voice = selVoice;
    utt.rate = parseFloat(rateInput.value);
    utt.pitch = parseFloat(pitchInput.value);
    utt.lang = selVoice?.lang || 'pt-BR';
    utt.onend = () => { index++; speakSentence(); };
    window.speechSynthesis.speak(utt);
  }

  speakSentence();
}

// ── Renderiza mensagem na interface ──────────────────────
function addMessage(text, sender) {
  const msgDiv = document.createElement('div');
  msgDiv.classList.add('message', sender);
  msgDiv.textContent = text;
  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}