// ===== EXERCISES DATA (built-in samples + dynamic from cards) =====
const SAMPLE_EXERCISES = {
  translate: [
    { vi: 'Tôi muốn học tiếng Trung.', answer: '我想学中文。', hint: '我/想/学/中文' },
    { vi: 'Anh ấy không đi học hôm nay.', answer: '他今天不去上学。', hint: '他/今天/不/去/上学' },
    { vi: 'Bạn có thể giúp tôi không?', answer: '你能帮我吗？', hint: '你/能/帮/我/吗' },
    { vi: 'Tôi đang ăn cơm.', answer: '我在吃饭。', hint: '我/在/吃饭' },
    { vi: 'Hôm nay thời tiết rất đẹp.', answer: '今天天气很好。', hint: '今天/天气/很/好' },
  ],
  complete: [
    { question: '我___去北京，不是今天。', blank: '明天', choices: ['明天','昨天','后天','前天'], answer: '明天', grammar: '时间副词' },
    { question: '他___看书，也喜欢听音乐。', blank: '不只', choices: ['不只','只','也','还'], answer: '不只', grammar: '连接词' },
    { question: '这个苹果___甜。', blank: '很', choices: ['很','非常','太','比较'], answer: '很', grammar: '程度副词' },
    { question: '你___吃饭了吗？', blank: '已经', choices: ['已经','还','刚','还没'], answer: '已经', grammar: '时态副词' },
    { question: '她___比我高。', blank: '比', choices: ['比','不','像','没'], answer: '比', grammar: '比较句' },
  ],
  rearrange: [
    { words: ['我','每天','早上','喝','咖啡'], answer: '我每天早上喝咖啡', meaning: 'Mỗi sáng tôi uống cà phê' },
    { words: ['他','在','图书馆','学习'], answer: '他在图书馆学习', meaning: 'Anh ấy học ở thư viện' },
    { words: ['我','想','和你','一起','去'], answer: '我想和你一起去', meaning: 'Tôi muốn đi cùng bạn' },
    { words: ['她','是','我','最好的','朋友'], answer: '她是我最好的朋友', meaning: 'Cô ấy là bạn thân nhất của tôi' },
    { words: ['我们','明天','要','出发'], answer: '我们明天要出发', meaning: 'Chúng tôi sẽ khởi hành vào ngày mai' },
  ],
  error: [
    { sentence: '我很喜欢吃的苹果。', errorIdx: 2, correct: '我很喜欢吃苹果。', explanation: 'Bỏ "的" - không cần "的" sau động từ trực tiếp' },
    { sentence: '他今天没有去了学校。', errorIdx: 4, correct: '他今天没有去学校。', explanation: 'Bỏ "了" - không dùng "了" sau "没有"' },
    { sentence: '我是学习中文。', errorIdx: 1, correct: '我在学习中文。', explanation: 'Đổi "是" thành "在" - dùng "在" cho hành động đang diễn ra' },
    { sentence: '她比我更高一些。', errorIdx: 2, correct: '她比我高一些。', explanation: 'Bỏ "更" - không dùng "更" trong câu "比"' },
    { sentence: '你到哪里来？', errorIdx: 1, correct: '你从哪里来？', explanation: 'Đổi "到" thành "从" - hỏi xuất phát điểm dùng "从"' },
  ],
  position: [
    { sentence: ['我', '___', '去北京'], word: '明天', correct: 1, meaning: '"明天" phải đứng trước động từ hoặc sau chủ ngữ' },
    { sentence: ['他', '___', '喜欢吃苹果'], word: '也', correct: 1, meaning: '"也" đứng trước động từ, sau chủ ngữ' },
    { sentence: ['她', '学中文', '___'], word: '吗', correct: 2, meaning: '"吗" đứng cuối câu hỏi' },
    { sentence: ['我们', '___', '出发', '了'], word: '已经', correct: 1, meaning: '"已经" đứng trước động từ' },
    { sentence: ['___', '，他不来了'], word: '可能', correct: 0, meaning: '"可能" có thể đứng đầu câu hoặc trước động từ' },
  ],
  mc: [
    { q: '"谢谢" có nghĩa là gì?', choices: ['Xin chào','Cảm ơn','Tạm biệt','Xin lỗi'], answer: 1 },
    { q: 'Từ nào nghĩa là "học sinh"?', choices: ['老师','学生','医生','工人'], answer: 1 },
    { q: '"我不去" — "不" ở đây là gì?', choices: ['Danh từ','Tính từ','Phó từ phủ định','Trợ từ'], answer: 2 },
    { q: 'Chọn câu đúng về trật tự từ:', choices: ['我吃了饭已经','我已经吃了饭','已经我吃了饭','我吃已经了饭'], answer: 1 },
    { q: '"把" trong câu "把书放在桌子上" dùng để làm gì?', choices: ['Chỉ thời gian','Đưa tân ngữ lên trước động từ','Chỉ so sánh','Chỉ bị động'], answer: 1 },
  ]
};

// Current exercise state
let exState = { type: null, idx: 0, score: 0, total: 0, pool: [], answered: false };
let enterPressCount = 0; // Track Enter key presses for 1st=submit, 2nd=next

function buildExercisePool(type) {
  let pool = [];
  if (type === 'mc') {
    pool = [...SAMPLE_EXERCISES.mc];
    // add from cards
    State.cards.slice(0, 20).forEach(c => {
      const wrong = State.cards.filter(x => x.id !== c.id).sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.vietnamese);
      const choices = [...wrong, c.vietnamese].sort(() => Math.random() - 0.5);
      pool.push({ q: `"${c.chinese}" (${c.pinyin}) có nghĩa là gì?`, choices, answer: choices.indexOf(c.vietnamese) });
    });
  } else if (type === 'translate') pool = [...SAMPLE_EXERCISES.translate];
  else if (type === 'complete') pool = [...SAMPLE_EXERCISES.complete];
  else if (type === 'rearrange') pool = [...SAMPLE_EXERCISES.rearrange];
  else if (type === 'error') pool = [...SAMPLE_EXERCISES.error];
  else if (type === 'position') pool = [...SAMPLE_EXERCISES.position];
  return pool.sort(() => Math.random() - 0.5).slice(0, 10);
}

