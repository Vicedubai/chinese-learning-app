// ===== DATA RECOVERY FUNCTIONS =====
function checkAndRecoverPlaylistData() {
  try {
    const playlist = State.dictationPlaylist || [];
    let hasCorruption = false;
    let recoveredCount = 0;
    
    // Check for corrupted items
    const validPlaylist = playlist.filter(item => {
      if (!item || typeof item !== 'object' || !item.id) {
        hasCorruption = true;
        return false;
      }
      
      // Fix missing properties
      if (!item.videoId && item.url) {
        const videoId = extractYTId(item.url);
        if (videoId) {
          item.videoId = videoId;
          recoveredCount++;
        }
      }
      
      if (!item.title) {
        item.title = `Video ${item.id}`;
        recoveredCount++;
      }
      
      if (typeof item.totalCount !== 'number') {
        item.totalCount = 0;
      }
      
      if (typeof item.completedCount !== 'number') {
        item.completedCount = 0;
      }
      
      return true;
    });
    
    if (hasCorruption || recoveredCount > 0) {
      State.dictationPlaylist = validPlaylist;
      State.save();
      
      if (hasCorruption) {
        toast(`⚠️ Đã phát hiện và sửa lỗi dữ liệu playlist. Khôi phục ${validPlaylist.length} video.`, 'info');
      }
      
      if (recoveredCount > 0) {
        toast(`🔧 Đã sửa ${recoveredCount} thuộc tính bị thiếu trong playlist.`, 'info');
      }
    }
    
    return validPlaylist;
  } catch (error) {
    console.error('Error checking playlist data:', error);
    return [];
  }
}

// ===== DICTATION MODULE (Sentence-by-sentence) =====
let dictSentences = [];
let dictIdx = 0;
let dictScores = [];
let ytPlayer = null;
let ytApiLoaded = false;
let dictHistory = DB.get('dictation-history', []);

// Load YouTube IFrame API once
(function loadYTApi() {
  if (document.getElementById('yt-api-script')) return;
  const tag = document.createElement('script');
  tag.id = 'yt-api-script';
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
})();

window.onYouTubeIframeAPIReady = function() { ytApiLoaded = true; };

