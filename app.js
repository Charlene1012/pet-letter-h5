/* ==========================================================
 * 520 宠物来信 H5 —— 完整活动流程
 * 上传页 → 事件选择页 → 告白信生成页
 * ========================================================== */

(function () {
  'use strict';

  // ==========================================================
  // State
  // ==========================================================
  const state = {
    photo: null,        // base64
    petName: '',
    petType: 'cat',
    tags: [],           // max 2
    events: [],         // max 3
    letterText: '',
  };

  // ==========================================================
  // DOM refs
  // ==========================================================
  const pages = {
    upload: document.getElementById('page-upload'),
    events: document.getElementById('page-events'),
    result: document.getElementById('page-result'),
  };

  // Page 1
  const $uploadArea = document.getElementById('upload-area');
  const $uploadPlaceholder = document.getElementById('upload-placeholder');
  const $photoEditor = document.getElementById('photo-editor');
  const $photoPreview = document.getElementById('photo-preview');
  const $photoCropContainer = document.getElementById('photo-crop-container');
  const $inputPhoto = document.getElementById('input-photo');
  const $btnReupload = document.getElementById('btn-reupload');
  const $zoomSlider = document.getElementById('zoom-slider');
  const $btnZoomIn = document.getElementById('btn-zoom-in');
  const $btnZoomOut = document.getElementById('btn-zoom-out');
  const $inputPetname = document.getElementById('input-petname');
  const $typeSelector = document.getElementById('type-selector');
  const $tagSelector = document.getElementById('tag-selector');
  const $btnNext1 = document.getElementById('btn-next-1');

  // Page 2
  const $eventsGrid = document.getElementById('events-grid');
  const $btnBack2 = document.getElementById('btn-back-2');
  const $btnNext2 = document.getElementById('btn-next-2');

  // Page 3
  const $posterStage = document.getElementById('poster-stage');
  const $poster = document.getElementById('poster');
  const $resultPhoto = document.getElementById('result-photo');
  const $resultPetname = document.getElementById('result-petname');
  const $resultTag = document.getElementById('result-tag');
  const $resultLetter = document.getElementById('result-letter');
  const $btnSave = document.getElementById('btn-save');
  const $btnRegenerate = document.getElementById('btn-regenerate');
  const $btnBack3 = document.getElementById('btn-back-3');

  // ==========================================================
  // Page Navigation
  // ==========================================================
  let currentPage = 'upload';

  function goToPage(name) {
    const prev = pages[currentPage];
    const next = pages[name];
    if (prev === next) return;

    prev.classList.remove('active');
    prev.classList.add('exit-left');

    next.classList.add('active');

    setTimeout(() => prev.classList.remove('exit-left'), 400);
    currentPage = name;

    window.scrollTo(0, 0);

    if (name === 'result') renderPoster();
  }

  // ==========================================================
  // Page 1: Upload & Edit
  // ==========================================================
  let photoScale = 1;
  let photoX = 0, photoY = 0;
  let isDragging = false, dragStartX = 0, dragStartY = 0, startPX = 0, startPY = 0;

  // Click to upload
  $uploadArea.addEventListener('click', (e) => {
    if (e.target.closest('.btn-reupload') || e.target.closest('.editor-controls')) return;
    if ($photoEditor.classList.contains('hidden')) {
      $inputPhoto.click();
    }
  });

  $btnReupload.addEventListener('click', (e) => {
    e.stopPropagation();
    $inputPhoto.click();
  });

  $inputPhoto.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      state.photo = ev.target.result;
      $photoPreview.src = state.photo;
      $uploadPlaceholder.classList.add('hidden');
      $photoEditor.classList.remove('hidden');
      photoScale = 1; photoX = 0; photoY = 0;
      $zoomSlider.value = 100;
      updatePhotoTransform();
      validatePage1();
    };
    reader.readAsDataURL(file);
  });

  // Zoom
  $zoomSlider.addEventListener('input', (e) => {
    photoScale = parseInt(e.target.value) / 100;
    updatePhotoTransform();
  });

  $btnZoomIn.addEventListener('click', () => {
    photoScale = Math.min(3, photoScale + 0.1);
    $zoomSlider.value = Math.round(photoScale * 100);
    updatePhotoTransform();
  });

  $btnZoomOut.addEventListener('click', () => {
    photoScale = Math.max(1, photoScale - 0.1);
    $zoomSlider.value = Math.round(photoScale * 100);
    updatePhotoTransform();
  });

  // Drag
  $photoCropContainer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    startPX = photoX; startPY = photoY;
    $photoCropContainer.setPointerCapture(e.pointerId);
  });

  $photoCropContainer.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    photoX = startPX + (e.clientX - dragStartX);
    photoY = startPY + (e.clientY - dragStartY);
    updatePhotoTransform();
  });

  $photoCropContainer.addEventListener('pointerup', () => { isDragging = false; });
  $photoCropContainer.addEventListener('pointercancel', () => { isDragging = false; });

  function updatePhotoTransform() {
    $photoPreview.style.transform = `translate(${photoX}px, ${photoY}px) scale(${photoScale})`;
  }

  // Pet name
  $inputPetname.addEventListener('input', (e) => {
    state.petName = e.target.value.trim();
    validatePage1();
  });

  // Pet type
  $typeSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.type-btn');
    if (!btn) return;
    $typeSelector.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.petType = btn.dataset.type;
  });

  // Tags (max 2)
  $tagSelector.addEventListener('click', (e) => {
    const btn = e.target.closest('.tag-btn');
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (btn.classList.contains('active')) {
      btn.classList.remove('active');
      state.tags = state.tags.filter(t => t !== tag);
    } else {
      if (state.tags.length >= 2) return;
      btn.classList.add('active');
      state.tags.push(tag);
    }
  });

  function validatePage1() {
    $btnNext1.disabled = !(state.photo && state.petName);
  }

  $btnNext1.addEventListener('click', () => goToPage('events'));

  // ==========================================================
  // Page 2: Event Selection
  // ==========================================================
  $eventsGrid.addEventListener('click', (e) => {
    const card = e.target.closest('.event-card');
    if (!card) return;
    const ev = card.dataset.event;

    if (card.classList.contains('active')) {
      card.classList.remove('active');
      state.events = state.events.filter(x => x !== ev);
    } else {
      if (state.events.length >= 3) return;
      card.classList.add('active');
      state.events.push(ev);
    }
    $btnNext2.disabled = state.events.length === 0;
  });

  $btnBack2.addEventListener('click', () => goToPage('upload'));
  $btnNext2.addEventListener('click', () => goToPage('result'));

  // ==========================================================
  // Page 3: Result / Poster
  // ==========================================================

  // --- 文案生成逻辑 ---
  const LETTER_POOL = {
    nap: [
      '趴在你身边睡着的时候，是我最安心的时候。',
      '午后的阳光里，你的呼吸声是最好听的催眠曲。',
      '和你一起打盹的下午，时间都变得温柔了。',
    ],
    rub: [
      '蹭蹭你，是因为知道你需要一点温暖。',
      '我把头靠在你手上，是在说"我在呢"。',
      '每次蹭你，都是我在说我爱你。',
    ],
    wait: [
      '门锁转动的声音，是我一天中最期待的旋律。',
      '等你回来，是我最认真做的一件事。',
      '听到你的脚步声，全世界都亮了。',
    ],
    stare: [
      '我看着你的时候，心里想的全是"好喜欢你"。',
      '偷偷看你不是因为好奇，是因为舍不得移开眼。',
      '你低头看手机时，我在偷偷看你笑。',
    ],
    knead: [
      '踩奶的时候心里特别踏实，因为你在身边。',
      '软绵绵地踩着，每一下都是在说"这是我的家"。',
      '只有最信任的人面前，我才愿意踩奶。',
    ],
    purr: [
      '呼噜呼噜是我给你的情书，只有靠近才听得到。',
      '发出呼噜声的时候，是我最幸福的时刻。',
      '这是只有你能解锁的声音。',
    ],
    gift: [
      '给你带"礼物"回来，是觉得你需要我照顾。',
      '虽然你好像不太喜欢我的猎物…但那是我最好的宝贝了。',
      '我把最重要的东西给你，因为你是最重要的人。',
    ],
    comfort: [
      '你难过的时候，我就安静地陪着你。',
      '不知道怎么说话，但我会一直在你身边。',
      '如果我的陪伴能让你好一点点，我愿意永远这样。',
    ],
  };

  const LETTER_ENDING = [
    '谢谢你让我成为你的家人。',
    '520，一起慢慢变老吧。',
    '有你的每一天，都是我想留住的日子。',
    '做你的毛孩子，是最幸运的事。',
    '希望下辈子，还能遇见你。',
  ];

  function generateLetter() {
    const lines = [];
    state.events.forEach(ev => {
      const pool = LETTER_POOL[ev];
      if (pool && pool.length) {
        lines.push(pool[Math.floor(Math.random() * pool.length)]);
      }
    });
    lines.push(LETTER_ENDING[Math.floor(Math.random() * LETTER_ENDING.length)]);
    state.letterText = lines.join('\n');
    return state.letterText;
  }

  function generateTag() {
    if (state.tags.length > 0) {
      return '#' + state.tags.join(' · ') + '#';
    }
    const defaults = ['今天也想和你贴贴', '你是我的小太阳', '有你就是晴天'];
    return '#' + defaults[Math.floor(Math.random() * defaults.length)] + '#';
  }

  // --- 渲染海报 ---
  function renderPoster() {
    // Scale poster to stage
    const stageW = $posterStage.clientWidth;
    const scale = stageW / 1080;
    $poster.style.transform = `scale(${scale})`;
    $posterStage.style.height = `${1920 * scale}px`;

    // Photo
    if (state.photo) $resultPhoto.src = state.photo;

    // Name
    $resultPetname.textContent = state.petName;

    // Tag
    $resultTag.textContent = generateTag();

    // Letter
    const letter = generateLetter();
    $resultLetter.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = letter;
    $resultLetter.appendChild(span);
  }

  // Resize handler
  window.addEventListener('resize', () => {
    if (currentPage === 'result') {
      const stageW = $posterStage.clientWidth;
      const scale = stageW / 1080;
      $poster.style.transform = `scale(${scale})`;
      $posterStage.style.height = `${1920 * scale}px`;
    }
  });

  // Regenerate
  $btnRegenerate.addEventListener('click', () => {
    const letter = generateLetter();
    $resultLetter.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = letter;
    $resultLetter.appendChild(span);
    $resultTag.textContent = generateTag();
  });

  // Back to start
  $btnBack3.addEventListener('click', () => {
    // Reset events page selections
    $eventsGrid.querySelectorAll('.event-card').forEach(c => c.classList.remove('active'));
    state.events = [];
    $btnNext2.disabled = true;
    goToPage('upload');
  });

  // --- Save poster ---
  $btnSave.addEventListener('click', async () => {
    if (typeof html2canvas === 'undefined') {
      alert('导出组件加载中，请稍后重试');
      return;
    }

    $btnSave.disabled = true;
    const origText = $btnSave.textContent;
    $btnSave.textContent = '生成中…';

    const prevTransform = $poster.style.transform;
    $poster.style.transform = 'scale(1)';

    try {
      const canvas = await html2canvas($poster, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `pet-letter-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('保存失败，请稍后重试');
    } finally {
      $poster.style.transform = prevTransform;
      $btnSave.disabled = false;
      $btnSave.textContent = origText;
    }
  });

})();