function startExercise(type) {
  try {
    const pool = buildExercisePool(type);
    
    if (!pool || pool.length === 0) {
      toast('Không có bài tập để làm. Vui lòng thêm từ vựng trước.', 'error');
      return;
    }
    
    exState = { type, idx: 0, score: 0, total: 0, pool: pool, answered: false };
    
    // Save session
    State.saveSession({ 
      currentTask: 'exercise', 
      exerciseIndex: 0, 
      exerciseQueue: exState.pool,
      exerciseType: type,
      exerciseScore: 0,
      exerciseTotal: 0
    });
    
    document.getElementById('ex-type-select').style.display = 'none';
    document.getElementById('ex-session').style.display = 'block';
    document.getElementById('ex-result').style.display = 'none';
    showExercise();
  } catch (e) {
    console.error('Lỗi startExercise:', e);
    toast('Lỗi: ' + e.message, 'error');
  }
}

function showExercise() {
  try {
    const { type, idx, pool } = exState;
    if (!pool || idx >= pool.length) { endExercise(); return; }
    const item = pool[idx];
    exState.answered = false;

    document.getElementById('ex-progress-text').textContent = `${idx + 1} / ${pool.length}`;
    document.getElementById('ex-progress-bar').style.width = (idx / pool.length * 100) + '%';
    
    // Determine actual type for display and rendering
    let actualType = type;
    if (type === 'ai' || type === 'comprehensive') {
      actualType = item.type;
    }
    
    document.getElementById('ex-type-label').textContent = typeLabel(type === 'ai' || type === 'comprehensive' ? item.type : type);
    
    // Save current position
    State.saveSession({ 
      currentTask: 'exercise', 
      exerciseIndex: idx, 
      exerciseQueue: pool,
      exerciseType: type,
      exerciseScore: exState.score,
      exerciseTotal: exState.total
    });
    
    // Hide feedback and navigation buttons
    document.getElementById('ex-feedback').style.display = 'none';
    document.getElementById('ex-btn-prev').style.display = 'none';
    document.getElementById('ex-btn-next').style.display = 'none';

    const body = document.getElementById('ex-body');
    if (!body) {
      console.error('ex-body element not found');
      return;
    }

    if (actualType === 'mc') renderMC(body, item);
    else if (actualType === 'translate') renderTranslate(body, item);
    else if (actualType === 'complete') renderComplete(body, item);
    else if (actualType === 'rearrange') renderRearrange(body, item);
    else if (actualType === 'error') renderError(body, item);
    else if (actualType === 'position') renderPosition(body, item);
    else {
      console.error('Unknown exercise type:', actualType);
      body.innerHTML = '<p>Loại bài tập không được hỗ trợ: ' + actualType + '</p>';
    }
    
    // Setup keyboard navigation
    setupExerciseKeyboard();
  } catch (e) {
    console.error('Lỗi showExercise:', e);
    toast('Lỗi: ' + e.message, 'error');
  }
}

function setupExerciseKeyboard() {
  document.removeEventListener('keydown', handleExerciseKey);
  document.addEventListener('keydown', handleExerciseKey);
}

function handleExerciseKey(e) {
  if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    prevExercise();
  } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    if (exState.answered) {
      moveToNextQuestion();
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (!exState.answered) {
      // 1st Enter press: Submit answer (trigger check function)
      const checkBtn = document.querySelector('[onclick*="check"]');
      if (checkBtn) checkBtn.click();
    } else {
      // 2nd Enter press: Move to next question
      moveToNextQuestion();
    }
  }
}

function showFeedback(correct, explanation) {
  const feedbackEl = document.getElementById('ex-feedback');
  const titleEl = document.getElementById('ex-feedback-title');
  const textEl = document.getElementById('ex-feedback-text');
  
  if (correct) {
    feedbackEl.style.borderLeftColor = 'var(--green-light)';
    feedbackEl.style.background = 'rgba(76,175,80,0.1)';
    titleEl.textContent = '✅ Chính xác!';
    titleEl.style.color = 'var(--green-light)';
  } else {
    feedbackEl.style.borderLeftColor = 'var(--red-light)';
    feedbackEl.style.background = 'rgba(192,57,43,0.1)';
    titleEl.textContent = '❌ Sai rồi!';
    titleEl.style.color = 'var(--red-light)';
  }
  
  textEl.innerHTML = explanation || (correct ? 'Bạn trả lời đúng!' : 'Hãy thử lại lần sau!');
  textEl.innerHTML += '<div style="margin-top:12px;font-size:13px;color:var(--text-3)">💡 Nhấn <strong>Enter</strong> để chuyển câu hỏi tiếp theo</div>';
  feedbackEl.style.display = 'block';
  
  // Show navigation buttons
  const { idx, pool } = exState;
  const prevBtn = document.getElementById('ex-btn-prev');
  const nextBtn = document.getElementById('ex-btn-next');
  const navContainer = document.querySelector('[id="ex-btn-prev"]')?.parentElement;
  
  // Always show the navigation container
  if (navContainer) {
    navContainer.style.display = 'flex';
  }
  
  // Show/hide individual buttons
  if (prevBtn) {
    prevBtn.style.display = idx > 0 ? 'inline-block' : 'none';
  }
  if (nextBtn) {
    // Show next button on all questions (including last one, which will end the exercise)
    nextBtn.style.display = 'inline-block';
  }
}

function prevExercise() {
  if (exState.idx > 0) {
    exState.idx--;
    showExercise();
  }
}

function nextExercise(correct) {
  if (exState.answered) return;
  exState.answered = true;
  exState.total++;
  if (correct) { exState.score++; State.addXP(10); }
  State.logResult(exState.type, correct);
  
  // Show feedback
  showFeedback(correct, correct ? '🎉 Bạn trả lời chính xác!' : '💡 Hãy xem lại lý thuyết và thử lại!');
}

function moveToNextQuestion() {
  // Move to next question after feedback is shown
  exState.idx++;
  
  // Check if we've reached the end
  if (exState.idx >= exState.pool.length) {
    endExercise();
  } else {
    showExercise();
  }
}

function endExercise() {
  document.getElementById('ex-session').style.display = 'none';
  document.getElementById('ex-result').style.display = 'block';
  const pct = exState.total ? Math.round(exState.score / exState.total * 100) : 0;
  document.getElementById('ex-res-score').textContent = `${exState.score}/${exState.total}`;
  document.getElementById('ex-res-pct').textContent = pct + '%';
  document.getElementById('ex-res-msg').textContent = pct >= 80 ? '🎉 Xuất sắc!' : pct >= 60 ? '👍 Tốt!' : '💪 Cần luyện thêm!';
  State.clearSession(); // Clear session when completed
  toast(`Kết quả: ${exState.score}/${exState.total} (${pct}%)`, pct >= 60 ? 'success' : 'info', '📊');
}