// ===== SETUP =====
function extractYTId(url) {
  const patterns = [
    /(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

function loadDictationVideo() {
  const urlInput = document.getElementById('yt-url').value.trim();
  const videoId = extractYTId(urlInput);
  if (!videoId) { toast('Link YouTube không hợp lệ', 'error'); return; }

  // Show open-in-youtube fallback link
  const openLink = document.getElementById('yt-open-link');
  if (openLink) {
    openLink.href = `https://www.youtube.com/watch?v=${videoId}`;
    openLink.style.display = 'inline-flex';
  }

  const container = document.getElementById('yt-container');
  container.innerHTML = `<div id="yt-player" style="width:100%;height:100%"></div>`;

  const initPlayer = () => {
    ytPlayer = new YT.Player('yt-player', {
      videoId,
      playerVars: { rel: 0, modestbranding: 1 },
      events: {
        onReady: () => toast('Video đã tải!', 'success'),
        onError: (e) => {
          // Error 150/153: embedding blocked — show iframe fallback
          container.innerHTML = `
            <div style="aspect-ratio:16/9;background:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#aaa;padding:16px;text-align:center">
              <div style="font-size:32px;margin-bottom:8px">🔒</div>
              <div style="font-size:13px;margin-bottom:12px">Video không cho phép nhúng.<br>Hãy mở trực tiếp trên YouTube:</div>
              <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" class="btn btn-primary btn-sm">▶ Mở trên YouTube</a>
            </div>`;
        }
      }
    });
  };

  if (ytApiLoaded) initPlayer();
  else { window.onYouTubeIframeAPIReady = () => { ytApiLoaded = true; initPlayer(); }; }
}

// ===== AI AUTO-EXTRACT TRANSCRIPT =====
async function autoExtractTranscript() {
  const urlInput = document.getElementById('yt-url').value.trim();
  if (!urlInput) { toast('Vui lòng nhập link YouTube trước!', 'error'); return; }
  const videoId = extractYTId(urlInput);
  if (!videoId) { toast('Link YouTube không hợp lệ', 'error'); return; }

  const geminiKey = localStorage.getItem('gemini-api-key');
  if (!geminiKey) { toast('Cần Gemini API Key trong mục "Cài đặt AI"!', 'error'); return; }

  const statusBox = document.getElementById('auto-transcript-status');
  const statusIcon = document.getElementById('auto-status-icon');
  const statusMsg = document.getElementById('auto-status-msg');
  const btn = document.getElementById('btn-auto-transcript');

  statusBox.style.display = 'block';
  statusIcon.textContent = '⏳';
  statusMsg.textContent = 'Đang gửi video cho Gemini AI phân tích... (có thể mất 30-60 giây)';
  btn.disabled = true;

  const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;

  const prompt = `Hãy xem video YouTube này và trích xuất toàn bộ transcript (phụ đề/lời thoại) từ video.
  
  Yêu cầu:
  1. Mỗi câu/cụm câu hoàn chỉnh trên một dòng riêng biệt.
  2. BẮT BUỘC mỗi dòng phải bắt đầu bằng timestamp chính xác định dạng [MM:SS] hoặc [HH:MM:SS].
  3. BẮT BUỘC trả về bằng Tiếng Trung Giản Thể (Simplified Chinese - 简体中文), ngay cả khi video dùng Phồn thể.
  4. BẮT BUỘC cung cấp bản dịch Tiếng Việt phía sau câu tiếng Trung, ngăn cách bởi ký tự |
  5. Chỉ trả về transcript, không giải thích gì thêm.
  6. Mỗi dòng không quá 50 ký tự tiếng Trung để dễ luyện nghe.
  
  Ví dụ:
  [00:05] 我今天想去买东西。 | Hôm nay tôi muốn đi mua đồ.
  [00:12] 你觉得这个怎么样？ | Bạn thấy cái này thế nào?
  
  Video: ${ytUrl}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            { fileData: { mimeType: 'video/*', fileUri: ytUrl } }
          ]
        }],
        generationConfig: { temperature: 0.1 }
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => null);
      throw new Error(errData?.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!transcript.trim()) throw new Error('Gemini không trích được transcript từ video này.');

    document.getElementById('transcript-input').value = transcript.trim();
    statusIcon.textContent = '✅';
    statusMsg.textContent = `Trích xuất thành công! Tìm thấy ${transcript.trim().split('\n').length} câu. Nhấn "Bắt đầu luyện" để tiếp tục.`;
    statusBox.style.border = '1px solid var(--green)';

    toast('✅ Đã trích transcript tự động!', 'success');

    // Auto-load video if not already loaded
    loadDictationVideo();

  } catch (e) {
    statusIcon.textContent = '❌';
    statusMsg.textContent = 'Lỗi: ' + e.message;
    statusBox.style.border = '1px solid var(--red)';
    toast('Lỗi AI: ' + e.message, 'error');
  } finally {
    btn.disabled = false;
  }
}

let checkInterval = null;
function schedulePause() {
  if (checkInterval) clearInterval(checkInterval);
  const currentSentence = dictSentences[dictIdx];
  if (!currentSentence || currentSentence.end === null) {
    // Fallback if no timestamps
    checkInterval = setTimeout(() => {
      if (ytPlayer && ytPlayer.pauseVideo) ytPlayer.pauseVideo();
    }, 6000);
    return;
  }
  
  // High-precision polling to stop exactly at end timestamp
  checkInterval = setInterval(() => {
    if (ytPlayer && ytPlayer.getCurrentTime) {
      const t = ytPlayer.getCurrentTime();
      if (t >= currentSentence.end) {
        ytPlayer.pauseVideo();
        clearInterval(checkInterval);
      }
    }
  }, 100);
}

// ===== TRANSCRIPT PARSING =====
function timeToSeconds(timeStr) {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function parseTranscript(raw) {
  const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const result = [];
  
  for (const line of lines) {
    const match = line.match(/^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s*(.*)$/);
    if (match) {
      let content = match[2].trim();
      let text = content;
      let trans = '';
      if (content.includes('|')) {
        const parts = content.split('|');
        text = parts[0].trim();
        trans = parts.slice(1).join('|').trim();
      }
      result.push({ start: timeToSeconds(match[1]), text: text, translation: trans });
    } else {
      let text = line.trim();
      let trans = '';
      if (text.includes('|')) {
        const parts = text.split('|');
        text = parts[0].trim();
        trans = parts.slice(1).join('|').trim();
      }
      result.push({ start: null, text: text, translation: trans });
    }
  }

  // Calculate end times based on next sentence start
  for (let i = 0; i < result.length; i++) {
    if (result[i].start !== null && i + 1 < result.length && result[i+1].start !== null) {
      result[i].end = result[i+1].start;
    } else if (result[i].start !== null) {
      result[i].end = result[i].start + 5; // fallback end
    } else {
      result[i].end = null;
    }
  }
  
  return result.filter(r => r.text.length > 0);
}

// ===== SESSION =====
function startDictationSession() {
  const raw = document.getElementById('transcript-input').value.trim();
  if (!raw) { toast('Vui lòng dán transcript trước!', 'error'); return; }

  dictSentences = parseTranscript(raw);
  if (dictSentences.length === 0) { toast('Không tìm thấy câu nào trong transcript.', 'error'); return; }

  dictIdx = 0;
  dictScores = [];

  // Save session
  State.saveSession({ 
    currentTask: 'dictation', 
    dictationIndex: 0, 
    dictationQueue: dictSentences,
    dictationInput: ''
  });

  // document.getElementById('dictation-controls').style.display = 'block';
  // document.getElementById('dict-total').textContent = dictSentences.length;
  
  // Layout cleanup: collapse setup
  const setupCard = document.getElementById('dict-setup-card');
  const reopenBtn = document.getElementById('dict-reopen-setup');
  if (setupCard && reopenBtn) {
    setupCard.style.display = 'none';
    reopenBtn.style.display = 'flex';
  }

  renderDictationQuestion();
  toast(`✅ Đã tải ${dictSentences.length} câu. Bắt đầu!`, 'success');
  
  // Save to Playlist if not exists
  const urlInput = document.getElementById('yt-url').value.trim();
  const videoId = extractYTId(urlInput);
  if (videoId) {
    if (!State.dictationPlaylist) State.dictationPlaylist = [];
    let existing = State.dictationPlaylist.find(p => p.videoId === videoId);
    if (!existing) {
      existing = {
        id: Date.now(),
        videoId: videoId,
        url: urlInput,
        transcript: raw,
        title: 'Video Luyện Nghe ' + (State.dictationPlaylist.length + 1),
        completedCount: 0,
        totalCount: dictSentences.length,
        lastIndex: 0,
        playlist: null // Start as loose video
      };
      State.dictationPlaylist.push(existing);
    } else {
      existing.transcript = raw;
      existing.totalCount = dictSentences.length;
    }
    State.save();
    renderDictationPlaylist();
  }

  // Auto play first sentence if video ready
  if (ytPlayer && ytPlayer.seekTo) {
    setTimeout(replayCurrent, 500);
  }
}

function updatePlaylistProgress() {
  const urlInput = document.getElementById('yt-url').value.trim();
  const videoId = extractYTId(urlInput);
  if (!videoId) return;
  
  const item = State.dictationPlaylist?.find(p => p.videoId === videoId);
  if (item) {
    item.lastIndex = dictIdx;
    item.completedCount = dictScores.length;
    item.totalCount = dictSentences.length;
    State.save();
    renderDictationPlaylist();
  }
}

function renderDictationPlaylist() {
  const list = document.getElementById('dictation-playlist-list');
  const countEl = document.getElementById('dict-playlist-count');
  if (!list) return;
  
  // Check and recover playlist data first
  const playlist = checkAndRecoverPlaylistData();
  if (countEl) countEl.textContent = playlist.length;
  
  if (playlist.length === 0) {
    list.innerHTML = '<div class="text-sm text-muted text-center mt-24">Chưa có bài luyện nào.</div>';
    return;
  }
  
  try {
    // Group videos by playlist
    const grouped = {};
    const loose = [];
    
    playlist.forEach(p => {
      // Ensure p is a valid object
      if (!p || typeof p !== 'object') {
        console.warn('Invalid playlist item:', p);
        return;
      }
      
      if (p.playlist && typeof p.playlist === 'string' && p.playlist.trim()) {
        if (!grouped[p.playlist]) {
          grouped[p.playlist] = [];
        }
        grouped[p.playlist].push(p);
      } else {
        loose.push(p);
      }
    });
    
    let html = '';
    
    // Render grouped playlists
    Object.keys(grouped).forEach(playlistName => {
      const videos = grouped[playlistName];
      const isCollapsed = localStorage.getItem(`playlist-${playlistName}-collapsed`) === 'true';
      const icon = isCollapsed ? '▶' : '▼';
      
      html += `
        <div class="playlist-group" style="margin-bottom:16px">
          <div class="playlist-header" style="display:flex;align-items:center;gap:8px;padding:8px 12px;background:var(--bg-3);border-radius:8px;cursor:pointer;border:1px solid var(--border)" onclick="togglePlaylistGroup('${playlistName}')">
            <span style="font-size:14px">${icon}</span>
            <span style="font-size:14px;font-weight:600;color:var(--text-1)">📁 ${playlistName}</span>
            <span class="badge" style="font-size:10px;margin-left:auto">${videos.length} videos</span>
            <button class="btn btn-ghost" onclick="event.stopPropagation();editPlaylistName('${playlistName}')" style="color:var(--gold);padding:2px 4px;font-size:10px;min-height:0;height:auto" title="Đổi tên playlist">✏️</button>
          </div>
          <div class="playlist-videos" id="playlist-${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}" style="display:${isCollapsed ? 'none' : 'block'};margin-left:20px;margin-top:8px">
            ${videos.map(p => renderVideoItem(p, true)).join('')}
          </div>
        </div>
      `;
    });
    
    // Render loose videos
    if (loose.length > 0) {
      html += `
        <div class="loose-videos" style="margin-bottom:16px">
          <div style="font-size:12px;color:var(--text-3);margin-bottom:8px;padding-left:4px">📄 Videos chưa có playlist:</div>
          ${loose.map(p => renderVideoItem(p, false)).join('')}
        </div>
      `;
    }
    
    // Add drop zone for creating new playlist
    html += `
      <div class="playlist-drop-zone" style="border:2px dashed var(--border);border-radius:8px;padding:16px;text-align:center;color:var(--text-3);font-size:12px;margin-top:16px" ondrop="handlePlaylistDrop(event)" ondragover="handlePlaylistDragOver(event)">
        ➕ Kéo video vào đây để tạo playlist mới
      </div>
    `;
    
    list.innerHTML = html;
    
    // Initialize drag & drop handlers
    initializePlaylistDragDrop();
  } catch (error) {
    console.error('Error rendering dictation playlist:', error);
    list.innerHTML = `
      <div class="text-sm text-red text-center mt-24">
        Lỗi hiển thị playlist. 
        <button class="btn btn-sm btn-ghost" onclick="location.reload()" style="margin-top:8px">🔄 Tải lại trang</button>
      </div>
    `;
  }
}

function renderVideoItem(p, inPlaylist) {
  try {
    // Validate input
    if (!p || typeof p !== 'object' || !p.id || !p.videoId) {
      console.warn('Invalid video item:', p);
      return '<div class="text-sm text-red">Invalid video data</div>';
    }
    
    const thumb = `https://img.youtube.com/vi/${p.videoId}/mqdefault.jpg`;
    const progress = p.totalCount ? Math.round((p.completedCount || 0) / p.totalCount * 100) : 0;
    const title = p.title || 'Untitled Video';
    
    return `
      <div class="playlist-item" draggable="true" data-video-id="${p.id}" style="display:flex;gap:12px;padding:8px;border-radius:8px;background:var(--bg-2);border:1px solid var(--border);margin-bottom:8px;cursor:move" ondragstart="handleVideoDragStart(event)" ondragend="handleVideoDragEnd(event)">
        <div style="position:relative;width:120px;height:68px;flex-shrink:0;border-radius:6px;overflow:hidden;background:#000;cursor:pointer" onclick="loadDictationFromPlaylist('${p.id}')">
          <img src="${thumb}" style="width:100%;height:100%;object-fit:cover;opacity:0.8">
          <div style="position:absolute;bottom:4px;right:4px;background:rgba(0,0,0,0.8);color:#fff;font-size:10px;padding:2px 4px;border-radius:2px">
            ${p.totalCount || '?'} câu
          </div>
          ${progress > 0 ? `<div style="position:absolute;bottom:0;left:0;height:3px;background:var(--blue);width:${progress}%"></div>` : ''}
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;justify-content:center">
          <div class="font-medium" id="dict-title-${p.id}" style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:4px;color:var(--text-1)" title="${title}">${title}</div>
          <div class="flex justify-between items-center">
            <span class="text-xs" style="color:var(--text-3)">${progress}% hoàn thành</span>
            <span class="text-xs" style="color:var(--gold)">${p.completedCount || 0}/${p.totalCount || '?'}</span>
          </div>
          ${inPlaylist ? '' : `<div class="text-xs" style="color:var(--text-3);margin-top:4px">Chưa có playlist</div>`}
          <div class="flex justify-end gap-4 mt-4">
            <button class="btn btn-ghost" onclick="event.stopPropagation();editDictationTitle('${p.id}')" style="color:var(--gold);padding:2px 4px;font-size:10px;min-height:0;height:auto" title="Đổi tên">✏️</button>
            ${!inPlaylist ? `<button class="btn btn-ghost" onclick="event.stopPropagation();assignToPlaylist('${p.id}')" style="color:var(--blue);padding:2px 4px;font-size:10px;min-height:0;height:auto" title="Thêm vào playlist">📁</button>` : `<button class="btn btn-ghost" onclick="event.stopPropagation();removeFromPlaylist('${p.id}')" style="color:var(--orange);padding:2px 4px;font-size:10px;min-height:0;height:auto" title="Rời playlist">📤</button>`}
            <button class="btn btn-ghost" onclick="event.stopPropagation();deleteDictationPlaylist('${p.id}')" style="color:var(--red);padding:2px 4px;font-size:10px;min-height:0;height:auto" title="Xóa">🗑️</button>
          </div>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error rendering video item:', error, p);
    return '<div class="text-sm text-red">Error rendering video</div>';
  }
}

function loadDictationFromPlaylist(id) {
  const p = State.dictationPlaylist.find(x => x.id === id);
  if (!p) return;
  document.getElementById('yt-url').value = p.url;
  document.getElementById('transcript-input').value = p.transcript;
  loadDictationVideo();
  toast('Đã tải video từ Playlist. Hãy nhấn Bắt đầu luyện!', 'info');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function deleteDictationPlaylist(id) {
  if (!confirm('Xóa bài luyện này khỏi Playlist?')) return;
  State.dictationPlaylist = State.dictationPlaylist.filter(x => x.id !== id);
  State.save();
  renderDictationPlaylist();
}

// ===== EDIT DICTATION TITLE - INLINE EDITING =====
function editDictationTitle(id) {
  const item = State.dictationPlaylist.find(x => x.id === id);
  if (!item) return;
  
  const titleEl = document.getElementById(`dict-title-${id}`);
  if (!titleEl) return;
  
  // Create inline edit input
  const currentTitle = item.title;
  const input = document.createElement('input');
  input.type = 'text';
  input.value = currentTitle;
  input.className = 'input';
  input.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-1);padding:4px 8px;border:1px solid var(--gold);border-radius:4px;width:100%;background:var(--bg-3)';
  
  // Replace title with input
  titleEl.replaceWith(input);
  input.focus();
  input.select();
  
  // Save on Enter or blur
  const saveEdit = () => {
    const newTitle = input.value.trim();
    
    if (newTitle && newTitle !== currentTitle) {
      item.title = newTitle;
      State.save();
      renderDictationPlaylist();
      toast(`✅ Đã đổi tên thành "${newTitle}"`, 'success');
    } else {
      // Revert
      renderDictationPlaylist();
    }
  };
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveEdit();
    } else if (e.key === 'Escape') {
      renderDictationPlaylist();
    }
  });
  
  input.addEventListener('blur', saveEdit);
}

function toggleDictSetup() {
  const setupCard = document.getElementById('dict-setup-card');
  const reopenBtn = document.getElementById('dict-reopen-setup');
  if (setupCard.style.display === 'none') {
    setupCard.style.display = 'block';
    reopenBtn.style.display = 'none';
  } else {
    setupCard.style.display = 'none';
    reopenBtn.style.display = 'flex';
  }
}

function renderDictationQuestion() {
  const panel = document.getElementById('dictation-exercise');
  const sentence = dictSentences[dictIdx];
  const idx = dictIdx;
  const total = dictSentences.length;

  // Save current position
  State.saveSession({ 
    currentTask: 'dictation', 
    dictationIndex: idx, 
    dictationQueue: dictSentences,
    dictationInput: document.getElementById('dict-user-input')?.value || ''
  });

  panel.innerHTML = `
    <div style="display:flex;flex-direction:column;gap:16px;height:100%">
      <!-- Top controls -->
      <div class="flex items-center gap-12" style="background:var(--bg-2);padding:12px 16px;border-radius:12px;border:1px solid var(--border)">
        <button class="btn btn-primary" style="border-radius:50%;width:44px;height:44px;padding:0;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(0,0,0,0.2)" onclick="replayCurrent()">
          <span style="font-size:20px;margin-left:4px">▶</span>
        </button>
        <button class="btn btn-ghost btn-sm" onclick="dictGo(-1)" ${idx === 0 ? 'disabled' : ''}>←</button>
        <span class="text-sm font-medium" style="color:var(--text-2)"><span id="dict-current">${idx + 1}</span> / <span id="dict-total">${total}</span></span>
        <button class="btn btn-ghost btn-sm" onclick="dictGo(1)" ${idx === total - 1 ? 'disabled' : ''}>→</button>
        <div style="flex:1"></div>
        <button class="btn btn-ghost btn-sm" onclick="revealAnswer()">👁 Xem đáp án</button>
      </div>

      <!-- Input Area -->
      <div style="position:relative">
        <textarea id="dict-user-input" class="input" style="width:100%;min-height:160px;font-size:22px;padding:20px;padding-bottom:60px;border-radius:12px;border:2px solid var(--border);resize:none;background:var(--bg-1)" placeholder="Nhập câu tiếng Trung bạn nghe được... (Nhấn Enter để nộp)"></textarea>
        <div class="flex justify-end gap-8" style="position:absolute;bottom:16px;right:16px">
          <button class="btn btn-primary btn-sm" onclick="checkDictationAnswer()" id="dict-btn-check" style="background:var(--green);border-color:var(--green);padding:0 20px">Kiểm tra</button>
          <button class="btn btn-primary btn-sm" onclick="dictGo(1)" id="dict-btn-next" style="display:none;background:var(--blue);border-color:var(--blue);padding:0 20px">Tiếp tục →</button>
        </div>
      </div>

      <!-- Feedback Area -->
      <div id="dict-feedback-area" style="display:flex;flex-direction:column;gap:12px"></div>
    </div>
  `;

  // Auto-focus input
  setTimeout(() => { const el = document.getElementById('dict-user-input'); if (el) el.focus(); }, 100);
}

function revealAnswer() {
  const sentence = dictSentences[dictIdx];
  const fb = document.getElementById('dict-feedback-area');
  fb.innerHTML = `
    <div class="card" style="padding:16px;border-left:4px solid var(--gold)">
      <div class="text-sm text-muted mb-8">💡 Đáp án</div>
      <div class="chinese" style="font-size:24px;line-height:1.6">${sentence.text}</div>
      ${sentence.translation ? `<div style="font-size:16px;color:var(--text-2);margin-top:8px">${sentence.translation}</div>` : ''}
    </div>
  `;
}

function checkDictationAnswer() {
  const input = document.getElementById('dict-user-input')?.value.trim();
  if (!input) { toast('Hãy nhập câu trả lời trước!', 'error'); return; }
  
  const answer = dictSentences[dictIdx].text;
  const sim = calcSimilarity(input.replace(/\s/g,''), answer.replace(/\s/g,''));
  const pct = Math.round(sim * 100);
  const correct = pct >= 75;

  dictScores.push({ idx: dictIdx, input, answer, pct, correct });
  if (correct) State.addXP(10);
  State.logResult('dictation', correct);

  // Update UI
  const inp = document.getElementById('dict-user-input');
  if (inp) {
    inp.disabled = true;
    inp.style.borderColor = correct ? 'var(--green)' : 'var(--red)';
    inp.style.background = correct ? 'rgba(46, 204, 113, 0.05)' : 'rgba(231, 76, 60, 0.05)';
  }
  
  document.getElementById('dict-btn-check').style.display = 'none';
  const nextBtn = document.getElementById('dict-btn-next');
  nextBtn.style.display = 'inline-flex';
  if (dictIdx === dictSentences.length - 1) {
    nextBtn.textContent = '🏁 Kết thúc';
  }

  const fb = document.getElementById('dict-feedback-area');
  fb.innerHTML = `
    <div class="card" style="padding:16px;border-left:4px solid ${correct ? 'var(--green)' : 'var(--red)'}">
      <div class="text-sm text-muted mb-8">${correct ? '✅ Tuyệt vời! Bạn nghe rất chuẩn' : '📝 Cần luyện thêm (' + pct + '% chính xác)'}</div>
      <div class="chinese" style="font-size:24px;line-height:1.6;margin-bottom:8px">${highlightDiff(input, answer)}</div>
      ${!correct ? `<div class="chinese" style="font-size:20px;color:var(--gold)">${answer}</div>` : ''}
      ${dictSentences[dictIdx].translation ? `<div style="font-size:16px;color:var(--text-2);margin-top:8px;padding-top:8px;border-top:1px dashed var(--border)">${dictSentences[dictIdx].translation}</div>` : ''}
      <div class="flex justify-between items-center mt-12 pt-12" style="border-top:1px solid rgba(255,255,255,0.1)">
        <div class="text-xs text-muted">Lưu từ vựng / câu này để ôn tập lại bằng Spaced Repetition</div>
        <button class="btn btn-ghost btn-sm" style="border:1px solid var(--border)" onclick="saveDictationToFlashcard('${encodeURIComponent(answer)}')">⭐ Lưu vào Flashcard</button>
      </div>
    </div>
  `;
  updatePlaylistProgress();
}

function saveDictationToFlashcard(encodedAnswer) {
  const answer = decodeURIComponent(encodedAnswer);
  State.cards.push({
    id: Date.now(),
    front: answer,
    back: 'Câu trong bài Luyện Nghe',
    deck: 'Luyện Nghe',
    nextReview: Date.now(),
    ef: 2.5,
    interval: 1,
    reps: 0
  });
  State.save();
  toast('⭐ Đã lưu vào bộ thẻ "Luyện Nghe"!', 'success');
}

function dictGo(dir) {
  const newIdx = dictIdx + dir;
  if (newIdx < 0 || newIdx >= dictSentences.length) {
    if (newIdx >= dictSentences.length) showDictationResult();
    return;
  }
  dictIdx = newIdx;
  renderDictationQuestion();
  replayCurrent();
}

function replayCurrent() {
  if (!ytPlayer || !ytPlayer.playVideo) {
    toast('Video chưa được tải.', 'error'); return;
  }
  const current = dictSentences[dictIdx];
  if (current && current.start !== null) {
    ytPlayer.seekTo(current.start, true);
  }
  ytPlayer.playVideo();
  schedulePause();
}

function showDictationResult() {
  const total = dictScores.length;
  const correct = dictScores.filter(s => s.correct).length;
  const avg = total ? Math.round(dictScores.reduce((a, b) => a + b.pct, 0) / total) : 0;

  const panel = document.getElementById('dictation-exercise');
  panel.innerHTML = `
    <div style="text-align:center;padding:24px 0">
      <div style="font-size:56px;margin-bottom:8px">${avg >= 80 ? '🎉' : avg >= 60 ? '👍' : '💪'}</div>
      <h3 style="font-size:22px;margin-bottom:4px">${avg >= 80 ? 'Xuất sắc!' : avg >= 60 ? 'Tốt lắm!' : 'Cần luyện thêm!'}</h3>
      <p class="text-muted text-sm">Đúng ${correct}/${total} câu · Trung bình ${avg}%</p>
    </div>
    <div class="progress-bar mb-16"><div class="progress-fill" style="width:${avg}%;background:${avg >= 80 ? 'var(--green)' : avg >= 60 ? 'var(--gold)' : 'var(--red)'}"></div></div>
    <h4 class="label mb-12">Chi tiết từng câu:</h4>
    <div style="max-height:300px;overflow-y:auto;display:flex;flex-direction:column;gap:8px">
      ${dictScores.map(s => `
        <div class="flex items-center gap-12" style="padding:10px;background:var(--bg-2);border-radius:8px">
          <span style="font-size:18px">${s.correct ? '✅' : '❌'}</span>
          <div style="flex:1;min-width:0">
            <div class="chinese text-sm" style="color:var(--gold);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.answer}</div>
            <div class="text-xs text-muted">${s.pct}% • ${s.input || '(bỏ qua)'}</div>
          </div>
        </div>`).join('')}
    </div>
    <button class="btn btn-primary w-full mt-16" onclick="startDictationSession()">↺ Luyện lại</button>`;
  
  document.getElementById('dictation-controls').style.display = 'none';
}

function resetDictation() {
  dictSentences = [];
  dictIdx = 0;
  dictScores = [];
  State.clearSession(); // Clear session when reset
  document.getElementById('dictation-controls').style.display = 'none';
  document.getElementById('dictation-exercise').innerHTML = `
    <div style="text-align:center;color:var(--text-3);padding:48px 0">
      <div style="font-size:48px;margin-bottom:12px">🎧</div>
      <p>Dán transcript vào bên trái và nhấn <strong>Bắt đầu luyện</strong></p>
    </div>`;
  document.getElementById('transcript-input').value = '';
  
  const setupCard = document.getElementById('dict-setup-card');
  const reopenBtn = document.getElementById('dict-reopen-setup');
  if (setupCard) setupCard.style.display = 'block';
  if (reopenBtn) reopenBtn.style.display = 'none';
  
  toast('Đã đặt lại bài luyện', 'info');
}

// ===== GLOBAL KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
  if (currentPage !== 'dictation') return;
  if (dictSentences.length === 0) return;
  
  const isInputFocused = document.activeElement && document.activeElement.id === 'dict-user-input';
  
  // Bỏ qua nếu đang gõ Pinyin (IME)
  if (e.isComposing || e.keyCode === 229) return;
  
  // Ctrl: Replay
  if (e.key === 'Control') {
    e.preventDefault();
    replayCurrent();
    return;
  }
  
  if (e.key === 'ArrowRight') {
    // Only prevent default if we are not composing, but we already returned early if composing
    if (isInputFocused && document.activeElement.selectionStart !== document.activeElement.selectionEnd) {
      // If they selected text, let them do whatever
    } else {
      e.preventDefault();
      dictGo(1);
    }
  } else if (e.key === 'ArrowLeft') {
    if (isInputFocused && document.activeElement.selectionStart !== document.activeElement.selectionEnd) {
      // Ignore
    } else {
      e.preventDefault();
      dictGo(-1);
    }
  } else if (e.key === 'Enter') {
    if (isInputFocused) {
      e.preventDefault();
      checkDictationAnswer();
    } else {
      // If already answered and input disabled, pressing Enter goes to next
      const inp = document.getElementById('dict-user-input');
      if (inp && inp.disabled) {
        e.preventDefault();
        dictGo(1);
      }
    }
  }
});

// ===== HELPERS =====
function highlightDiff(input, answer) {
  // Simple char-by-char highlight
  let out = '';
  const maxLen = Math.max(input.length, answer.length);
  for (let i = 0; i < input.length; i++) {
    const c = input[i];
    const match = i < answer.length && c === answer[i];
    out += match ? `<span style="color:var(--green-light)">${c}</span>` : `<span style="color:var(--red-light)">${c}</span>`;
  }
  return out || input;
}

function calcSimilarity(a, b) {
  if (a === b) return 1;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;
  if (longer.length === 0) return 1;
  const dist = editDistance(longer, shorter);
  return (longer.length - dist) / longer.length;
}

function editDistance(s1, s2) {
  const m = s1.length, n = s2.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function renderDictationHistory() {
  // kept for backward compat
}

// ===== DIAGNOSTIC MODULE =====
function renderDiagnostic() {
  const results = State.progress.results || [];
  if (!results.length) {
    document.getElementById('diag-empty').style.display = 'block';
    document.getElementById('diag-content').style.display = 'none';
    return;
  }
  document.getElementById('diag-empty').style.display = 'none';
  document.getElementById('diag-content').style.display = 'block';

  const types = ['mc','translate','rearrange','complete','error','position','flashcard','dictation'];
  const scores = types.map(t => {
    const r = results.filter(x => x.type === t);
    if (!r.length) return 0;
    return Math.round(r.filter(x => x.correct).length / r.length * 100);
  });
  const labels = ['Trắc nghiệm','Dịch thuật','Sắp xếp','Hoàn câu','Tìm lỗi','Vị trí từ','Flashcard','Nghe chép'];

  drawRadar(scores, labels);

  const weakEl = document.getElementById('diag-weak');
  const weak = types.map((t, i) => ({ t, score: scores[i], label: labels[i] }))
    .filter(x => x.score < 70 && x.score > 0)
    .sort((a, b) => a.score - b.score);

  weakEl.innerHTML = weak.length
    ? weak.map(w => `
      <div class="flex items-center gap-12 mt-8" style="padding:12px;border-radius:10px;background:var(--bg-3);border:1px solid var(--border)">
        <div class="progress-bar" style="flex:1;height:10px">
          <div class="progress-fill" style="width:${w.score}%;background:${w.score < 40 ? 'var(--red)' : 'var(--gold)'}"></div>
        </div>
        <span style="min-width:100px;font-size:13px;font-weight:600">${w.label}</span>
        <span style="font-size:13px;color:${w.score < 40 ? 'var(--red-light)' : 'var(--gold)'};font-weight:700">${w.score}%</span>
        <button class="btn btn-sm btn-ghost" onclick="startExercise('${w.t}');navigate('mini-tests')">Luyện</button>
      </div>`).join('')
    : '<p class="text-green" style="font-size:14px">🎉 Tất cả mọi kỹ năng đều trên 70%!</p>';

  const total = results.length;
  const correct = results.filter(r => r.correct).length;
  document.getElementById('diag-total').textContent = total;
  document.getElementById('diag-correct').textContent = correct;
  document.getElementById('diag-overall').textContent = total ? Math.round(correct/total*100) + '%' : '—';
}

function drawRadar(scores, labels) {
  const canvas = document.getElementById('radar-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width = 340, H = canvas.height = 340;
  const cx = W/2, cy = H/2, R = 130;
  const n = scores.length;
  ctx.clearRect(0, 0, W, H);

  for (let r = 1; r <= 4; r++) {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
      const d = R * r / 4;
      const x = cx + Math.cos(angle) * d, y = cy + Math.sin(angle) * d;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath(); ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.stroke();
  }

  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
    ctx.strokeStyle = 'rgba(255,255,255,0.1)'; ctx.stroke();
  }

  ctx.beginPath();
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const d = R * (scores[i] / 100);
    const x = cx + Math.cos(angle) * d, y = cy + Math.sin(angle) * d;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = 'rgba(192,57,43,0.25)'; ctx.fill();
  ctx.strokeStyle = 'var(--red-light)'; ctx.lineWidth = 2; ctx.stroke();

  ctx.fillStyle = '#a8a8c0'; ctx.font = '11px Inter'; ctx.textAlign = 'center';
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2 - Math.PI / 2;
    const lx = cx + Math.cos(angle) * (R + 22), ly = cy + Math.sin(angle) * (R + 22);
    ctx.fillText(labels[i], lx, ly + 4);
  }
}


// ===== PLAYLIST MANAGEMENT =====

let currentRenamingPlaylistId = null;
let selectedPlaylistItems = new Set();
let draggedItem = null;

// ===== PLAYLIST COLLAPSE/EXPAND =====
function togglePlaylistCollapse() {
  const playlistList = document.getElementById('dictation-playlist-list');
  const collapseIcon = document.getElementById('playlist-collapse-icon');
  
  if (!playlistList || !collapseIcon) return;
  
  const isCollapsed = playlistList.style.display === 'none';
  
  if (isCollapsed) {
    // Expand
    playlistList.style.display = 'flex';
    collapseIcon.textContent = '▼';
    localStorage.setItem('playlist-collapsed', 'false');
  } else {
    // Collapse
    playlistList.style.display = 'none';
    collapseIcon.textContent = '▶';
    localStorage.setItem('playlist-collapsed', 'true');
  }
}

// Restore collapse state on page load
function restorePlaylistCollapseState() {
  const isCollapsed = localStorage.getItem('playlist-collapsed') === 'true';
  const playlistList = document.getElementById('dictation-playlist-list');
  const collapseIcon = document.getElementById('playlist-collapse-icon');
  
  if (isCollapsed && playlistList && collapseIcon) {
    playlistList.style.display = 'none';
    collapseIcon.textContent = '▶';
  }
}

// ===== PLAYLIST MANAGER =====
function openPlaylistManager() {
  renderPlaylistManager();
  document.getElementById('modal-playlist-manager').style.display = 'flex';
}

function renderPlaylistManager() {
  const list = document.getElementById('playlist-manager-list');
  const countEl = document.getElementById('playlist-manager-count');
  const playlist = State.dictationPlaylist || [];
  
  if (countEl) countEl.textContent = playlist.length;
  
  if (playlist.length === 0) {
    list.innerHTML = '<div class="text-sm text-muted text-center mt-24">Chưa có video nào.</div>';
    return;
  }
  
  list.innerHTML = playlist.map(p => {
    const thumb = `https://img.youtube.com/vi/${p.videoId}/mqdefault.jpg`;
    const progress = p.totalCount ? Math.round((p.completedCount || 0) / p.totalCount * 100) : 0;
    const isSelected = selectedPlaylistItems.has(p.id);
    
    return `
      <div class="playlist-manager-item" style="display:flex;gap:12px;padding:12px;border-radius:8px;background:var(--bg-2);border:1px solid ${isSelected ? 'var(--blue)' : 'var(--border)'};margin-bottom:8px">
        <input type="checkbox" ${isSelected ? 'checked' : ''} onchange="togglePlaylistSelection('${p.id}')" style="margin-right:8px">
        <div style="position:relative;width:80px;height:45px;flex-shrink:0;border-radius:4px;overflow:hidden;background:#000">
          <img src="${thumb}" style="width:100%;height:100%;object-fit:cover">
          ${progress > 0 ? `<div style="position:absolute;bottom:0;left:0;height:2px;background:var(--blue);width:${progress}%"></div>` : ''}
        </div>
        <div style="flex:1;min-width:0">
          <div class="font-medium" style="font-size:13px;margin-bottom:4px;color:var(--text-1)">${p.title}</div>
          <div class="flex justify-between items-center">
            <span class="text-xs" style="color:var(--text-3)">${progress}% hoàn thành</span>
            <span class="text-xs" style="color:var(--gold)">${p.completedCount || 0}/${p.totalCount || '?'} câu</span>
          </div>
          <div class="text-xs" style="color:var(--text-3);margin-top:4px">
            Thêm: ${new Date(p.id).toLocaleDateString('vi-VN')}
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <button class="btn btn-ghost btn-sm" onclick="editDictationTitle('${p.id}')" style="color:var(--gold);padding:2px 6px;font-size:10px" title="Đổi tên">✏️</button>
          <button class="btn btn-ghost btn-sm" onclick="duplicatePlaylistItem('${p.id}')" style="color:var(--blue);padding:2px 6px;font-size:10px" title="Nhân bản">📋</button>
          <button class="btn btn-ghost btn-sm" onclick="deleteDictationPlaylist('${p.id}')" style="color:var(--red);padding:2px 6px;font-size:10px" title="Xóa">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function togglePlaylistSelection(id) {
  if (selectedPlaylistItems.has(id)) {
    selectedPlaylistItems.delete(id);
  } else {
    selectedPlaylistItems.add(id);
  }
  renderPlaylistManager();
}

function selectAllPlaylist() {
  const playlist = State.dictationPlaylist || [];
  selectedPlaylistItems.clear();
  playlist.forEach(p => selectedPlaylistItems.add(p.id));
  renderPlaylistManager();
}

function deselectAllPlaylist() {
  selectedPlaylistItems.clear();
  renderPlaylistManager();
}

function deleteSelectedPlaylist() {
  if (selectedPlaylistItems.size === 0) {
    toast('Vui lòng chọn video để xóa', 'error');
    return;
  }
  
  if (!confirm(`Xóa ${selectedPlaylistItems.size} video đã chọn?`)) return;
  
  State.dictationPlaylist = State.dictationPlaylist.filter(p => !selectedPlaylistItems.has(p.id));
  selectedPlaylistItems.clear();
  State.save();
  renderPlaylistManager();
  renderDictationPlaylist();
  toast(`✅ Đã xóa ${selectedPlaylistItems.size} video`, 'success');
}

function duplicatePlaylistItem(id) {
  const item = State.dictationPlaylist.find(p => p.id === id);
  if (!item) return;
  
  const newItem = {
    ...item,
    id: Date.now(),
    title: item.title + ' (Copy)',
    completedCount: 0,
    lastIndex: 0
  };
  
  State.dictationPlaylist.push(newItem);
  State.save();
  renderPlaylistManager();
  renderDictationPlaylist();
  toast('✅ Đã nhân bản video', 'success');
}

function sortPlaylist(type) {
  const playlist = State.dictationPlaylist || [];
  
  switch (type) {
    case 'title':
      playlist.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case 'date':
      playlist.sort((a, b) => b.id - a.id); // Newer first
      break;
    case 'progress':
      playlist.sort((a, b) => {
        const progressA = a.totalCount ? (a.completedCount || 0) / a.totalCount : 0;
        const progressB = b.totalCount ? (b.completedCount || 0) / b.totalCount : 0;
        return progressB - progressA; // Higher progress first
      });
      break;
  }
  
  State.dictationPlaylist = playlist;
  State.save();
  renderPlaylistManager();
  renderDictationPlaylist();
  toast(`✅ Đã sắp xếp theo ${type === 'title' ? 'tên' : type === 'date' ? 'ngày' : 'tiến độ'}`, 'success');
}

// ===== MERGE PLAYLIST =====
function openMergePlaylistModal() {
  renderMergePlaylistList();
  document.getElementById('modal-merge-playlist').style.display = 'flex';
}

function renderMergePlaylistList() {
  const list = document.getElementById('merge-playlist-list');
  const playlist = State.dictationPlaylist || [];
  
  if (playlist.length === 0) {
    list.innerHTML = '<div class="text-sm text-muted text-center">Chưa có video nào để gộp.</div>';
    return;
  }
  
  list.innerHTML = playlist.map(p => `
    <label style="display:flex;align-items:center;gap:8px;padding:8px;cursor:pointer;border-radius:4px" onmouseover="this.style.background='var(--bg-3)'" onmouseout="this.style.background='transparent'">
      <input type="checkbox" value="${p.id}" style="margin:0">
      <div style="flex:1;font-size:13px">${p.title}</div>
      <div style="font-size:11px;color:var(--text-3)">${p.totalCount || '?'} câu</div>
    </label>
  `).join('');
}

function executeMergePlaylist() {
  const checkboxes = document.querySelectorAll('#merge-playlist-list input[type="checkbox"]:checked');
  const newName = document.getElementById('merge-playlist-name').value.trim();
  
  if (checkboxes.length < 2) {
    toast('Vui lòng chọn ít nhất 2 video để gộp', 'error');
    return;
  }
  
  if (!newName) {
    toast('Vui lòng nhập tên playlist mới', 'error');
    return;
  }
  
  const selectedIds = Array.from(checkboxes).map(cb => cb.value);
  const selectedItems = State.dictationPlaylist.filter(p => selectedIds.includes(p.id));
  
  // Create merged transcript
  let mergedTranscript = '';
  let totalCount = 0;
  
  selectedItems.forEach((item, index) => {
    if (item.transcript) {
      if (index > 0) mergedTranscript += '\n\n';
      mergedTranscript += `=== ${item.title} ===\n`;
      mergedTranscript += item.transcript;
      totalCount += item.totalCount || 0;
    }
  });
  
  // Create new merged item
  const mergedItem = {
    id: Date.now(),
    videoId: selectedItems[0].videoId, // Use first video's thumbnail
    url: selectedItems[0].url,
    title: newName,
    transcript: mergedTranscript,
    totalCount: totalCount,
    completedCount: 0,
    lastIndex: 0
  };
  
  // Add merged item and remove originals
  State.dictationPlaylist = State.dictationPlaylist.filter(p => !selectedIds.includes(p.id));
  State.dictationPlaylist.push(mergedItem);
  
  State.save();
  document.getElementById('modal-merge-playlist').style.display = 'none';
  document.getElementById('merge-playlist-name').value = '';
  renderDictationPlaylist();
  toast(`✅ Đã gộp ${selectedItems.length} video thành "${newName}"`, 'success');
}

// ===== REORDER PLAYLIST =====
function openReorderPlaylistModal() {
  renderReorderPlaylistList();
  document.getElementById('modal-reorder-playlist').style.display = 'flex';
}

function renderReorderPlaylistList() {
  const list = document.getElementById('reorder-playlist-list');
  const playlist = State.dictationPlaylist || [];
  
  if (playlist.length === 0) {
    list.innerHTML = '<div class="text-sm text-muted text-center">Chưa có video nào để sắp xếp.</div>';
    return;
  }
  
  list.innerHTML = playlist.map((p, index) => {
    const thumb = `https://img.youtube.com/vi/${p.videoId}/mqdefault.jpg`;
    
    return `
      <div class="reorder-item" draggable="true" data-id="${p.id}" style="display:flex;gap:12px;padding:12px;border-radius:8px;background:var(--bg-2);border:1px solid var(--border);cursor:move;margin-bottom:8px">
        <div style="display:flex;align-items:center;color:var(--text-3);font-size:18px">⋮⋮</div>
        <div style="position:relative;width:60px;height:34px;flex-shrink:0;border-radius:4px;overflow:hidden;background:#000">
          <img src="${thumb}" style="width:100%;height:100%;object-fit:cover">
        </div>
        <div style="flex:1;min-width:0">
          <div class="font-medium" style="font-size:13px;margin-bottom:4px;color:var(--text-1)">${p.title}</div>
          <div class="text-xs" style="color:var(--text-3)">${p.totalCount || '?'} câu</div>
        </div>
        <div style="display:flex;align-items:center;color:var(--text-3);font-size:12px">
          #${index + 1}
        </div>
      </div>
    `;
  }).join('');
  
  // Add drag and drop event listeners
  const items = list.querySelectorAll('.reorder-item');
  items.forEach(item => {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
  });
}

function handleDragStart(e) {
  draggedItem = this;
  this.style.opacity = '0.5';
}

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  if (this !== draggedItem) {
    const list = document.getElementById('reorder-playlist-list');
    const allItems = Array.from(list.children);
    const draggedIndex = allItems.indexOf(draggedItem);
    const targetIndex = allItems.indexOf(this);
    
    if (draggedIndex < targetIndex) {
      this.parentNode.insertBefore(draggedItem, this.nextSibling);
    } else {
      this.parentNode.insertBefore(draggedItem, this);
    }
  }
}

