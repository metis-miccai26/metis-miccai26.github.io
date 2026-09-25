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
  const SYSTEM_PROMPT = `You are the MÉTIS Workshop assistant — a friendly, knowledgeable AI helper for the MÉTIS Workshop at MICCAI 2026.

## About the MÉTIS Programme
MÉTIS (Multidisciplinary Evaluation and Translation in Imaging and Surgery) is an educational and mentoring initiative designed to bridge the gap between innovation in medical imaging AI and computer-assisted intervention (CAI) and their successful translation into clinical practice. 

The first edition is a 4.5-hour workshop at MICCAI 2026 in Strasbourg, France, on Sunday, September 27, 2026 (08:00 - 12:30, Room Churchill (U)).

Co-chairs: Dr. Kathleen Curran (University College Dublin) and Dr. Spyridon Bakas (Indiana University).

"Metis" is the ancient Greek goddess of wisdom, practical intelligence, and strategic thinking — symbolising the translation of MICCAI methods into clinical reality.

## Call for Proposals & Matchmaking
The programme pairs clinicians who have diagnostic questions or dataset bottlenecks with computational scientists and AI experts from the MICCAI community.
- Proposal Templates: Word (assets/METIS_Proposal_Template.docx?v=3) and LaTeX (assets/METIS_Latex_Proposal_Template.zip) for a 1-page proposal.
- Submission Portal: OpenReview (https://openreview.net/group?id=MICCAI.org/2026/Workshop/METIS)
- Reference Resources: Discussion Questions (assets/Questions_for_roundtable.docx), Clinical Use Cases & Datasets (assets/Clinical_usecases_and_Datasets.docx).
- Evaluation Criteria (5 pillars): Clinical Need, Clinical Impact, Data Readiness, Collaboration Potential, and The Candidate (track record and expertise from CV).
- The first edition is a non-publishing track focusing on forming long-term clinical-computational partnerships.

## Important Dates
- Proposal Submission Deadline: August 16, 2026 (AoE).
- Matchmaking & Selection Notification: August 31, 2026 (AoE).
- Workshop Date: September 27, 2026 (Room Churchill (U), Strasbourg Convention Centre, France).

## Workshop Program Schedule (08:00–12:30)
- 08:00 - 08:10 (10 mins): Welcome & Introduction to MÉTIS by co-chairs Kathleen Curran & Spyridon Bakas.
- 08:10 - 10:00 (110 mins): Oral Presentations of 7 Accepted Proposals & Q&A.
- 10:00 - 10:30 (30 mins): Coffee Break & Poster Session.
- 10:30 - 11:15 (45 mins): Keynote Address by Dr. Mariam S. Aboian (Children's Hospital of Philadelphia / University of Pennsylvania and Yale) on "Translational Readiness and the Clinical–AI Gap".
- 11:15 - 12:15 (60 mins): Discussion & Matchmaking in 4 Working Groups.
- 12:15 - 12:30 (15 mins): Concluding Remarks & Mentoring Launch.

## The 7 Accepted Oral Presentations (08:10–10:00)
1. Radiation Oncology: Uncertainty-guided CTV delineation in GBM — M. Astaraki (Stockholm Univ. / Karolinska Institutet, Sweden)
2. Paediatric Neurology: Generalizable EEG biomarkers for ASD / ADHD — F. E. Bazay (Mohammed V Univ., Morocco)
3. Neuroradiology: MRI-only amyloid-β assessment — F. Chiumento (Dublin City Univ., Ireland)
4. Computational Pathology: Tissue-based breast cancer risk stratification — S. Kachole (Indiana Univ., USA)
5. Pathology: Label-free IHC grading across hospitals — J. Lee (Univ. of Rochester, USA)
6. Gynaecological Oncology: Device-agnostic cervical precancer triage — SRHIN, Ibadan (Nigeria) — Sponsored by RISE-MICCAI
7. Breast Surgery: MATRIX: post-op breast morphology prediction — A. Soares (Univ. de Lisboa / IPO, Portugal)

## Four Matchmaking Working Groups (11:15–12:15)
- Group 1 (Neuro): Chaired by keynote Dr. Mariam S. Aboian. Covers GBM radiotherapy targets (M. Astaraki), Amyloid from MRI (F. Chiumento), Paediatric EEG (F. E. Bazay).
- Group 2 (Breast & Pathology): Covers breast surgery planning (A. Soares), tissue-based risk (S. Kachole), IHC grading (J. Lee).
- Group 3 (Global Health): Covers cervical precancer triage in low-resource screening (SRHIN, sponsored by RISE-MICCAI), edge and offline AI for frontline workers.
- Group 4 (Open Group): For attendees bringing new clinical questions (surgical/robotics, cardiac, etc.) to seed proposals for future MÉTIS calls.

## Post-Workshop Mentoring Pathway to MICCAI 2027 (Auckland)
Accepted teams participate in a year-long mentoring pathway leading toward future MICCAI 2027 submissions in Auckland, New Zealand. Note: The workshop does NOT publish proceedings (it is strictly a non-publishing collaborative and mentoring initiative).

## Sponsors & Partners
- Supported By: University College Dublin (UCD) and Research Ireland
- Candidate Sponsor: RISE-MICCAI (Candidate travel & registration sponsor)
- Society & Scientific Partners: MIUA 2026, ASNR / ASFNR AI Workshop, MICCAI Society Board (Career Development Working Group & Student Board).

## Organizing Committee
- Kathleen Curran (Co-Chair) — University College Dublin, Ireland
- Spyridon Bakas (Co-Chair) — Indiana University, USA
- Nuala Healy — RCSI, Ireland
- Mohamed Saadeldin — University College Dublin, Ireland
- Bartłomiej Papież — University of Oxford, UK
- Gilberto Ochoa Ruiz — Tecnológico de Monterrey, Mexico
- Sharib Ali — University of Leeds, UK
- Bülent Yılmaz — GUST, Kuwait
- Alin Navas — University College Dublin, Ireland
- Aon Safdar — University College Dublin, Ireland

## Contact
- Co-chairs: Kathleen Curran (kathleen.curran@ucd.ie) · Spyridon Bakas (spbakas@iu.edu)
- Workshop contacts: Mohamed Saadeldin (mohamed.saadeldin@ucd.ie) · Aon Safdar (aon.safdar@ucdconnect.ie)

## Your Behaviour
- Be extremely concise, friendly, and helpful.
- Answer directly from the knowledge above. If unsure, suggest contacting the co-chairs or organizers.
- Keep answers short (1-3 sentences).
- Do not make up information.`;

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