// ===== RENDER EACH TYPE =====
function renderMC(body, item) {
  body.innerHTML = `
    <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Trắc nghiệm</p>
    <div class="exercise-question">${item.q}</div>
    <div class="exercise-choices">
      ${item.choices.map((c, i) => `<button class="choice-btn" id="choice-${i}" onclick="checkMC(${i},${item.answer})">${'ABCD'[i]}. ${c}</button>`).join('')}
    </div>`;
}

function checkMC(chosen, correct) {
  if (exState.answered) return;
  const btns = document.querySelectorAll('.choice-btn');
  btns.forEach((b, i) => { 
    b.disabled = true; 
    if (i === correct) b.classList.add('correct'); 
    if (i === chosen && i !== correct) b.classList.add('wrong'); 
  });
  
  const item = exState.pool[exState.idx];
  const isCorrect = chosen === correct;
  
  // Tạo giải thích chi tiết
  let explanation = '';
  if (isCorrect) {
    explanation = '<strong>✅ Chính xác!</strong><br>' + (item.explanation || 'Bạn trả lời đúng!');
  } else {
    explanation = '<strong>❌ Sai rồi!</strong><br>';
    explanation += '<strong>Đáp án đúng:</strong> ' + item.choices[correct] + '<br>';
    if (item.explanation) {
      explanation += '<strong>Giải thích:</strong> ' + item.explanation;
    }
  }
  
  exState.answered = true;
  exState.total++;
  if (isCorrect) { exState.score++; State.addXP(10); }
  State.logResult(exState.type, isCorrect);
  
  showFeedback(isCorrect, explanation);
  // ← KHÔNG tự động chuyển sang câu hỏi tiếp theo
}

function renderTranslate(body, item) {
  // Initialize hint state for this exercise
  if (!window.currentHintIndex) {
    window.currentHintIndex = 0;
  } else {
    window.currentHintIndex = 0; // Reset for new exercise
  }
  
  // Create indirect hints from the hint/pinyin
  const indirectHints = item.indirectHints || [
    `Từ khóa: ${item.hint}`,
    `Hãy suy nghĩ về cách sắp xếp các từ này`,
    `Cấu trúc câu: Chủ ngữ + Động từ + Tân ngữ`
  ];
  
  body.innerHTML = `
    <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Dịch sang tiếng Trung</p>
    <div class="exercise-question">${item.vi}</div>
    <textarea class="transcript-input" id="translate-input" placeholder="Nhập câu tiếng Trung..." style="min-height:80px"></textarea>
    <div style="margin-top:12px;display:flex;gap:8px">
      <button class="btn btn-secondary" style="flex:1;font-size:12px" onclick="showIndirectHint(${JSON.stringify(indirectHints).replace(/"/g, '&quot;')})">💡 Thêm gợi ý</button>
      <button class="btn btn-primary" style="flex:1" onclick="checkTranslate('${item.answer.replace(/'/g,"\\'")}')">Kiểm tra</button>
    </div>
    <div id="hint-display" style="margin-top:12px;padding:12px;background:rgba(52,152,219,0.1);border-left:3px solid var(--blue);border-radius:4px;display:none;font-size:13px;color:var(--text-2)"></div>
    <div id="translate-feedback" style="margin-top:12px"></div>`;
}

function checkTranslate(answer) {
  if (exState.answered) return;
  const input = document.getElementById('translate-input').value.trim().replace(/[。？！，、]/g,'').replace(/[.?!,]/g,'');
  const ans = answer.replace(/[。？！，、]/g,'');
  const correct = input === ans;
  
  const item = exState.pool[exState.idx];
  const explanation = item.explanation || (correct ? 'Dịch chính xác!' : `Đáp án: ${answer}`);
  
  document.getElementById('translate-feedback').innerHTML = correct
    ? `<div style="color:var(--green-light);font-size:15px">✅ Chính xác!</div>`
    : `<div style="color:var(--red-light);font-size:15px">❌ Chưa đúng.</div><div class="mt-8 chinese" style="color:var(--gold);font-size:18px">Đáp án: ${answer}</div>`;
  
  exState.answered = true;
  exState.total++;
  if (correct) { exState.score++; State.addXP(10); }
  State.logResult(exState.type, correct);
  
  showFeedback(correct, explanation);
  // ← KHÔNG tự động chuyển sang câu hỏi tiếp theo
}

function renderComplete(body, item) {
  const display = item.question.replace('___', `<span style="color:var(--gold);font-weight:700;border-bottom:2px solid var(--gold);padding:0 8px">___</span>`);
  
  // Initialize hint state for this exercise
  if (!window.currentHintIndex) {
    window.currentHintIndex = 0;
  } else {
    window.currentHintIndex = 0; // Reset for new exercise
  }
  
  body.innerHTML = `
    <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Hoàn thành câu · ${item.grammar}</p>
    <div class="exercise-question chinese">${display}</div>
    <div class="exercise-choices">
      ${item.choices.map((c, i) => `<button class="choice-btn chinese" id="cmp-${i}" onclick="checkComplete('${c}','${item.answer}')">${c}</button>`).join('')}
    </div>
    <div style="margin-top:16px;display:flex;gap:8px">
      <button class="btn btn-secondary" style="flex:1;font-size:12px" onclick="showIndirectHint(${JSON.stringify(item.indirectHints || []).replace(/"/g, '&quot;')})">💡 Thêm gợi ý</button>
    </div>
    <div id="hint-display" style="margin-top:12px;padding:12px;background:rgba(52,152,219,0.1);border-left:3px solid var(--blue);border-radius:4px;display:none;font-size:13px;color:var(--text-2)"></div>`;
}

// Show indirect hint
function showIndirectHint(hints) {
  if (!hints || hints.length === 0) return;
  
  const hintDisplay = document.getElementById('hint-display');
  if (!hintDisplay) return;
  
  if (window.currentHintIndex >= hints.length) {
    hintDisplay.innerHTML = '<p style="margin:0;color:var(--text-3)">Không còn gợi ý nữa. Hãy chọn đáp án!</p>';
    return;
  }
  
  const currentHint = hints[window.currentHintIndex];
  hintDisplay.innerHTML = `<p style="margin:0"><strong>Gợi ý ${window.currentHintIndex + 1}/${hints.length}:</strong> ${currentHint}</p>`;
  hintDisplay.style.display = 'block';
  
  window.currentHintIndex++;
}