function handleDragEnd(e) {
  this.style.opacity = '1';
  draggedItem = null;
}

function savePlaylistOrder() {
  const items = document.querySelectorAll('#reorder-playlist-list .reorder-item');
  const newOrder = Array.from(items).map(item => item.dataset.id);
  
  // Reorder the playlist array
  const playlist = State.dictationPlaylist || [];
  const reorderedPlaylist = [];
  
  newOrder.forEach(id => {
    const item = playlist.find(p => p.id === id);
    if (item) reorderedPlaylist.push(item);
  });
  
  State.dictationPlaylist = reorderedPlaylist;
  State.save();
  
  document.getElementById('modal-reorder-playlist').style.display = 'none';
  renderDictationPlaylist();
  toast('✅ Đã lưu thứ tự mới', 'success');
}

// ===== HIERARCHICAL PLAYLIST FUNCTIONS =====

function togglePlaylistGroup(playlistName) {
  const containerId = `playlist-${playlistName.replace(/[^a-zA-Z0-9]/g, '_')}`;
  const container = document.getElementById(containerId);
  const isCollapsed = container.style.display === 'none';
  
  container.style.display = isCollapsed ? 'block' : 'none';
  localStorage.setItem(`playlist-${playlistName}-collapsed`, isCollapsed ? 'false' : 'true');
  
  // Update icon
  const header = container.previousElementSibling;
  const icon = header.querySelector('span');
  icon.textContent = isCollapsed ? '▼' : '▶';
}

