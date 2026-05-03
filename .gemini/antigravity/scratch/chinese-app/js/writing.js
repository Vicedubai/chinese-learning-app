// ===== WRITING TEST LOGIC =====

let writingTimerInterval = null;
let writingTimeRemaining = 600; // 10 minutes
let writingImageBase64 = null;
let currentWritingTopic = null;

function initWritingPage() {
  setupWritingDragDrop();
}

function generateWritingTopic() {
  if (WRITING_TOPICS.length === 0) return;
  const randomIndex = Math.floor(Math.random() * WRITING_TOPICS.length);
  currentWritingTopic = WRITING_TOPICS[randomIndex];

  let topicHtml = `<h3 style="color: var(--gold); margin-bottom: 12px; font-size: 20px;">📝 ${currentWritingTopic.title}</h3>`;
  topicHtml += `<p style="margin-bottom: 8px;"><strong>Yêu cầu:</strong> Viết một đoạn văn khoảng 150-200 chữ về chủ đề trên.</p>`;
  if (currentWritingTopic.questions && currentWritingTopic.questions.length > 0) {
    topicHtml += `<p style="margin-bottom: 4px;"><strong>Gợi ý:</strong></p><ul style="padding-left: 20px; color: var(--text-2); margin-bottom: 16px;">`;
    currentWritingTopic.questions.forEach(q => {
      topicHtml += `<li>${q}</li>`;
    });
    topicHtml += `</ul>`;
  }
  
  document.getElementById('writing-topic-display').innerHTML = topicHtml;
  
  // Reset everything
  document.getElementById('writing-input').value = '';
  removeWritingImage();
  document.getElementById('writing-feedback').style.display = 'none';
  document.getElementById('btn-submit-writing').disabled = false;

  startWritingTimer();
}

function startWritingTimer() {
  clearInterval(writingTimerInterval);
  writingTimeRemaining = 600; // 10 minutes
  updateTimerDisplay();
  
  writingTimerInterval = setInterval(() => {
    writingTimeRemaining--;
    updateTimerDisplay();
    
    if (writingTimeRemaining <= 0) {
      clearInterval(writingTimerInterval);
      toast('Đã hết thời gian làm bài!', 'warning');
      // Optionally auto-submit
    }
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(writingTimeRemaining / 60).toString().padStart(2, '0');
  const s = (writingTimeRemaining % 60).toString().padStart(2, '0');
  document.getElementById('writing-timer').textContent = `${m}:${s}`;
  
  if (writingTimeRemaining <= 60) {
    document.getElementById('writing-timer').style.color = 'var(--red)';
  } else {
    document.getElementById('writing-timer').style.color = 'var(--text-1)';
  }
}

// Drag & Drop & File Input Setup
function setupWritingDragDrop() {
  const dropZone = document.getElementById('writing-image-dropzone');
  const fileInput = document.getElementById('writing-image-input');
  
  dropZone.addEventListener('click', () => fileInput.click());
  
  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--gold)';
    dropZone.style.background = 'rgba(240,180,41,0.1)';
  });
  
  dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    dropZone.style.background = 'transparent';
  });
  
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--border)';
    dropZone.style.background = 'transparent';
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleWritingImageFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      handleWritingImageFile(e.target.files[0]);
    }
  });
}

function handleWritingImageFile(file) {
  if (!file.type.startsWith('image/')) {
    toast('Vui lòng chọn file hình ảnh', 'error');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    writingImageBase64 = e.target.result;
    const previewArea = document.getElementById('writing-image-preview');
    previewArea.innerHTML = `
      <div style="position:relative; display:inline-block; margin-top: 12px;">
        <img src="${writingImageBase64}" style="max-height: 200px; border-radius: 8px; border: 1px solid var(--border);">
        <button class="btn" style="position:absolute; top:-10px; right:-10px; background:var(--red); color:white; padding:4px 8px; border-radius:50%; font-size:12px; line-height:1;" onclick="removeWritingImage(event)">✕</button>
      </div>
    `;
  };
  reader.readAsDataURL(file);
}

function removeWritingImage(e) {
  if (e) e.stopPropagation();
  writingImageBase64 = null;
  document.getElementById('writing-image-preview').innerHTML = '';
  document.getElementById('writing-image-input').value = '';
}

async function submitWritingToAI() {
  const textInput = document.getElementById('writing-input').value.trim();
  
  if (!currentWritingTopic) {
    toast('Vui lòng tạo đề bài trước', 'error');
    return;
  }

  if (!textInput && !writingImageBase64) {
    toast('Vui lòng nhập bài làm hoặc tải ảnh bài làm lên', 'warning');
    return;
  }

  const geminiKey = localStorage.getItem('gemini-api-key');
  if (!geminiKey) {
    toast('Vui lòng cài đặt Gemini API Key trong mục "Cài đặt AI"!', 'error');
    return;
  }

  const btnSubmit = document.getElementById('btn-submit-writing');
  btnSubmit.disabled = true;
  btnSubmit.innerHTML = '⏳ Đang chấm bài...';
  
  // Stop timer
  clearInterval(writingTimerInterval);

  try {
    const parts = [
      { text: `Bạn là một giáo viên tiếng Trung. Hãy chấm bài luận tiếng Trung sau đây một cách NGẮN GỌN, SÚC TÍCH.
BẠN BẮT BUỘC PHẢI TRẢ LỜI 100% BẰNG TIẾNG VIỆT (chỉ dùng tiếng Trung khi trích dẫn lỗi sai hoặc viết lại câu).
      
Chủ đề bài viết: ${currentWritingTopic.title}
Yêu cầu: 150-200 chữ.
Gợi ý: ${currentWritingTopic.questions ? currentWritingTopic.questions.join(', ') : 'Không có'}

Yêu cầu trình bày (Ngắn gọn, không lan man):
1. **Tổng quan**: 1-2 câu nhận xét chung.
2. **Lỗi dùng từ & Ngữ pháp**: Gạch đầu dòng các lỗi sai, giải thích ngắn gọn lý do và cách sửa.
3. **Lỗi nét chữ** (chỉ nếu có ảnh chụp): Gạch đầu dòng các chữ viết sai nét.
4. **Bài sửa hoàn chỉnh**: Cung cấp phiên bản đã sửa lỗi (không cần giải thích thêm).

Bài làm của học sinh:
${textInput || "(Học sinh không nhập văn bản, vui lòng xem ảnh đính kèm)"}` }
    ];

    if (writingImageBase64) {
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: writingImageBase64.split(',')[1] } });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts }] })
    });

    if (!res.ok) {
      throw new Error(`Lỗi HTTP ${res.status}`);
    }
    
    const data = await res.json();
    let aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không có nhận xét nào được tạo.';
    
    // Convert basic markdown
    aiResponse = aiResponse.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    aiResponse = aiResponse.replace(/\n/g, '<br>');
    
    const feedbackEl = document.getElementById('writing-feedback');
    feedbackEl.style.display = 'block';
    feedbackEl.innerHTML = `<h3 style="color:var(--green-light); margin-bottom: 12px;">✅ Nhận xét từ AI</h3><div style="line-height: 1.6; color: var(--text-2);">${aiResponse}</div>`;

  } catch (e) {
    toast('Lỗi khi chấm bài: ' + e.message, 'error');
  } finally {
    btnSubmit.disabled = false;
    btnSubmit.innerHTML = '🤖 Nộp bài & Nhờ AI chấm';
  }
}