function checkComplete(chosen, answer) {
  if (exState.answered) return;
  const correct = chosen === answer;
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === answer) b.classList.add('correct');
    if (b.textContent === chosen && !correct) b.classList.add('wrong');
  });
  
  const item = exState.pool[exState.idx];
  const explanation = item.explanation || (correct ? 'Bạn chọn đúng!' : `Đáp án đúng là: ${answer}`);
  
  exState.answered = true;
  exState.total++;
  if (correct) { exState.score++; State.addXP(10); }
  State.logResult(exState.type, correct);
  
  showFeedback(correct, explanation);
  // ← KHÔNG tự động chuyển sang câu hỏi tiếp theo
}

function renderRearrange(body, item) {
  const shuffled = [...item.words].sort(() => Math.random() - 0.5);
  let arranged = [];
  let bank = [...shuffled];

  function renderState() {
    document.getElementById('rearrange-bank').innerHTML = bank.map((w, i) =>
      `<div class="word-chip" onclick="rearrangePick(${i})">${w}</div>`).join('');
    document.getElementById('rearrange-drop').innerHTML = arranged.map((w, i) =>
      `<div class="word-chip" style="background:rgba(192,57,43,0.15);border-color:var(--red)" onclick="rearrangeRemove(${i})">${w}</div>`).join('');
  }

  window.rearrangePick = (i) => { arranged.push(bank[i]); bank.splice(i, 1); renderState(); };
  window.rearrangeRemove = (i) => { bank.push(arranged[i]); arranged.splice(i, 1); renderState(); };

  body.innerHTML = `
    <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Sắp xếp câu · <span class="text-muted">${item.meaning}</span></p>
    <p class="text-sm text-muted mb-16">Nhấn từ để thêm/xóa khỏi câu</p>
    <label class="label">Kho từ</label>
    <div class="word-bank" id="rearrange-bank"></div>
    <label class="label">Câu của bạn</label>
    <div class="drop-zone" id="rearrange-drop" style="min-height:52px"></div>
    <div id="rearrange-feedback" class="mt-12"></div>
    <button class="btn btn-primary mt-16" onclick="checkRearrange('${item.answer}')">Kiểm tra</button>`;
  renderState();
}

function checkRearrange(answer) {
  if (exState.answered) return;
  const arranged = Array.from(document.querySelectorAll('#rearrange-drop .word-chip')).map(el => el.textContent);
  const userAnswer = arranged.join('');
  const correct = userAnswer === answer;
  document.getElementById('rearrange-feedback').innerHTML = correct
    ? `<div style="color:var(--green-light)">✅ Chính xác!</div>`
    : `<div style="color:var(--red-light)">❌ Đáp án: <span class="chinese" style="color:var(--gold)">${answer}</span></div>`;
  
  exState.answered = true;
  exState.total++;
  if (correct) { exState.score++; State.addXP(10); }
  State.logResult(exState.type, correct);
  
  showFeedback(correct, correct ? 'Sắp xếp chính xác!' : `Đáp án đúng: ${answer}`);
  // ← KHÔNG tự động chuyển sang câu hỏi tiếp theo
}

function renderError(body, item) {
  const words = item.sentence.match(/[\u4e00-\u9fff]+|[^\u4e00-\u9fff\s]+|\s+/g) || [];
  body.innerHTML = `
    <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Tìm lỗi sai trong câu</p>
    <div class="exercise-question chinese" style="font-size:22px;letter-spacing:3px">
      ${words.map((w, i) => `<span class="word-chip" style="cursor:pointer;margin:4px;display:inline-block" onclick="selectError(this,'${item.sentence}','${item.correct}')">${w}</span>`).join('')}
    </div>
    <p class="text-sm text-muted mt-8">Nhấn vào phần bạn cho là sai</p>
    <div id="error-feedback" class="mt-12"></div>`;
}

window.selectError = function(el, original, correct) {
  if (exState.answered) return;
  const item = exState.pool[exState.idx];
  
  // Highlight the selected word
  document.querySelectorAll('#ex-body .word-chip').forEach(c => c.style.borderColor = '');
  el.style.borderColor = 'var(--red)';
  
  // Show the correct sentence and ask user to type it
  document.getElementById('error-feedback').innerHTML = `
    <div class="mt-8">
      <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Câu sai: <span class="chinese" style="color:var(--red);font-size:18px">${original}</span></p>
      <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Hãy nhập lại câu đúng:</p>
      <textarea id="error-input" class="transcript-input" placeholder="Nhập câu đúng..." style="min-height:60px;margin-bottom:12px"></textarea>
      <button class="btn btn-primary" onclick="checkErrorAnswer('${correct}')">Kiểm tra</button>
    </div>
    <div class="text-sm text-muted mt-8" style="padding:12px;background:rgba(52,152,219,0.1);border-left:3px solid var(--blue);border-radius:4px">
      <strong>Giải thích:</strong> ${item.explanation}
    </div>`;
};

window.checkErrorAnswer = function(correctAnswer) {
  if (exState.answered) return;
  
  const userInput = document.getElementById('error-input').value.trim();
  const item = exState.pool[exState.idx];
  
  // Normalize both strings for comparison (remove spaces)
  const userNormalized = userInput.replace(/\s+/g, '');
  const correctNormalized = correctAnswer.replace(/\s+/g, '');
  
  if (userNormalized === correctNormalized) {
    // Correct answer
    exState.answered = true;
    exState.total++;
    exState.score++;
    State.addXP(10);
    State.logResult(exState.type, true);
    
    showFeedback(true, `✅ Chính xác!<br><strong>Câu đúng:</strong> ${correctAnswer}<br><strong>Giải thích:</strong> ${item.explanation}`);
  } else {
    // Wrong answer
    toast('❌ Câu bạn nhập không đúng. Hãy thử lại!', 'error');
    document.getElementById('error-input').focus();
  }
};

function renderPosition(body, item) {
  body.innerHTML = `
    <p style="font-size:13px;color:var(--text-3);margin-bottom:8px">Đặt từ vào đúng vị trí</p>
    <p class="mb-16">Đặt từ <span class="chinese" style="color:var(--gold);font-size:20px;font-weight:700">${item.word}</span> vào đúng chỗ trong câu:</p>
    <div class="exercise-choices">
      ${item.sentence.map((seg, i) => `
        <button class="choice-btn" onclick="checkPosition(${i},${item.correct},'${item.meaning}')">
          ${i === 0 ? '' : item.sentence.slice(0,i).join('')} <span style="color:var(--gold);font-weight:700">[${item.word}]</span> ${item.sentence.slice(i).join('')}
        </button>`).join('')}
    </div>`;
}