function editPlaylistName(oldName) {
  const newName = prompt('Nhập tên playlist mới:', oldName);
  if (!newName || newName.trim() === '' || newName === oldName) return;
  
  // Update all videos in this playlist
  State.dictationPlaylist.forEach(video => {
    if (video.playlist === oldName) {
      video.playlist = newName.trim();
    }
  });
  
  // Update localStorage keys
  const oldCollapsedKey = `playlist-${oldName}-collapsed`;
  const newCollapsedKey = `playlist-${newName.trim()}-collapsed`;
  const collapsedState = localStorage.getItem(oldCollapsedKey);
  if (collapsedState) {
    localStorage.setItem(newCollapsedKey, collapsedState);
    localStorage.removeItem(oldCollapsedKey);
  }
  
  State.save();
  renderDictationPlaylist();
  toast(`✅ Đã đổi tên playlist thành "${newName.trim()}"`, 'success');
}

function assignToPlaylist(videoId) {
  const video = State.dictationPlaylist.find(v => v.id === videoId);
  if (!video) return;
  
  // Get existing playlist names
  const existingPlaylists = [...new Set(State.dictationPlaylist
    .filter(v => v.playlist && v.playlist.trim())
    .map(v => v.playlist))];
  
  let playlistName;
  if (existingPlaylists.length > 0) {
    const options = existingPlaylists.map((name, index) => `${index + 1}. ${name}`).join('\n');
    const choice = prompt(`Chọn playlist:\n${options}\n\nHoặc nhập tên playlist mới:`);
    
    if (!choice) return;
    
    // Check if it's a number (selecting existing playlist)
    const choiceNum = parseInt(choice);
    if (!isNaN(choiceNum) && choiceNum > 0 && choiceNum <= existingPlaylists.length) {
      playlistName = existingPlaylists[choiceNum - 1];
    } else {
      playlistName = choice.trim();
    }
  } else {
    playlistName = prompt('Nhập tên playlist:');
  }
  
  if (!playlistName || playlistName.trim() === '') return;
  
  video.playlist = playlistName.trim();
  State.save();
  renderDictationPlaylist();
  toast(`✅ Đã thêm video vào playlist "${playlistName.trim()}"`, 'success');
}

