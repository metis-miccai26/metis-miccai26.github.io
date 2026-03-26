/* ============================================================
   METIS Workshop — Gemini-Powered Chat Agent
   Uses the Gemini API for context-aware Q&A about the workshop.
   Escalates to organizer emails when needed.
   ============================================================ */

(() => {
  // ------------------------------------------------------------------
  // CONFIG — Replace with your actual Gemini API key
  // Restrict the key in Google Cloud Console to your domain.
  // ------------------------------------------------------------------
  const GEMINI_API_KEY = ''; // Not needed for Pollinations AI
  const GEMINI_MODEL = 'openai'; 
  const POLLINATIONS_URL = 'https://text.pollinations.ai/';

  // ------------------------------------------------------------------
  // Workshop knowledge base (system prompt)
  // ------------------------------------------------------------------
  const SYSTEM_PROMPT = `You are the MÉTIS Workshop assistant at MICCAI 2026 (Abu Dhabi).
Focus: Translating AI to clinics, evaluation, standards.
Tracks: 1) End-to-End AI Systems, 2) Translational Evaluation & Metrics, 3) MIUA-MICCAI Collaborative Posters.
Dates: TBD. Submissions via OpenReview, double-blind. Papers in Springer LNCS.
Organizers: Kathleen Curran, Spyridon Bakas, Nuala Healy, Mohamed Saadeldin, Bartłomiej Papież, Gilberto Ochoa Ruiz, Sharib Ali, Bülent Yılmaz.
Contact: mohamed.saadeldin@ucd.ie, aon.safdar@ucdconnect.ie.
Rule: Be concise. If unknown, suggest emailing organizers.`;

  // ------------------------------------------------------------------
  // Chat history (for multi-turn context)
  // ------------------------------------------------------------------
  let chatHistory = [];

  // ------------------------------------------------------------------
  // DOM references
  // ------------------------------------------------------------------
  const chatToggle = document.getElementById('chatToggle');
  const chatWindow = document.getElementById('chatWindow');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const chatSend = document.getElementById('chatSend');
  const typingIndicator = document.getElementById('typingIndicator');

  // ------------------------------------------------------------------
  // Toggle chat window
  // ------------------------------------------------------------------
  chatToggle.addEventListener('click', () => {
    const isOpen = chatWindow.classList.toggle('open');
    chatToggle.classList.toggle('active', isOpen);
    if (isOpen) chatInput.focus();
  });

  // ------------------------------------------------------------------
  // Send message
  // ------------------------------------------------------------------
  const sendMessage = async () => {
    const text = chatInput.value.trim();
    if (!text) return;

    // Add user message to UI
    appendMessage(text, 'user');
    chatInput.value = '';

    // API key check removed since Pollinations is free and requires no key

    // Show typing indicator
    typingIndicator.classList.add('visible');
    scrollToBottom();

    try {
      const reply = await callGemini(text);
      typingIndicator.classList.remove('visible');
      appendMessage(reply, 'bot');
    } catch (err) {
      console.error('Gemini API error:', err);
      typingIndicator.classList.remove('visible');
      appendMessage(
        'Sorry, I encountered an error. Please try again or reach out directly to <a href="mailto:mohamed.saadeldin@ucd.ie">Mohamed</a> or <a href="mailto:aon.safdar@ucdconnect.ie">Aon</a>.',
        'bot'
      );
    }
  };

  chatSend.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // ------------------------------------------------------------------
  // Call Pollinations API (Free, no-auth proxy)
  // ------------------------------------------------------------------
  async function callGemini(userMessage) {
    // Add user message to history
    chatHistory.push({ role: 'user', content: userMessage });

    // Build a single text prompt
    let combinedPrompt = "System: " + SYSTEM_PROMPT + "\n\nChat History:\n";
    for (let msg of chatHistory) {
      combinedPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`;
    }
    combinedPrompt += "Assistant: ";

    // Pollinations GET format: https://text.pollinations.ai/prompt?model=...
    const targetUrl = `${POLLINATIONS_URL}${encodeURIComponent(combinedPrompt)}?model=${GEMINI_MODEL}&seed=${Math.floor(Math.random() * 10000)}`;
    
    // Pollinations GET format: https://text.pollinations.ai/prompt?model=...
    const url = `${POLLINATIONS_URL}${encodeURIComponent(combinedPrompt)}?model=${GEMINI_MODEL}&seed=${Math.floor(Math.random() * 10000)}`;

    const res = await fetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`API ${res.status}: ${errText}`);
    }

    let reply = await res.text();
    
    // Strip Pollinations legacy API warning reliably
    if (reply && reply.includes('will continue to work normally.')) {
      const splitIndex = reply.indexOf('will continue to work normally.') + 'will continue to work normally.'.length;
      reply = reply.substring(splitIndex).trim();
    }
    
    reply = reply || "I'm not sure how to answer that. Please email the organizers for help.";

    // Add assistant reply to history
    chatHistory.push({ role: 'assistant', content: reply });

    // Keep history manageable (last 10 turns to avoid URL length limits)
    if (chatHistory.length > 10) {
      chatHistory = chatHistory.slice(-10);
    }

    return reply;
  }

  // ------------------------------------------------------------------
  // UI helpers
  // ------------------------------------------------------------------
  function appendMessage(text, sender) {
    const div = document.createElement('div');
    div.className = `chat-message ${sender}`;

    // Simple markdown-like rendering for bold and links
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>')
      .replace(
        /(?<![">])(https?:\/\/[^\s<]+)/g,
        '<a href="$1" target="_blank" rel="noopener">$1</a>'
      );

    div.innerHTML = html;

    // Insert before typing indicator
    chatMessages.insertBefore(div, typingIndicator);
    scrollToBottom();
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

})();
