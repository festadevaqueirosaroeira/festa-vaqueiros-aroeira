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
  const frame = new Image();
  frame.src = 'moldura-da-festa.png?v=1';
  const HOLE = { x: 70, y: 312, width: 540, height: 491 };
  let ready = false, scale = 1, offsetX = 0, offsetY = 0, pointer = null, photoUrl = '';

  function drawCoverImage(target) {
    if (!ready) return;
    const iw = photo.naturalWidth, ih = photo.naturalHeight;
    const base = Math.max(HOLE.width / iw, HOLE.height / ih) * scale;
    const dw = iw * base, dh = ih * base;
    const x = HOLE.x + (HOLE.width - dw) / 2 + offsetX;
    const y = HOLE.y + (HOLE.height - dh) / 2 + offsetY;
    target.save();
    target.beginPath();
    target.rect(HOLE.x, HOLE.y, HOLE.width, HOLE.height);
    target.clip();
    target.drawImage(photo, x, y, dw, dh);
    target.restore();
  }
  function render() {
    if (!ready) return;
    ctx.clearRect(0, 0, W, H);
    drawCoverImage(ctx);
    if (frame.complete && frame.naturalWidth) ctx.drawImage(frame, 0, 0);
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
    return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Não foi possível preparar a imagem.')), 'image/png'));
  }
  downloadButton.addEventListener('click', async () => {
    if (!ready) return;
    try {
      status.textContent = 'Preparando sua montagem…';
      const blob = await makeBlob();
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url; link.download = 'eu-vou-pra-festa-aroeira.png';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      status.textContent = 'Foto baixada! Agora você pode publicar nos Stories.';
    } catch (_) { status.textContent = 'Não foi possível baixar agora. Tente novamente.'; }
  });
  shareButton.addEventListener('click', async () => {
    if (!ready) return;
    try {
      const blob = await makeBlob();
      const file = new File([blob], 'eu-vou-pra-festa-aroeira.png', { type: 'image/png' });
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
  frame.onload = () => { if (ready) render(); };
  frame.onerror = () => { status.textContent = 'Não foi possível carregar a moldura. Atualize a página e tente novamente.'; };
})();