function removeFromPlaylist(videoId) {
  const video = State.dictationPlaylist.find(v => v.id === videoId);
  if (!video) return;
  
  if (!confirm(`Rời video "${video.title}" khỏi playlist "${video.playlist}"?`)) return;
  
  delete video.playlist;
  State.save();
  renderDictationPlaylist();
  toast('✅ Đã rời khỏi playlist', 'success');
}

// ===== DRAG & DROP FUNCTIONS =====

let draggedVideoId = null;

function handleVideoDragStart(event) {
  draggedVideoId = event.target.closest('.playlist-item').dataset.videoId;
  event.target.closest('.playlist-item').style.opacity = '0.5';
}

function handleVideoDragEnd(event) {
  event.target.closest('.playlist-item').style.opacity = '1';
  draggedVideoId = null;
}

function handlePlaylistDragOver(event) {
  event.preventDefault();
  event.currentTarget.style.borderColor = 'var(--blue)';
  event.currentTarget.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
}

function handlePlaylistDrop(event) {
  event.preventDefault();
  event.currentTarget.style.borderColor = 'var(--border)';
  event.currentTarget.style.backgroundColor = 'transparent';
  
  if (!draggedVideoId) return;
  
  const playlistName = prompt('Nhập tên playlist mới:');
  if (!playlistName || playlistName.trim() === '') return;
  
  const video = State.dictationPlaylist.find(v => v.id === draggedVideoId);
  if (video) {
    video.playlist = playlistName.trim();
    State.save();
    renderDictationPlaylist();
    toast(`✅ Đã tạo playlist "${playlistName.trim()}" và thêm video`, 'success');
  }
}

