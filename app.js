/* ==========================================================
 * 520 宠物来信 H5 —— 入口脚本
 *
 * 关键职责：
 *   1. 加载 poster_config.json，把坐标/默认值同步到 DOM
 *   2. 把 1080x1920 的 .poster 等比缩放到屏幕宽度
 *   3. 把输入框的内容实时写回海报层
 *   4. 点击"保存"，用 html2canvas 按 1080x1920 原生尺寸导出 PNG
 * ========================================================== */

(function () {
  'use strict';

  // ---------------------------------------------------------
  // DOM 引用
  // ---------------------------------------------------------
  const $stage = document.getElementById('stage');
  const $poster = document.getElementById('poster');

  const $petPhoto = document.getElementById('pet-photo');
  const $textPetname = document.getElementById('text-petname');
  const $textTag = document.getElementById('text-tag');
  const $textLetter = document.getElementById('text-letter');
  const $qrImg = document.getElementById('qr-img');

  const $inputPetname = document.getElementById('input-petname');
  const $inputTag = document.getElementById('input-tag');
  const $inputLetter = document.getElementById('input-letter');
  const $inputPhoto = document.getElementById('input-photo');
  const $inputQr = document.getElementById('input-qr');
  const $btnSave = document.getElementById('btn-save');

  const CANVAS_W = 1080;
  const CANVAS_H = 1920;

  // ---------------------------------------------------------
  // 1. 缩放适配：把 1080x1920 等比缩放到屏幕宽
  // ---------------------------------------------------------
  function fitPosterToScreen() {
    const screenW = Math.min(window.innerWidth, 520); // 最大预览宽度
    const scale = screenW / CANVAS_W;

    $poster.style.transform = `scale(${scale})`;
    // stage 的高度 = 缩放后的海报高度，这样后面内容能紧贴海报
    $stage.style.height = `${CANVAS_H * scale}px`;
    // stage 的宽度 = 缩放后的海报宽度，保持居中
    $stage.style.width = `${CANVAS_W * scale}px`;
    $stage.style.margin = '0 auto';
  }

  window.addEventListener('resize', fitPosterToScreen);
  window.addEventListener('orientationchange', fitPosterToScreen);

  // ---------------------------------------------------------
  // 2. 文本绑定
  // ---------------------------------------------------------
  function setPetName(text) {
    $textPetname.textContent = text || '';
  }

  function setTag(text) {
    $textTag.textContent = text || '';
  }

  function setLetter(text) {
    // 多行：用 span 包一层保证 align-items:flex-start 下的水平居中
    $textLetter.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = text || '';
    $textLetter.appendChild(span);
  }

  function setPetPhoto(src) {
    if (!src) return;
    $petPhoto.src = src;
  }

  function setQrCode(src) {
    if (!src) return;
    $qrImg.src = src;
  }

  // ---------------------------------------------------------
  // 3. 输入 -> 海报 实时同步
  // ---------------------------------------------------------
  $inputPetname.addEventListener('input', (e) => setPetName(e.target.value));
  $inputTag.addEventListener('input', (e) => setTag(e.target.value));
  $inputLetter.addEventListener('input', (e) => setLetter(e.target.value));

  $inputPhoto.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPetPhoto(ev.target.result);
    reader.readAsDataURL(file);
  });

  $inputQr.addEventListener('change', (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setQrCode(ev.target.result);
    reader.readAsDataURL(file);
  });

  // ---------------------------------------------------------
  // 4. 保存海报（导出 1080x1920 PNG）
  // ---------------------------------------------------------
  async function exportPoster() {
    if (typeof html2canvas === 'undefined') {
      alert('导出依赖未加载，请检查网络后重试');
      return;
    }

    $btnSave.disabled = true;
    const originalText = $btnSave.textContent;
    $btnSave.textContent = '生成中...';

    // 导出前：临时把 .poster 的 scale 还原为 1，确保 html2canvas 按原生
    // 1080x1920 截图；截完再恢复。
    const prevTransform = $poster.style.transform;
    $poster.style.transform = 'scale(1)';

    try {
      const canvas = await html2canvas($poster, {
        width: CANVAS_W,
        height: CANVAS_H,
        scale: 1,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');

      // 下载 / 长按保存
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `pet-letter-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('生成失败，请稍后再试');
    } finally {
      $poster.style.transform = prevTransform;
      $btnSave.disabled = false;
      $btnSave.textContent = originalText;
    }
  }

  $btnSave.addEventListener('click', exportPoster);

  // ---------------------------------------------------------
  // 5. 启动：加载配置并填充默认值
  // ---------------------------------------------------------
  async function bootstrap() {
    fitPosterToScreen();

    let cfg = null;
    try {
      const resp = await fetch('poster_config.json', { cache: 'no-cache' });
      cfg = await resp.json();
    } catch (e) {
      console.warn('poster_config.json 加载失败，使用内置默认值', e);
      cfg = {
        defaults: {
          petName: '小可爱',
          tag: '#今天也想和你贴贴#',
          letter: '谢谢你愿意做我的家人\n有你的每一天 都是我最想留住的日子\n520 一起慢慢变老吧',
          petPhoto: '',
          qrCode: '',
        },
      };
    }

    const d = (cfg && cfg.defaults) || {};

    // 回填表单
    $inputPetname.value = d.petName || '';
    $inputTag.value = d.tag || '';
    $inputLetter.value = d.letter || '';

    // 回填海报
    setPetName(d.petName);
    setTag(d.tag);
    setLetter(d.letter);
    if (d.petPhoto) setPetPhoto(d.petPhoto);
    if (d.qrCode) setQrCode(d.qrCode);

    // 再次适配（等背景图加载完，布局稳定）
    requestAnimationFrame(fitPosterToScreen);
  }

  bootstrap();
})();
