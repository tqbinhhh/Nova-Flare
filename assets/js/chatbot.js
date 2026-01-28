// ===============================
// NOVA CHATBOT – GEMINI AI
// ===============================

const GEMINI_API_KEY = "AIzaSyAu1lThZLD0EneM-hhX0Wf8dMtTxI_bYLc";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent";

document.addEventListener("DOMContentLoaded", () => {
  // 1. Inject Chatbot HTML if not present
  if (!document.getElementById('chatbot-container')) {
    const container = document.createElement('div');
    container.id = 'chatbot-container';
    container.innerHTML = `
            <button class="chatbot-fab" id="chatbot-btn">
                <i data-lucide="bot" class="w-7 h-7"></i>
                <span class="notification-dot"></span>
            </button>

            <div class="chatbot-modal" id="chatbot-modal">
                <div class="chatbot-header">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                            <i data-lucide="bot" class="w-5 h-5 text-white"></i>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-white">NOVA Trợ lý</h4>
                            <p class="text-[10px] text-blue-200">Luôn sẵn sàng hỗ trợ</p>
                        </div>
                    </div>
                    <button id="chatbot-close" class="w-8 h-8 rounded-lg hover:bg-white/10 text-white transition-all flex items-center justify-center">
                        <i data-lucide="x" class="w-4 h-4"></i>
                    </button>
                </div>

                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="chat-bubble bot">
                        Chào bạn! Tôi là trợ lý NOVA. Tôi có thể giúp gì cho bạn về tình hình ngập lụt hay kỹ năng an toàn?
                    </div>
                </div>

                <div id="chatbot-kb-manager" class="hidden p-4 bg-slate-900 rounded mt-3 text-xs text-slate-300">
                    <div class="font-bold text-sm text-white mb-2">Quản lý kiến thức (Dạy BOT)</div>
                    <form id="chatbot-kb-form" class="space-y-2">
                        <input id="kb-title" placeholder="Tiêu đề (ví dụ: Sơ cứu vết thương)" class="w-full p-2 bg-slate-800 rounded" />
                        <input id="kb-keywords" placeholder="Từ khóa (phân tách bằng dấu phẩy)" class="w-full p-2 bg-slate-800 rounded" />
                        <input id="kb-short" placeholder="Tóm tắt ngắn gọn" class="w-full p-2 bg-slate-800 rounded" />
                        <textarea id="kb-steps" placeholder="Các bước (mỗi bước một dòng)" class="w-full p-2 bg-slate-800 rounded" rows="3"></textarea>
                        <input id="kb-disclaimer" placeholder="Lưu ý / Disclaimer (tùy chọn)" class="w-full p-2 bg-slate-800 rounded" />
                        <div class="flex gap-2">
                            <button type="submit" class="py-2 px-3 bg-cyan-600 text-white rounded">Thêm kiến thức</button>
                            <button type="button" id="kb-clear-btn" class="py-2 px-3 bg-white/5 text-white rounded">Xóa form</button>
                        </div>
                    </form>
                    <div id="chatbot-kb-list" class="mt-3 space-y-2"></div>
                </div>

                <div class="chatbot-input-area">
                    <input type="text" id="chatbot-text" placeholder="Hỏi về thời tiết, ngập lụt..." class="chatbot-input">
                    <button id="chatbot-send" class="chatbot-send-btn">
                        <i data-lucide="send" class="w-4 h-4"></i>
                    </button>
                </div>
            </div>
        `;
    document.body.appendChild(container);
    if (window.lucide) window.lucide.createIcons();
  }

  const modal = document.getElementById("chatbot-modal");
  const openBtn = document.getElementById("chatbot-btn");
  const closeBtn = document.getElementById("chatbot-close");
  const sendBtn = document.getElementById("chatbot-send");
  const input = document.getElementById("chatbot-text");
  const messages = document.getElementById("chatbot-messages");
  const teachBtn = document.getElementById('chatbot-teach-btn');
  const kbManager = document.getElementById('chatbot-kb-manager');
  const kbForm = document.getElementById('chatbot-kb-form');
  const kbClear = document.getElementById('kb-clear-btn');

  // Teach button toggles KB manager
  if (teachBtn) {
    teachBtn.addEventListener('click', () => {
      if (kbManager) kbManager.classList.toggle('hidden');
      renderKBManager();
    });
  }

  // KB form submit
  if (kbForm) {
    kbForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('kb-title').value.trim();
      const keywords = document.getElementById('kb-keywords').value.split(',').map(s=>s.trim()).filter(Boolean);
      const short = document.getElementById('kb-short').value.trim();
      const steps = document.getElementById('kb-steps').value.split('\n').map(s=>s.trim()).filter(Boolean);
      const disclaimer = document.getElementById('kb-disclaimer').value.trim();
      if (!title || keywords.length === 0) {
        addMessage('Vui lòng nhập ít nhất tiêu đề và từ khóa.', 'bot');
        return;
      }
      addCustomTopic({ title, keywords, short, steps, disclaimer });
      addMessage('Đã thêm kiến thức mới vào bộ nhớ cục bộ.', 'bot');
      kbForm.reset();
      renderKBManager();
      renderTrainingBadge();
    });
  }

  if (kbClear) {
    kbClear.addEventListener('click', () => { kbForm.reset(); });
  }

  // -------------------------------
  // OPEN / CLOSE MODAL
  // -------------------------------
  openBtn.addEventListener("click", () => {
    modal.classList.toggle("active");
    if (modal.classList.contains("active")) {
      input.focus();
      openBtn.querySelector('.notification-dot')?.remove();
    }
  });

  closeBtn.addEventListener("click", () => {
    modal.classList.remove("active");
  });

  // -------------------------------
  // SEND MESSAGE
  // -------------------------------
  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    // Typing indicator
    const typingId = 'typing-' + Date.now();
    const typingDiv = document.createElement("div");
    typingDiv.id = typingId;
    typingDiv.className = "chat-bubble bot italic text-slate-500";
    typingDiv.textContent = "NOVA đang nghĩ...";
    messages.appendChild(typingDiv);
    messages.scrollTop = messages.scrollHeight;

    try {
      // If message matches a user-added KB topic, answer locally first and mark as trained for that topic
      const custom = findMatchingCustomKB(text);
      if (custom) {
        const msg = `${custom.title}: ${custom.short}\n\nCác bước:\n${(custom.steps || []).map((s,i)=>`${i+1}. ${s}`).join('\n')}\n\n${custom.disclaimer || ''}`;
        document.getElementById(typingId)?.remove();
        addMessage(msg, "bot");
        try {
          // mark topic as seen/trained
          const trainedKey = 'trainedTopic:' + custom.id;
          localStorage.setItem(trainedKey, 'true');
        } catch (e) {}
        renderTrainingBadge();
        return;
      }

      // If message matches drowning KB topics, answer locally first and mark as trained
      if (matchLocalKB(text)) {
        const localReply = buildKBReply();
        document.getElementById(typingId)?.remove();
        addMessage(localReply, "bot");

        try { localStorage.setItem('trainedDrowningFirstAid', 'true'); } catch (e) { /* ignore */ }
        renderTrainingBadge();
        return;
      }

      const reply = await callGemini(`
                You are NOVA, an AI assistant for weather, flood, and disaster safety in Vietnam.
                Answer clearly, briefly, and practically in Vietnamese.
                User question: ${text}
            `);

      document.getElementById(typingId)?.remove();
      addMessage(reply, "bot");
    } catch (err) {
      console.error(err);
      document.getElementById(typingId)?.remove();
      addMessage("Xin lỗi, hệ thống AI đang gặp sự cố. Bạn vui lòng thử lại sau.", "bot");
    }
  }

  // -------------------------------
  // Local KB: Drowning first-aid (used before calling Gemini and appended to prompts)
  // -------------------------------
  const drowningKB = {
    title: 'Sơ cứu đuối nước - NOVA KB',
    short: 'Nếu gặp người đuối nước: 1) Đảm bảo an toàn cho bản thân, 2) Gọi 115, 3) Kiểm tra phản ứng và hô hấp, 4) Nếu không thở: bắt đầu ép ngực (hands-only 100–120 lần/phút; nếu có đào tạo thì 30:2 ép/thở), 5) Nếu thở: đặt người vào tư thế an toàn, giữ ấm, đưa tới cơ sở y tế.',
    steps: [
      'Đảm bảo an toàn: không lao vào vùng nước xiết nếu không được huấn luyện. Sử dụng phao/cành cây để cứu từ xa.',
      'Gọi giúp đỡ ngay: gọi 115 (khẩn cấp) và báo vị trí rõ ràng.',
      'Kiểm tra phản ứng: gọi to và lắc nhẹ vai. Nếu không phản ứng, kiểm tra đường thở và hô hấp.',
      'Nếu không thở: nếu bạn đã được huấn luyện, tiến hành CPR (30 ép ngực : 2 thổi), nếu không thì thực hiện ép ngực liên tục (hands-only) với tốc độ ~100-120/phút.',
      'Nếu có hơi thở: đặt người nằm nghiêng an toàn (recovery position), giữ ấm, theo dõi cho đến khi có hỗ trợ y tế.',
      'Sau tiếp xúc với nước bẩn: rửa sạch vết thương, tránh ăn/uống nếu nghi ngờ nuốt nước bẩn, đưa khám y tế để phòng nhiễm trùng.'
    ],
    disclaimer: 'Thông tin này chỉ mang tính chất tham khảo; luôn gọi dịch vụ khẩn cấp và tìm sự trợ giúp y tế chuyên nghiệp.'
  };

  function matchLocalKB(text) {
    const t = (text || '').toLowerCase();
    const keywords = ['đuối nước', 'sơ cứu', 'cứu người', 'ep nguc', 'ép ngực', 'không thở', 'không phản ứng', 'hô hấp', 'ngạt nước', 'bị đuối', 'hô hấp nhân tạo'];
    for (const k of keywords) if (t.includes(k)) return true;
    return false;
  }

  function buildKBReply() {
    return `${drowningKB.short}\n\nChi tiết – Các bước cần làm:\n${drowningKB.steps.map((s, i) => `${i+1}. ${s}`).join('\n')}\n\nLưu ý: ${drowningKB.disclaimer}`;
  }

  function renderTrainingBadge() {
    const badge = document.getElementById('chatbot-train-badge');
    if (!badge) return;
    try {
      const trained = localStorage.getItem('trainedDrowningFirstAid') === 'true';
      if (trained) badge.classList.remove('hidden'); else badge.classList.add('hidden');
    } catch (e) { /* ignore */ }
  }

  // -------------------------------
  // Custom KB (user-provided) - storage, matching and rendering helpers
  // -------------------------------
  function loadCustomKB() {
    try {
      const raw = localStorage.getItem('customKB');
      return raw ? JSON.parse(raw) : [];
    } catch (e) { return []; }
  }

  function saveCustomKB(arr) {
    try { localStorage.setItem('customKB', JSON.stringify(arr)); } catch (e) { console.error(e); }
  }

  function addCustomTopic(topic) {
    const arr = loadCustomKB();
    topic.id = Date.now().toString();
    topic.keywords = (topic.keywords || []).map(k => k.trim().toLowerCase()).filter(Boolean);
    topic.steps = (topic.steps || []).map(s => s.trim()).filter(Boolean);
    arr.push(topic);
    saveCustomKB(arr);
    renderKBManager();
  }

  function removeCustomTopic(id) {
    const arr = loadCustomKB().filter(t => t.id !== id);
    saveCustomKB(arr);
    renderKBManager();
  }

  function findMatchingCustomKB(text) {
    if (!text) return null;
    const t = text.toLowerCase();
    const arr = loadCustomKB();
    for (const topic of arr) {
      for (const k of topic.keywords || []) {
        if (k && t.includes(k)) return topic;
      }
    }
    return null;
  }

  function renderKBManager() {
    const list = document.getElementById('chatbot-kb-list');
    if (!list) return;
    const arr = loadCustomKB();
    if (arr.length === 0) {
      list.innerHTML = '<div class="text-slate-500">Chưa có kiến thức do người dùng thêm.</div>';
      return;
    }
    list.innerHTML = arr.map(t => `
      <div class="p-2 bg-slate-800 rounded flex justify-between items-start">
        <div class="flex-1">
          <div class="font-semibold text-white">${t.title}</div>
          <div class="text-slate-400 text-xs mt-1">Keywords: ${t.keywords.join(', ')}</div>
          <div class="text-slate-300 text-xs mt-1">${t.short || ''}</div>
        </div>
        <div class="ml-3 flex flex-col gap-2">
          <button class="py-1 px-2 bg-white/5 text-xs rounded" onclick="removeCustomTopic('${t.id}')">Xóa</button>
        </div>
      </div>
    `).join('');
  }

  // -------------------------------
  // GEMINI API CALL
  // -------------------------------
  async function callGemini(prompt) {
    // append KB context so Gemini answers in line with local KB when relevant
    const kbContext = `\n\nReference (local): ${drowningKB.short}`;
    const finalPrompt = prompt + kbContext;

    const res = await fetch(`${GEMINI_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: finalPrompt }] }]
      }),
    });

    if (!res.ok) throw new Error("Gemini API request failed");

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không nhận được phản hồi từ AI.";
  }

  // -------------------------------
  // UI HELPERS
  // -------------------------------
  // initialize badge state
  renderTrainingBadge();

  function addMessage(text, type) {
    const div = document.createElement("div");
    div.className = `chat-bubble ${type}`;
    div.textContent = text;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }
});