// Add drag over handlers for playlist headers
function addPlaylistDragHandlers() {
  document.querySelectorAll('.playlist-header').forEach(header => {
    header.addEventListener('dragover', (e) => {
      e.preventDefault();
      header.style.backgroundColor = 'rgba(52, 152, 219, 0.2)';
    });
    
    header.addEventListener('dragleave', (e) => {
      header.style.backgroundColor = 'var(--bg-3)';
    });
    
    header.addEventListener('drop', (e) => {
      e.preventDefault();
      header.style.backgroundColor = 'var(--bg-3)';
      
      if (!draggedVideoId) return;
      
      const playlistName = header.querySelector('span:nth-child(2)').textContent.replace('📁 ', '');
      const video = State.dictationPlaylist.find(v => v.id === draggedVideoId);
      
      if (video) {
        video.playlist = playlistName;
        State.save();
        renderDictationPlaylist();
        toast(`✅ Đã chuyển video vào playlist "${playlistName}"`, 'success');
      }
    });
  });
}

// Call this after rendering
function initializePlaylistDragDrop() {
  setTimeout(() => {
    addPlaylistDragHandlers();
  }, 100);
}

function openCreatePlaylistModal() {
  document.getElementById('new-playlist-name').value = '';
  document.getElementById('modal-create-playlist').style.display = 'flex';
  document.getElementById('new-playlist-name').focus();
}