function checkPosition(chosen, correct, meaning) {
  if (exState.answered) return;
  document.querySelectorAll('.choice-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === correct) b.classList.add('correct');
    if (i === chosen && i !== correct) b.classList.add('wrong');
  });
  
  const isCorrect = chosen === correct;
  if (isCorrect) {
    exState.answered = true;
    exState.total++;
    exState.score++;
    State.addXP(10);
    State.logResult(exState.type, true);
    showFeedback(true, `Bạn đặt đúng vị trí!<br><strong>Giải thích:</strong> ${meaning}`);
  } else {
    exState.answered = true;
    exState.total++;
    State.logResult(exState.type, false);
    document.getElementById('ex-body').insertAdjacentHTML('beforeend', `<p class="text-sm text-muted mt-12">${meaning}</p>`);
    showFeedback(false, `Vị trí đúng là: ${meaning}`);
  }
  // ← KHÔNG tự động chuyển sang câu hỏi tiếp theo
}

// ===== AI EXERCISE GENERATOR =====
async function generateExercisesWithAI(chapterId) {
  const ch = State.chapters.find(c => c.id === chapterId);
  if (!ch || !ch.rawText) { toast('Không có dữ liệu bài học để tạo bài tập.', 'error'); return; }
  
  const geminiKey = localStorage.getItem('gemini-api-key');
  if (!geminiKey) { toast('Cần Gemini API Key để dùng tính năng này', 'error'); return; }
  
  // Ask user for number of questions
  const numQuestions = prompt('Số lượng câu hỏi muốn tạo? (5-30)', '15');
  if (!numQuestions || isNaN(numQuestions)) return;
  
  const count = Math.min(30, Math.max(5, parseInt(numQuestions)));
  
  closeModal('modal-chapter');
  toast(`🤖 AI đang biên soạn ${count} câu hỏi từ nội dung sách...`, 'info');
  
  try {
    const prompt = `Bạn là giáo viên tiếng Trung chuyên biên soạn đề thi. Hãy tạo ${count} câu hỏi đa dạng từ nội dung bài học dưới đây, sát với cấu trúc đề thi thực tế (HSK, TOEFL Chinese, hoặc đề thi đại học).

HƯỚNG DẪN BIÊN SOẠN:
1. Trắc nghiệm (mc): Kiểm tra từ vựng, ngữ pháp, hiểu bài. Các phương án nhiễu phải hợp lý.
2. Điền từ (complete): Kiểm tra ngữ pháp, cấu trúc câu. Từ cần điền phải quan trọng.
3. Sắp xếp câu (rearrange): Kiểm tra cấu trúc câu, thứ tự từ. Câu phải có ý nghĩa.
4. Dịch (translate): Kiểm tra hiểu bài và dịch chính xác. Câu phải từ bài học.
5. Tìm lỗi (error): Kiểm tra ngữ pháp. Lỗi phải tinh tế, không quá hiển nhiên.

PHÂN BỐ CÂU HỎI:
- 40% Trắc nghiệm (mc)
- 25% Điền từ (complete)
- 15% Sắp xếp câu (rearrange)
- 15% Dịch (translate)
- 5% Tìm lỗi (error)

Trả về JSON hợp lệ DUY NHẤT (mảng đối tượng), không giải thích thêm:

[
  {
    "type": "mc",
    "q": "Câu hỏi bằng tiếng Việt",
    "choices": ["Phương án A", "Phương án B", "Phương án C", "Phương án D"],
    "answer": 0,
    "explanation": "Giải thích tại sao đáp án này đúng"
  },
  {
    "type": "complete",
    "question": "Câu có chỗ trống: 我___去北京。",
    "choices": ["A. 想", "B. 能", "C. 会", "D. 要"],
    "answer": "想",
    "grammar": "Tên điểm ngữ pháp",
    "explanation": "Giải thích"
  },
  {
    "type": "rearrange",
    "words": ["我", "喜欢", "看", "电影"],
    "answer": "我喜欢看电影。",
    "meaning": "Tôi thích xem phim.",
    "explanation": "Cấu trúc: Chủ ngữ + Động từ + Tân ngữ"
  },
  {
    "type": "translate",
    "vi": "Tôi muốn học tiếng Trung.",
    "answer": "我想学中文。",
    "hint": "想, 学, 中文",
    "explanation": "Cách dịch chính xác"
  },
  {
    "type": "error",
    "sentence": "他去了北京昨天。",
    "error": "昨天",
    "correction": "他昨天去了北京。",
    "explanation": "Trạng từ chỉ thời gian phải đứng trước động từ"
  }
]

NỘI DUNG BÀI HỌC:
${ch.rawText.slice(0, 8000)}`;
    
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4000 }
      })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }
    
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Extract JSON if wrapped in text
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) text = jsonMatch[0];
    
    const aiPool = JSON.parse(text);
    
    if (!aiPool || aiPool.length === 0) throw new Error('AI không tạo được câu hỏi');
    
    // Save exercise set for progress tracking
    const exerciseSet = {
      id: uid(),
      chapterId: chapterId,
      chapterTitle: ch.title,
      createdAt: Date.now(),
      questionCount: aiPool.length,
      questions: aiPool,
      attempts: [] // Will store attempt history
    };
    
    // Store in State
    if (!State.exerciseSets) State.exerciseSets = [];
    State.exerciseSets.push(exerciseSet);
    State.save();
    
    // Start exercise with AI pool
    navigate('exercises');
    exState = { 
      type: 'ai', 
      idx: 0, 
      score: 0, 
      total: 0, 
      pool: aiPool, 
      answered: false,
      exerciseSetId: exerciseSet.id,
      startTime: Date.now()
    };
    document.getElementById('ex-type-select').style.display = 'none';
    document.getElementById('ex-session').style.display = 'block';
    document.getElementById('ex-result').style.display = 'none';
    showExercise();
    
    toast(`✅ Đã tạo ${aiPool.length} câu hỏi từ bài học!`, 'success');
    
  } catch (e) {
    toast('Lỗi AI: ' + e.message, 'error');
  }
}
function typeLabel(type) {
  const labels = {
    'mc': 'Trắc nghiệm',
    'translate': 'Dịch thuật',
    'complete': 'Hoàn thành câu',
    'rearrange': 'Sắp xếp câu',
    'error': 'Tìm lỗi sai',
    'position': 'Vị trí từ',
    'ai': '🎁 Luyện tập AI',
    'comprehensive': '📚 Bài Tập Tổng Hợp'
  };
  return labels[type] || 'Luyện tập';
}

// ===== COMPREHENSIVE EXERCISES (NO API NEEDED) =====

let selectedChaptersForComprehensive = [];
let selectedBooksForComprehensive = [];

