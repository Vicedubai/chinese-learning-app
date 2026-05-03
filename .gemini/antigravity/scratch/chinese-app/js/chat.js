// ===== AI CHAT LOGIC =====
let chatAttachments = [];
let chatHistory = DB.get('chatHistory', []);

function renderChatHistory() {
  const container = document.getElementById('chat-messages');
  container.innerHTML = `<div class="chat-msg ai">Chào bạn! Tôi là trợ lý tiếng Trung của bạn. Bạn có thể hỏi tôi về ngữ pháp, yêu cầu tôi giải thích từ vựng trong giáo trình, hoặc gửi file PDF/ảnh để tôi phân tích nhé.</div>`;
  chatHistory.forEach(m => {
    const msg = document.createElement('div');
    msg.className = `chat-msg ${m.role}`;
    let html = m.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    html = html.replace(/\n/g, '<br>');
    msg.innerHTML = html;
    container.appendChild(msg);
  });
  container.scrollTop = container.scrollHeight;
}

function addChatMessage(role, text) {
  const container = document.getElementById('chat-messages');
  const msg = document.createElement('div');
  msg.className = `chat-msg ${role}`;
  
  // Basic markdown-like parsing for bold and code
  let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/`(.*?)`/g, '<code>$1</code>');
  html = html.replace(/\n/g, '<br>');
  
  msg.innerHTML = html;
  container.appendChild(msg);
  container.scrollTop = container.scrollHeight;
  
  // Save to history
  chatHistory.push({ role, text });
  if (chatHistory.length > 50) chatHistory.shift(); // Keep last 50
  DB.set('chatHistory', chatHistory);
}

async function handleChatFiles(files) {
  const preview = document.getElementById('chat-preview-area');
  for (const file of files) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      const id = Date.now() + Math.random();
      chatAttachments.push({ id, file, data });
      
      const item = document.createElement('div');
      item.className = 'chat-preview-item';
      item.id = `preview-${id}`;
      
      if (file.type.startsWith('image/')) {
        item.innerHTML = `<img src="${data}"><button class="remove" onclick="removeChatAttachment(${id})">✕</button>`;
      } else {
        const ext = file.name.split('.').pop().toUpperCase();
        item.innerHTML = `<div class="file-ext">${ext}</div><button class="remove" onclick="removeChatAttachment(${id})">✕</button>`;
      }
      preview.appendChild(item);
    };
    reader.readAsDataURL(file);
  }
}

function removeChatAttachment(id) {
  chatAttachments = chatAttachments.filter(a => a.id !== id);
  const el = document.getElementById(`preview-${id}`);
  if (el) el.remove();
}

async function sendChatMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text && chatAttachments.length === 0) return;
  
  const geminiKey = localStorage.getItem('gemini-api-key');
  if (!geminiKey) {
    toast('Vui lòng cài đặt Gemini API Key trong mục "Cài đặt AI"!', 'error');
    return;
  }

  // UI update
  addChatMessage('user', text || '(Gửi file)');
  input.value = '';
  input.style.height = '44px';
  const btn = document.getElementById('btn-send-chat');
  btn.disabled = true;
  btn.textContent = '...';

  try {
    const parts = [
      { text: `Bạn là Trợ lý Tiếng Trung thông minh trong ứng dụng học tiếng Trung của người dùng.
        Người dùng hiện có ${State.books.length} giáo trình và ${State.cards.length} thẻ vựng.
        Hãy trả lời câu hỏi của họ, giải thích ngữ pháp hoặc phân tích file họ gửi kèm.
        Nếu họ gửi file OCR, hãy giúp họ dịch hoặc tóm tắt.
        
        Câu hỏi: ${text}` }
    ];

    // Add attachments
    for (const att of chatAttachments) {
      if (att.file.type.startsWith('image/')) {
        parts.push({ inlineData: { mimeType: att.file.type, data: att.data.split(',')[1] } });
      } else if (att.file.type === 'application/pdf') {
        // PDF needs special handling (render to images or send as file if API supports)
        // For simplicity, we'll notify user we only support images for now or just send file bytes if small
        parts.push({ inlineData: { mimeType: att.file.type, data: att.data.split(',')[1] } });
      }
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      if (errData && errData.error) {
        throw new Error(errData.error.message || `Lỗi HTTP ${res.status}`);
      }
      throw new Error(`Gemini API Error (HTTP ${res.status})`);
    }
    
    const data = await res.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi không hiểu yêu cầu của bạn.';
    
    addChatMessage('ai', aiResponse);
    
    // Do not clear attachments automatically so user can keep asking about the PDF
    // chatAttachments = [];
    // document.getElementById('chat-preview-area').innerHTML = '';

  } catch (e) {
    addChatMessage('ai', '⚠️ Lỗi: ' + e.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Gửi';
  }
}