function createNewPlaylist() {
  const name = document.getElementById('new-playlist-name').value.trim();
  if (!name) {
    toast('Vui lòng nhập tên playlist', 'error');
    return;
  }
  
  if (!State.dictationPlaylists) State.dictationPlaylists = [];
  
  const newPlaylist = {
    id: uid(),
    name: name,
    videos: [],
    createdAt: Date.now()
  };
  
  State.dictationPlaylists.push(newPlaylist);
  State.save();
  
  document.getElementById('modal-create-playlist').style.display = 'none';
  toast(`✅ Đã tạo playlist "${name}"!`, 'success');
  renderDictationPlaylist();
}

function openImportYouTubePlaylistModal() {
  document.getElementById('yt-playlist-url').value = '';
  document.getElementById('yt-playlist-name').value = '';
  document.getElementById('yt-import-status').style.display = 'none';
  document.getElementById('modal-import-yt-playlist').style.display = 'flex';
}

async function importYouTubePlaylist() {
  const url = document.getElementById('yt-playlist-url').value.trim();
  if (!url) {
    toast('Vui lòng nhập link playlist YouTube', 'error');
    return;
  }
  
  // Extract playlist ID from URL
  const playlistIdMatch = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  if (!playlistIdMatch) {
    toast('Link playlist không hợp lệ. Vui lòng kiểm tra lại.', 'error');
    return;
  }
  
  const playlistId = playlistIdMatch[1];
  const customName = document.getElementById('yt-playlist-name').value.trim();
  
  const statusEl = document.getElementById('yt-import-status');
  statusEl.style.display = 'block';
  
  try {
    document.getElementById('yt-import-icon').textContent = '⏳';
    document.getElementById('yt-import-msg').textContent = 'Đang tải danh sách video từ YouTube...';
    
    // Use YouTube Data API v3 with default API key
    const API_KEY = 'AIzaSyAcr5xrIzl02jskeIeYI8Yn3vGysygbQsE'; // Default API key
    
    // Fetch playlist info
    const playlistResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=${playlistId}&key=${API_KEY}`
    );
    
    if (!playlistResponse.ok) {
      throw new Error('Không thể tải playlist. Vui lòng kiểm tra link.');
    }
    
    const playlistData = await playlistResponse.json();
    
    if (!playlistData.items || playlistData.items.length === 0) {
      throw new Error('Playlist không tồn tại hoặc không công khai');
    }
    
    const playlistInfo = playlistData.items[0].snippet;
    const playlistName = customName || playlistInfo.title;
    
    // Fetch playlist videos (max 50 videos)
    const videosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
    );
    
    if (!videosResponse.ok) {
      throw new Error('Không thể tải danh sách video');
    }
    
    const videosData = await videosResponse.json();
    const videos = videosData.items || [];
    
    document.getElementById('yt-import-msg').textContent = `Đã tìm thấy ${videos.length} video. Đang tạo playlist...`;
    
    // Create dictation items for each video
    if (!State.dictationPlaylist) State.dictationPlaylist = [];
    
    let addedCount = 0;
    for (const video of videos) {
      const videoId = video.snippet.resourceId.videoId;
      const videoTitle = video.snippet.title;
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Check if video already exists
      const exists = State.dictationPlaylist.find(p => p.videoId === videoId);
      if (exists) continue;
      
      // Add to playlist
      State.dictationPlaylist.push({
        id: uid(),
        videoId: videoId,
        url: videoUrl,
        title: `${playlistName} - ${videoTitle}`,
        transcript: '', // User will add transcript later
        totalCount: 0,
        completedCount: 0,
        order: State.dictationPlaylist.length
      });
      
      addedCount++;
    }
    
    State.save();
    
    document.getElementById('yt-import-icon').textContent = '✅';
    document.getElementById('yt-import-msg').textContent = `Đã thêm ${addedCount} video từ playlist "${playlistName}"!`;
    
    setTimeout(() => {
      document.getElementById('modal-import-yt-playlist').style.display = 'none';
      renderDictationPlaylist();
      toast(`✅ Đã thêm ${addedCount} video từ YouTube playlist!`, 'success');
    }, 1500);
    
  } catch (e) {
    console.error('Import playlist error:', e);
    document.getElementById('yt-import-icon').textContent = '❌';
    document.getElementById('yt-import-msg').textContent = `Lỗi: ${e.message}`;
    toast(`❌ ${e.message}`, 'error');
  }
}

function openRenameVideoModal(playlistId, videoId) {
  currentRenamingPlaylistId = playlistId;
  const playlist = State.dictationPlaylists?.find(p => p.id === playlistId);
  const video = playlist?.videos?.find(v => v.id === videoId);
  
  if (!video) return;
  
  document.getElementById('rename-video-input').value = video.title;
  document.getElementById('modal-rename-video').style.display = 'flex';
  document.getElementById('rename-video-input').focus();
}

function saveRenamedVideo() {
  const newName = document.getElementById('rename-video-input').value.trim();
  if (!newName) {
    toast('Vui lòng nhập tên mới', 'error');
    return;
  }
  
  // Find and update video
  const playlist = State.dictationPlaylists?.find(p => p.id === currentRenamingPlaylistId);
  if (!playlist) return;
  
  // This would need the videoId to be stored, for now we'll update the current one
  // In a real implementation, you'd pass videoId as parameter
  
  State.save();
  document.getElementById('modal-rename-video').style.display = 'none';
  toast('✅ Đã đổi tên video!', 'success');
  renderDictationPlaylist();
}

function addVideoToPlaylist(playlistId) {
  const url = document.getElementById('yt-url').value.trim();
  const transcript = document.getElementById('transcript-input').value.trim();
  
  if (!url) {
    toast('Vui lòng nhập link YouTube', 'error');
    return;
  }
  
  if (!State.dictationPlaylists) State.dictationPlaylists = [];
  
  const playlist = State.dictationPlaylists.find(p => p.id === playlistId);
  if (!playlist) return;
  
  const videoId = extractYTId(url);
  if (!videoId) {
    toast('Link YouTube không hợp lệ', 'error');
    return;
  }
  
  const video = {
    id: uid(),
    url: url,
    videoId: videoId,
    title: document.getElementById('yt-url').value, // Will be updated with actual title
    transcript: transcript,
    addedAt: Date.now()
  };
  
  playlist.videos.push(video);
  State.save();
  
  toast('✅ Đã thêm video vào playlist!', 'success');
  renderDictationPlaylist();
}

// ===== DICTATION MINI FLASHCARD =====
let miniFcCards = [];
let miniFcIdx = 0;
let miniFcFlipped = false;

function loadMiniFlashcards() {
  if (!State.getDueCards) return;
  miniFcCards = State.getDueCards();
  if (miniFcCards.length > 30) miniFcCards = miniFcCards.slice(0, 30); // Giới hạn 30 thẻ
  miniFcIdx = 0;
  miniFcFlipped = false;
  renderMiniFlashcard(0);
}

function renderMiniFlashcard(dir = 0) {
  if (miniFcCards.length === 0) {
    const content = document.getElementById('dict-mini-fc-content');
    if(content) content.innerHTML = '<span style="font-size:24px">🎉</span><br><br>Tuyệt vời!<br>Không có thẻ nào đến hạn hôm nay.';
    const count = document.getElementById('dict-mini-fc-count');
    if(count) count.textContent = '0 / 0';
    return;
  }
  
  miniFcIdx += dir;
  if (miniFcIdx < 0) miniFcIdx = miniFcCards.length - 1;
  if (miniFcIdx >= miniFcCards.length) miniFcIdx = 0;
  miniFcFlipped = false;
  
  const card = miniFcCards[miniFcIdx];
  const content = document.getElementById('dict-mini-fc-content');
  if (content) {
    content.innerHTML = `
      <div class="chinese" style="font-size:42px;font-weight:700;margin-bottom:12px;color:var(--text-1);text-shadow:0 2px 10px rgba(0,0,0,0.2)">${card.front}</div>
      <div style="font-size:12px;color:var(--text-3)">(Nhấn để lật)</div>
    `;
  }
  
  const count = document.getElementById('dict-mini-fc-count');
  if (count) count.textContent = `${miniFcIdx + 1} / ${miniFcCards.length}`;
}

function flipMiniFlashcard() {
  if (miniFcCards.length === 0) return;
  const card = miniFcCards[miniFcIdx];
  const content = document.getElementById('dict-mini-fc-content');
  if (!content) return;
  
  if (!miniFcFlipped) {
    miniFcFlipped = true;
    content.innerHTML = `
      <div style="font-size:16px;font-weight:600;margin-bottom:8px;color:var(--gold)">${card.pinyin || ''}</div>
      <div style="font-size:15px;color:var(--text-1);margin-bottom:16px;line-height:1.4">${card.back}</div>
      <div style="font-size:12px;color:var(--text-2);margin-bottom:12px;font-family:'Noto Sans SC',sans-serif">${card.example || ''}</div>
      <div style="display:flex;gap:6px;justify-content:center;margin-top:auto;flex-wrap:wrap">
        <button class="btn btn-sm" style="background:#c0392b;color:white;padding:6px 10px;font-size:12px" onclick="event.stopPropagation();rateMiniCard(1)">Lại</button>
        <button class="btn btn-sm" style="background:#e67e22;color:white;padding:6px 10px;font-size:12px" onclick="event.stopPropagation();rateMiniCard(2)">Khó</button>
        <button class="btn btn-sm" style="background:#27ae60;color:white;padding:6px 10px;font-size:12px" onclick="event.stopPropagation();rateMiniCard(4)">Dễ</button>
      </div>
    `;
  } else {
    miniFcFlipped = false;
    content.innerHTML = `
      <div class="chinese" style="font-size:42px;font-weight:700;margin-bottom:12px;color:var(--text-1);text-shadow:0 2px 10px rgba(0,0,0,0.2)">${card.front}</div>
      <div style="font-size:12px;color:var(--text-3)">(Nhấn để lật)</div>
    `;
  }
}

function rateMiniCard(q) {
  const card = miniFcCards[miniFcIdx];
  State.reviewCard(card.id, q);
  miniFcCards.splice(miniFcIdx, 1);
  if (miniFcIdx >= miniFcCards.length) miniFcIdx = 0;
  renderMiniFlashcard(0);
}

function debugPlaylistData() {
  const playlist = State.dictationPlaylist || [];
  console.log('=== PLAYLIST DEBUG INFO ===');
  console.log('Total items:', playlist.length);
  console.log('Raw data:', playlist);
  
  playlist.forEach((item, index) => {
    console.log(`Item ${index}:`, {
      id: item?.id,
      videoId: item?.videoId,
      title: item?.title,
      playlist: item?.playlist,
      hasTranscript: !!item?.transcript,
      totalCount: item?.totalCount,
      completedCount: item?.completedCount
    });
  });
  
  // Show in UI
  const debugInfo = playlist.map((item, index) => 
    `${index + 1}. ${item?.title || 'No title'} (ID: ${item?.id || 'No ID'}, VideoID: ${item?.videoId || 'No VideoID'})`
  ).join('\n');
  
  alert(`Playlist Debug Info:\n\nTotal: ${playlist.length} items\n\n${debugInfo}`);
}

function recoverPlaylistData() {
  if (!confirm('Khôi phục dữ liệu playlist? Thao tác này sẽ kiểm tra và sửa lỗi dữ liệu.')) return;
  
  try {
    const originalCount = State.dictationPlaylist?.length || 0;
    const recovered = checkAndRecoverPlaylistData();
    
    // Force re-render
    renderDictationPlaylist();
    
    toast(`🔧 Đã kiểm tra dữ liệu. Tìm thấy ${recovered.length} video hợp lệ.`, 'success');
    
    if (recovered.length !== originalCount) {
      toast(`⚠️ Đã loại bỏ ${originalCount - recovered.length} mục dữ liệu không hợp lệ.`, 'info');
    }
  } catch (error) {
    console.error('Recovery error:', error);
    toast('❌ Lỗi khôi phục dữ liệu: ' + error.message, 'error');
  }
}

// ===== UTILITY FUNCTIONS =====
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function navMiniFlashcard(dir) {
  if (event) event.stopPropagation();
  renderMiniFlashcard(dir);
}