function openComprehensiveExerciseModal() {
  if (State.chapters.length === 0) {
    toast('Không có chương nào để tạo bài tập', 'error');
    return;
  }
  
  // Start with all chapters selected
  selectedChaptersForComprehensive = State.chapters.map(c => c.id);
  openModal('modal-comprehensive-settings');
}

function openSelectBooksModal() {
  if (!State.books || State.books.length === 0) {
    toast('Không có giáo trình nào để chọn', 'error');
    return;
  }
  if (!State.chapters || State.chapters.length === 0) {
    toast('Không có chương nào để tạo bài tập', 'error');
    return;
  }

  // Render books list
  const list = document.getElementById('books-list');
  if (!list) {
    toast('Không tìm thấy UI chọn giáo trình', 'error');
    return;
  }

  // Default: select all books
  selectedBooksForComprehensive = State.books.map(b => b.id);

  list.innerHTML = State.books.map(book => {
    const bookChapters = State.chapters.filter(ch => ch.bookId === book.id);
    const bookCards = State.cards.filter(c => bookChapters.find(ch => ch.id === c.chapterId));
    return `
      <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-2);border-radius:6px;cursor:pointer;border:1px solid var(--border)">
        <input type="checkbox" class="book-checkbox" value="${book.id}" checked style="width:18px;height:18px;cursor:pointer">
        <div style="flex:1">
          <div style="font-weight:600">${book.title}</div>
          <div style="font-size:12px;color:var(--text-3)">${bookChapters.length} chương · ${bookCards.length} từ vựng</div>
        </div>
      </label>
    `;
  }).join('');

  // Add change listeners
  document.querySelectorAll('.book-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      const id = e.target.value;
      if (e.target.checked) {
        if (!selectedBooksForComprehensive.includes(id)) selectedBooksForComprehensive.push(id);
      } else {
        selectedBooksForComprehensive = selectedBooksForComprehensive.filter(x => x !== id);
      }
    });
  });

  openModal('modal-select-books');
}

function openSelectChaptersModal() {
  if (State.chapters.length === 0) {
    toast('Không có chương nào để tạo bài tập', 'error');
    return;
  }
  
  // Render chapters list
  const list = document.getElementById('chapters-list');
  list.innerHTML = State.chapters.map(ch => `
    <label style="display:flex;align-items:center;gap:12px;padding:12px;background:var(--bg-2);border-radius:6px;cursor:pointer;border:1px solid var(--border)">
      <input type="checkbox" class="chapter-checkbox" value="${ch.id}" checked style="width:18px;height:18px;cursor:pointer">
      <div style="flex:1">
        <div style="font-weight:600">${ch.title}</div>
        <div style="font-size:12px;color:var(--text-3)">${State.cards.filter(c => c.chapterId === ch.id).length} từ vựng</div>
      </div>
    </label>
  `).join('');
  
  selectedChaptersForComprehensive = State.chapters.map(c => c.id);
  
  // Add change listeners
  document.querySelectorAll('.chapter-checkbox').forEach(cb => {
    cb.addEventListener('change', (e) => {
      if (e.target.checked) {
        if (!selectedChaptersForComprehensive.includes(e.target.value)) {
          selectedChaptersForComprehensive.push(e.target.value);
        }
      } else {
        selectedChaptersForComprehensive = selectedChaptersForComprehensive.filter(id => id !== e.target.value);
      }
    });
  });
  
  openModal('modal-select-chapters');
}

function startComprehensiveExercise() {
  if (selectedChaptersForComprehensive.length === 0) {
    toast('Vui lòng chọn ít nhất một chương', 'error');
    return;
  }
  
  closeModal('modal-select-chapters');
  openModal('modal-comprehensive-settings');
}

function startComprehensiveExerciseFromBooks() {
  if (!selectedBooksForComprehensive || selectedBooksForComprehensive.length === 0) {
    toast('Vui lòng chọn ít nhất một giáo trình', 'error');
    return;
  }

  // Map books → chapters
  const chapterIds = State.chapters
    .filter(ch => selectedBooksForComprehensive.includes(ch.bookId))
    .map(ch => ch.id);

  if (chapterIds.length === 0) {
    toast('Không có chương nào trong các giáo trình đã chọn', 'error');
    return;
  }

  selectedChaptersForComprehensive = chapterIds;
  closeModal('modal-select-books');
  openModal('modal-comprehensive-settings');
}

// Generate comprehensive exercises from vocabulary (no API needed)
function generateComprehensiveExercises(selectedChapters, count, selectedTypes) {
  const exercises = [];
  
  // Get all vocabulary from selected chapters
  const vocabPool = State.cards.filter(card => 
    selectedChapters.some(ch => ch.id === card.chapterId)
  );
  
  if (vocabPool.length === 0) {
    throw new Error('Không có từ vựng để tạo bài tập');
  }
  
  // Shuffle vocabulary
  const shuffled = [...vocabPool].sort(() => Math.random() - 0.5);
  
  let typeIndex = 0;
  
  for (let i = 0; i < count && i < shuffled.length * 2; i++) {
    const typeList = selectedTypes.length > 0 ? selectedTypes : ['mc', 'complete', 'translate'];
    const currentType = typeList[typeIndex % typeList.length];
    typeIndex++;
    
    const vocab = shuffled[i % shuffled.length];
    
    try {
      let exercise = null;
      
      switch (currentType) {
        case 'mc':
          exercise = generateMCExercise(vocab, vocabPool);
          break;
        case 'complete':
          exercise = generateCompleteExercise(vocab);
          break;
        case 'translate':
          exercise = generateTranslateExercise(vocab);
          break;
        case 'rearrange':
          exercise = generateRearrangeExercise(vocab);
          break;
        case 'error':
          exercise = generateErrorExercise(vocab);
          break;
      }
      
      if (exercise) {
        exercises.push(exercise);
      }
    } catch (e) {
      console.log('Lỗi tạo bài tập:', e);
    }
  }
  
  return exercises.slice(0, count);
}

