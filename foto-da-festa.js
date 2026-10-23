(() => {
  'use strict';
  const canvas = document.getElementById('photoCanvas');
  const ctx = canvas.getContext('2d');
  const shell = document.querySelector('.photo-canvas-shell');
  const cameraInput = document.getElementById('cameraInput');
  const galleryInput = document.getElementById('galleryInput');
  const zoomControl = document.getElementById('zoomControl');
  const zoomValue = document.getElementById('zoomValue');
  const adjustControls = document.getElementById('adjustControls');
  const emptyState = document.getElementById('canvasEmpty');
  const downloadButton = document.getElementById('downloadPhoto');
  const shareButton = document.getElementById('sharePhoto');
  const status = document.getElementById('photoStatus');
  const W = canvas.width, H = canvas.height;
  const photo = new Image();
  const logo = new Image();
  logo.src = 'assets/logo-oficial.webp';
  let ready = false, scale = 1, offsetX = 0, offsetY = 0, pointer = null, photoUrl = '';

  function drawCoverImage(target) {
    if (!ready) return;
    const iw = photo.naturalWidth, ih = photo.naturalHeight;
    const base = Math.max(W / iw, H / ih) * scale;
    const dw = iw * base, dh = ih * base;
    const x = (W - dw) / 2 + offsetX;
    const y = (H - dh) / 2 + offsetY;
    target.drawImage(photo, x, y, dw, dh);
  }
  function drawFrame(target) {
    const grad = target.createLinearGradient(0, 770, 0, H);
    grad.addColorStop(0, 'rgba(20,8,3,0)');
    grad.addColorStop(.25, 'rgba(24,9,3,.62)');
    grad.addColorStop(.47, 'rgba(24,9,3,.94)');
    grad.addColorStop(1, '#170803');
    target.fillStyle = grad;
    target.fillRect(0, 720, W, H - 720);

    // Acabamento de cobre e corda na borda da arte.
    target.strokeStyle = '#e3b46f'; target.lineWidth = 5;
    target.strokeRect(24, 24, W - 48, H - 48);
    target.strokeStyle = 'rgba(255,225,178,.78)'; target.lineWidth = 2;
    target.strokeRect(36, 36, W - 72, H - 72);
    target.fillStyle = '#f2c982';
    for (const x of [58, W - 58]) for (const y of [58, H - 58]) {
      target.beginPath(); target.arc(x, y, 7, 0, Math.PI * 2); target.fill();
    }

    if (logo.complete && logo.naturalWidth) {
      const maxW = 315, maxH = 188;
      const ratio = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight);
      const lw = logo.naturalWidth * ratio, lh = logo.naturalHeight * ratio;
      target.save(); target.globalAlpha = .98;
      target.drawImage(logo, (W-lw)/2, 860, lw, lh);
      target.restore();
    }
    target.textAlign = 'center'; target.textBaseline = 'middle';
    target.fillStyle = '#f1c47d'; target.font = '700 26px Arial, sans-serif';
    target.letterSpacing = '7px'; target.fillText('EU VOU PRA', W/2, 1084);
    target.fillStyle = '#fff1d7'; target.font = '900 69px Georgia, serif';
    target.letterSpacing = '1px'; target.fillText('FESTA!', W/2, 1160);
    target.fillStyle = '#e8c58e'; target.font = '700 24px Arial, sans-serif';
    target.letterSpacing = '3px'; target.fillText('14 DE NOVEMBRO · 2026', W/2, 1230);
    target.fillStyle = '#dec8a9'; target.font = '600 18px Arial, sans-serif';
    target.letterSpacing = '1px'; target.fillText('POVOADO DE AROEIRA · PÉ DE SERRA — BA', W/2, 1276);
  }
  function render() {
    if (!ready) return;
    ctx.clearRect(0, 0, W, H);
    drawCoverImage(ctx);
    drawFrame(ctx);
    shell.classList.add('has-photo');
  }
  function selectImage(file) {
    if (!file) return;
    if (!file.type || !file.type.startsWith('image/')) {
      status.textContent = 'Escolha um arquivo de imagem, como JPG, PNG ou HEIC.';
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      status.textContent = 'Essa foto tem mais de 25 MB. Escolha uma imagem menor.';
      return;
    }
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = URL.createObjectURL(file);
    photo.onload = () => {
      ready = true; scale = 1; offsetX = 0; offsetY = 0;
      zoomControl.value = '100'; zoomValue.textContent = '100%';
      adjustControls.hidden = false; emptyState.hidden = true;
      downloadButton.disabled = false; shareButton.disabled = false;
      render(); status.textContent = 'Montagem pronta! Arraste a foto para ajustar o enquadramento.';
    };
    photo.onerror = () => { ready = false; status.textContent = 'Não consegui abrir essa foto. Tente outra imagem.'; };
    photo.src = photoUrl;
  }
  cameraInput.addEventListener('change', () => { selectImage(cameraInput.files && cameraInput.files[0]); cameraInput.value = ''; });
  galleryInput.addEventListener('change', () => { selectImage(galleryInput.files && galleryInput.files[0]); galleryInput.value = ''; });
  zoomControl.addEventListener('input', () => {
    if (!ready) return;
    const previous = scale;
    scale = Number(zoomControl.value) / 100;
    const ratio = scale / previous;
    offsetX *= ratio; offsetY *= ratio;
    zoomValue.textContent = `${zoomControl.value}%`; render();
  });
  canvas.addEventListener('pointerdown', e => {
    if (!ready) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e => {
    if (!pointer || pointer.id !== e.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    offsetX += (e.clientX - pointer.x) * W / rect.width;
    offsetY += (e.clientY - pointer.y) * H / rect.height;
    pointer.x = e.clientX; pointer.y = e.clientY; render();
  });
  const endDrag = e => { if (pointer && pointer.id === e.pointerId) pointer = null; };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  function makeBlob() {
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível preparar a imagem.')), 'image/jpeg', .94));
  }
  downloadButton.addEventListener('click', async () => {
    if (!ready) return;
    try {
      status.textContent = 'Preparando sua montagem…';
      const blob = await makeBlob();
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url; link.download = 'eu-vou-pra-festa-aroeira.jpg';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      status.textContent = 'Foto baixada! Agora você pode publicar nos Stories.';
    } catch (_) { status.textContent = 'Não foi possível baixar agora. Tente novamente.'; }
  });
  shareButton.addEventListener('click', async () => {
    if (!ready) return;
    try {
      const blob = await makeBlob();
      const file = new File([blob], 'eu-vou-pra-festa-aroeira.jpg', { type: 'image/jpeg' });
      if (navigator.canShare && navigator.canShare({ files: [file] }) && navigator.share) {
        await navigator.share({ files: [file], title: 'Eu vou pra Festa de Aroeira!', text: 'Eu vou pra XXIII Festa de Vaqueiros e Fazendeiros. E você?' });
        status.textContent = 'Montagem compartilhada.';
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a'); link.href = url; link.download = file.name;
        document.body.appendChild(link); link.click(); link.remove();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        status.textContent = 'Seu aparelho não oferece compartilhamento direto aqui. Baixei a foto para você anexar no Instagram.';
      }
    } catch (error) {
      if (error && error.name === 'AbortError') { status.textContent = 'Compartilhamento cancelado.'; return; }
      status.textContent = 'Não foi possível compartilhar. Use “Baixar minha foto” e anexe no Instagram.';
    }
  });
  logo.onload = () => { if (ready) render(); };
  logo.onerror = () => { if (ready) render(); };
})();
