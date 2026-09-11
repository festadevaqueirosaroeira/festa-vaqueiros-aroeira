// XXIII Festa de Vaqueiros e Fazendeiros — camada de identidade visual
// Mantém as interações existentes e carrega o tema visual sem exigir alteração do index.html.
(function(){
  const theme=document.createElement('link');
  theme.rel='stylesheet';
  theme.href='theme.css';
  document.head.appendChild(theme);

  const menu=document.querySelector('.menu-toggle');
  const header=document.querySelector('.site-header');
  menu?.addEventListener('click',()=>header?.classList.toggle('nav-open'));
  document.querySelectorAll('nav a').forEach(a=>a.addEventListener('click',()=>header?.classList.remove('nav-open')));

  // Corrige os caminhos dos assets que existem no repositório.
  const imgMap={
    '.photo-frame img':'assets/guia-home-web.jpg',
    '.n1':'assets/guia-home-web.jpg',
    '.n2':'assets/logo-web.jpg',
    '.n3':'assets/patrocinio-web.jpg',
    '.video-thumb':'assets/guia-home-web.jpg'
  };
  Object.entries(imgMap).forEach(([sel,url])=>{
    document.querySelectorAll(sel).forEach(el=>{
      if(el.tagName==='IMG') el.src=url;
      else el.style.backgroundImage=`linear-gradient(0deg,rgba(0,0,0,.35),transparent),url("${url}")`;
    });
  });

  // Perfis: mantém a proteção de dados e abre o modal com o conteúdo existente.
  const modal=document.querySelector('#modal');
  const content=document.querySelector('#modal-content');
  const names={
    isabella:['ISABELLA GONÇALVES','RAINHA DA XXIII FESTA','2.450','Foto, mensagem e apresentação da candidata serão publicados aqui.'],
    maite:['MAITE AZEVEDO','RAINHA MIRIM','1.740','Perfil com conteúdo autorizado e informações essenciais, preservando a privacidade da menor.'],
    ana:['ANA MEL','PRINCESA MIRIM','1.930','Perfil com conteúdo autorizado e informações essenciais, preservando a privacidade da menor.'],
    keylla:['KEYLLA ALMEIDA','PRINCESA','2.180','Foto, mensagem e apresentação da candidata serão publicados aqui.'],
    denise:['DENISE HORA','AMAZONAS','1.520','Foto, mensagem e apresentação da candidata serão publicados aqui.']
  };
  const candidateImages={
    isabella:'assets/logo-web.jpg',
    maite:'assets/guia-home-web.jpg',
    ana:'assets/patrocinio-web.jpg',
    keylla:'assets/guia-visual-web.jpg',
    denise:'assets/logo-web.jpg'
  };
  window.closeModal=()=>modal?.classList.remove('show');

  document.querySelectorAll('[data-modal]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const key=btn.dataset.modal;
      if(!content||!modal) return;
      if(key==='regulamento'){
        content.innerHTML='<div class="modal-photo"></div><div class="eyebrow">PARTICIPE DA XXIII EDIÇÃO</div><h2>REGULAMENTO DO <em>APOIO</em></h2><p>Esta área apresentará o período de participação, critérios, forma de contabilização, pagamentos, validação, encerramento, resultado oficial e termos de participação.</p><p><b>PLACEHOLDER EDITÁVEL</b><br>O regulamento oficial será inserido pela comissão organizadora.</p>';
      }else{
        const n=names[key];
        content.innerHTML=`<div class="modal-photo" style="background-image:url('${candidateImages[key]}')"></div><div class="eyebrow">${n[1]}</div><h2>${n[0]}</h2><p>${n[3]}</p><p><b>APOIOS RECEBIDOS</b><br><strong style="font:32px var(--cond);color:var(--copper)">${n[2]}</strong></p><p>Fotos, vídeos e mensagem da candidata — conteúdo autorizado pela organização.</p><a class="btn btn-copper" href="#votacao" onclick="closeModal()">Apoiar ${n[0].split(' ')[0]} →</a>`;
      }
      modal.classList.add('show');
    });
  });
  document.querySelector('.modal-close')?.addEventListener('click',window.closeModal);
  modal?.addEventListener('click',e=>{if(e.target===modal) window.closeModal()});

  document.querySelectorAll('.amounts button').forEach(b=>b.addEventListener('click',()=>{
    document.querySelectorAll('.amounts button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
  }));

  // Contagem regressiva oficial.
  const target=new Date('2026-11-14T00:00:00-03:00');
  const day=document.querySelector('#days');
  function tick(){
    const d=Math.max(0,Math.ceil((target-new Date())/86400000));
    if(day) day.textContent=d;
  }
  tick();
  setInterval(tick,3600000);
})();