// Generate multiple choice exercise
function generateMCExercise(vocab, vocabPool) {
  const choices = [vocab.vietnamese];
  
  // Add 3 random wrong answers
  const wrongAnswers = vocabPool
    .filter(v => v.id !== vocab.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map(v => v.vietnamese);
  
  choices.push(...wrongAnswers);
  choices.sort(() => Math.random() - 0.5);
  
  return {
    type: 'mc',
    q: `"${vocab.chinese}" có nghĩa là gì?`,
    choices: choices,
    answer: choices.indexOf(vocab.vietnamese),
    explanation: `${vocab.chinese} = ${vocab.vietnamese}${vocab.example ? '. Ví dụ: ' + vocab.example : ''}`
  };
}

// Generate fill-in-the-blank exercise with grammar patterns
function generateCompleteExercise(vocab) {
  // Grammar patterns for fill-in-the-blank exercises
  const patterns = [
    // Pattern 1: Simple sentence with verb
    {
      template: (word) => `我___${word}。`,
      choices: ['喜欢', '学习', '有', '看'],
      answer: '喜欢',
      grammar: '动词 (Động từ)',
      indirectHints: [
        '这个词表示一种感情或态度',
        '你对某个东西有这种感觉时会用这个词',
        '这个词的反义词是"讨厌"'
      ]
    },
    // Pattern 2: Adjective with 很
    {
      template: (word) => `这个${word}很___。`,
      choices: ['好', '大', '小', '新'],
      answer: '好',
      grammar: '形容词 (Tính từ)',
      indirectHints: [
        '这是一个正面的评价',
        '这个词的反义词是"坏"',
        '当你对某样东西满意时会用这个词'
      ]
    },
    // Pattern 3: Time expression
    {
      template: (word) => `我___学习${word}。`,
      choices: ['每天', '昨天', '明天', '现在'],
      answer: '每天',
      grammar: '时间表达 (Biểu thức thời gian)',
      indirectHints: [
        '这个词表示重复发生的时间',
        '这个词由两个字组成，第一个字是"每"',
        '你每周都做某件事时会用这个词'
      ]
    },
    // Pattern 4: Negation
    {
      template: (word) => `我___喜欢${word}。`,
      choices: ['不', '没有', '没', '不是'],
      answer: '不',
      grammar: '否定词 (Từ phủ định)',
      indirectHints: [
        '这是最常见的否定词',
        '这个词只有一个字',
        '用来否定现在或一般情况'
      ]
    },
    // Pattern 5: Aspect marker
    {
      template: (word) => `我学___${word}。`,
      choices: ['了', '过', '着', '来'],
      answer: '了',
      grammar: '体标记 (Dấu hiệu thể)',
      indirectHints: [
        '这个符号表示动作已经完成',
        '这是一个标点符号的形状',
        '用来表示过去发生的事情'
      ]
    },
    // Pattern 6: Preposition
    {
      template: (word) => `我___学校学${word}。`,
      choices: ['在', '到', '从', '向'],
      answer: '在',
      grammar: '介词 (Giới từ)',
      indirectHints: [
        '这个词表示位置或地点',
        '这个词的反义词是"离"',
        '当你说在某个地方做某事时会用这个词'
      ]
    },
    // Pattern 7: Measure word
    {
      template: (word) => `我有一___${word}。`,
      choices: ['个', '本', '支', '只'],
      answer: '个',
      grammar: '量词 (Từ đo lường)',
      indirectHints: [
        '这是最常见的量词',
        '这个词用来计数大多数物品',
        '这个词是一个方形的字'
      ]
    },
    // Pattern 8: Conjunction
    {
      template: (word) => `我喜欢${word}___我也喜欢看书。`,
      choices: ['和', '但是', '或者', '因为'],
      answer: '和',
      grammar: '连词 (Liên từ)',
      indirectHints: [
        '这个词用来连接两个相似的想法',
        '这个词表示"加上"或"还有"',
        '这个词只有一个字'
      ]
    }
  ];
  
  // Select a random pattern
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  
  return {
    type: 'complete',
    question: pattern.template(vocab.chinese),
    choices: pattern.choices,
    answer: pattern.answer,
    grammar: pattern.grammar,
    indirectHints: pattern.indirectHints,
    explanation: `Từ cần điền là: ${pattern.answer}\n\nNgữ pháp: ${pattern.grammar}`
  };
}

// Generate translation exercise
function generateTranslateExercise(vocab) {
  const indirectHints = [
    `Từ khóa chính: ${vocab.pinyin || vocab.chinese}`,
    `Hãy suy nghĩ về cấu trúc câu tiếng Trung`,
    `Cấu trúc thường là: Chủ ngữ + Động từ + Tân ngữ`
  ];
  
  return {
    type: 'translate',
    vi: `Dịch sang tiếng Trung: "${vocab.vietnamese}"`,
    hint: vocab.pinyin || vocab.chinese,
    indirectHints: indirectHints,
    answer: vocab.chinese,
    explanation: `${vocab.vietnamese} = ${vocab.chinese}${vocab.pinyin ? ' (' + vocab.pinyin + ')' : ''}`
  };
}

// Generate rearrange exercise with proper grammar patterns
function generateRearrangeExercise(vocab) {
  // Chinese grammar patterns for rearrange exercises
  // Based on HSK and real Chinese textbooks
  
  const patterns = [
    // Pattern 1: Subject + Verb + Object (SVO)
    {
      template: (word) => [word, '很', '好'],
      sentence: (word) => `${word}很好。`,
      grammar: 'Chủ ngữ + 很 + Tính từ (Cấu trúc mô tả)',
      meaning: (word) => `${word} rất tốt.`
    },
    // Pattern 2: Subject + Verb + Object
    {
      template: (word) => ['我', '喜欢', word],
      sentence: (word) => `我喜欢${word}。`,
      grammar: '我 + 喜欢 + Tân ngữ (Cấu trúc thích)',
      meaning: (word) => `Tôi thích ${word}.`
    },
    // Pattern 3: Subject + 是 + Object
    {
      template: (word) => ['这是', word],
      sentence: (word) => `这是${word}。`,
      grammar: '这是 + Danh từ (Cấu trúc xác định)',
      meaning: (word) => `Đây là ${word}.`
    },
    // Pattern 4: Subject + Verb + 了 + Object
    {
      template: (word) => ['我', '学', word, '了'],
      sentence: (word) => `我学${word}了。`,
      grammar: 'Chủ ngữ + Động từ + Tân ngữ + 了 (Cấu trúc hoàn thành)',
      meaning: (word) => `Tôi đã học ${word}.`
    },
    // Pattern 5: Subject + 在 + Location + Verb + Object
    {
      template: (word) => ['我', '在', '学校', '学', word],
      sentence: (word) => `我在学校学${word}。`,
      grammar: 'Chủ ngữ + 在 + Địa điểm + Động từ + Tân ngữ',
      meaning: (word) => `Tôi học ${word} ở trường.`
    },
    // Pattern 6: Subject + 有 + Object
    {
      template: (word) => ['我', '有', word],
      sentence: (word) => `我有${word}。`,
      grammar: 'Chủ ngữ + 有 + Tân ngữ (Cấu trúc sở hữu)',
      meaning: (word) => `Tôi có ${word}.`
    },
    // Pattern 7: Subject + Verb + 得 + Adjective
    {
      template: (word) => ['这个', word, '很', '好'],
      sentence: (word) => `这个${word}很好。`,
      grammar: '这个 + Danh từ + 很 + Tính từ',
      meaning: (word) => `Cái ${word} này rất tốt.`
    },
    // Pattern 8: Subject + 不 + Verb + Object
    {
      template: (word) => ['我', '不', '喜欢', word],
      sentence: (word) => `我不喜欢${word}。`,
      grammar: 'Chủ ngữ + 不 + Động từ + Tân ngữ (Phủ định)',
      meaning: (word) => `Tôi không thích ${word}.`
    }
  ];
  
  // Select a random pattern
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];
  const words = pattern.template(vocab.chinese);
  
  // Shuffle words for the exercise
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  
  return {
    type: 'rearrange',
    words: shuffled,
    meaning: pattern.meaning(vocab.vietnamese),
    answer: words.join(''),
    grammar: pattern.grammar,
    explanation: `Câu đúng: ${pattern.sentence(vocab.chinese)}\n\nNgữ pháp: ${pattern.grammar}\n\nNghĩa: ${pattern.meaning(vocab.vietnamese)}`
  };
}

// Generate error-finding exercise with real grammar mistakes
function generateErrorExercise(vocab) {
  // Real Chinese grammar error patterns
  const errorPatterns = [
    // Error 1: Wrong word order (Trạng từ chỉ thời gian phải đứng trước động từ)
    {
      error: `他去了北京昨天。`,
      correct: `他昨天去了北京。`,
      explanation: `Lỗi: Trạng từ chỉ thời gian (昨天) phải đứng trước động từ (去), không phải sau.\nCấu trúc đúng: Chủ ngữ + Trạng từ chỉ thời gian + Động từ + Tân ngữ`
    },
    // Error 2: Missing 了 for completed action
    {
      error: `我吃饭了，现在我去学校。`,
      correct: `我吃了饭，现在我去学校。`,
      explanation: `Lỗi: 了 phải đứng ngay sau động từ, không phải sau tân ngữ.\nCấu trúc đúng: Động từ + 了 + Tân ngữ`
    },
    // Error 3: Wrong use of 是
    {
      error: `我是喜欢看电影。`,
      correct: `我喜欢看电影。`,
      explanation: `Lỗi: Không dùng 是 trước động từ thích (喜欢).\n是 chỉ dùng để xác định danh từ, không dùng trước động từ.`
    },
    // Error 4: Wrong negation
    {
      error: `我没有去学校昨天。`,
      correct: `我昨天没有去学校。`,
      explanation: `Lỗi: Trạng từ chỉ thời gian phải đứng trước phủ định (没有).\nCấu trúc đúng: Chủ ngữ + Trạng từ chỉ thời gian + 没有 + Động từ + Tân ngữ`
    },
    // Error 5: Wrong measure word
    {
      error: `我有三个书。`,
      correct: `我有三本书。`,
      explanation: `Lỗi: Từ đo lường (量词) sai. 书 (sách) dùng 本, không dùng 个.\nCấu trúc đúng: Số từ + Từ đo lường + Danh từ`
    },
    // Error 6: Missing object marker 把
    {
      error: `我看了这个电影。`,
      correct: `我把这个电影看了。`,
      explanation: `Lỗi: Khi nhấn mạnh tác động lên tân ngữ, dùng 把.\nCấu trúc đúng: Chủ ngữ + 把 + Tân ngữ + Động từ + 了`
    },
    // Error 7: Wrong use of 很
    {
      error: `这个学生很学习。`,
      correct: `这个学生很认真。`,
      explanation: `Lỗi: 很 dùng trước tính từ, không dùng trước động từ.\nCấu trúc đúng: 很 + Tính từ`
    },
    // Error 8: Wrong aspect marker
    {
      error: `我在吃了饭。`,
      correct: `我在吃饭。`,
      explanation: `Lỗi: Khi dùng 在 (đang), không dùng 了.\n在 + Động từ (hành động đang diễn ra)`
    }
  ];
  
  // Select a random error pattern
  const pattern = errorPatterns[Math.floor(Math.random() * errorPatterns.length)];
  
  return {
    type: 'error',
    sentence: pattern.error,
    correct: pattern.correct,
    explanation: pattern.explanation
  };
}

async function startComprehensiveExerciseWithSettings() {
  if (selectedChaptersForComprehensive.length === 0) {
    toast('Vui lòng chọn ít nhất một chương', 'error');
    return;
  }
  
  const count = parseInt(document.getElementById('comp-questions-count').value) || 15;
  const selectedTypes = [];
  if (document.getElementById('comp-type-mc').checked) selectedTypes.push('mc');
  if (document.getElementById('comp-type-complete').checked) selectedTypes.push('complete');
  if (document.getElementById('comp-type-translate').checked) selectedTypes.push('translate');
  if (document.getElementById('comp-type-rearrange').checked) selectedTypes.push('rearrange');
  if (document.getElementById('comp-type-error').checked) selectedTypes.push('error');
  
  if (selectedTypes.length === 0) {
    toast('Vui lòng chọn ít nhất một loại bài tập', 'error');
    return;
  }
  
  closeModal('modal-comprehensive-settings');
  
  // Get selected chapters
  const selectedChapters = State.chapters.filter(ch => selectedChaptersForComprehensive.includes(ch.id));
  
  toast(`📚 Đang tạo ${count} câu hỏi từ ${selectedChapters.length} chương...`, 'info');
  
  try {
    // Generate exercises locally (no API needed)
    const exercisePool = generateComprehensiveExercises(selectedChapters, count, selectedTypes);
    
    if (!exercisePool || exercisePool.length === 0) {
      throw new Error('Không thể tạo bài tập từ dữ liệu hiện có');
    }
    
    // Start exercise
    navigate('mini-tests');
    exState = { 
      type: 'comprehensive', 
      idx: 0, 
      score: 0, 
      total: 0, 
      pool: exercisePool, 
      answered: false,
      chapters: selectedChapters.map(ch => ch.title).join(', '),
      startTime: Date.now(),
      isInfinite: true
    };
    document.getElementById('ex-type-select').style.display = 'none';
    document.getElementById('ex-session').style.display = 'block';
    document.getElementById('ex-result').style.display = 'none';
    showExercise();
    
    toast(`✅ Đã tạo ${exercisePool.length} câu hỏi từ ${selectedChapters.length} chương!`, 'success');
    
  } catch (e) {
    toast('Lỗi: ' + e.message, 'error');
  }
}
