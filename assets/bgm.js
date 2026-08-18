// 모시다 공용 BGM 플레이어 — INVITE.bgm = { src: "/assets/bgm/serene.wav" } 이면 활성화
// 브라우저 자동재생 정책 대응: 무음 자동재생은 막히므로, 첫 터치/스크롤에서 재생 시도 + 토글 버튼 제공
(function () {
  "use strict";
  const cfg = window.INVITE && window.INVITE.bgm;
  if (!cfg || !cfg.src) return;

  const audio = new Audio(cfg.src);
  audio.loop = true;
  audio.preload = "auto";
  audio.volume = 0.55;

  const btn = document.createElement("button");
  btn.id = "bgm-toggle";
  btn.setAttribute("aria-label", "배경음악 켜기/끄기");
  btn.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/></svg>';
  const css = document.createElement("style");
  css.textContent = `
    #bgm-toggle{position:fixed;top:1rem;right:1rem;z-index:80;width:2.6rem;height:2.6rem;
      border-radius:50%;border:1px solid rgba(128,128,128,.35);cursor:pointer;
      background:rgba(255,255,255,.72);backdrop-filter:blur(6px);color:#555;
      display:flex;align-items:center;justify-content:center;transition:opacity .3s}
    #bgm-toggle.playing{animation:bgm-spin 6s linear infinite;color:#333}
    #bgm-toggle.off svg{opacity:.4}
    #bgm-toggle.off::after{content:"";position:absolute;width:1.7rem;height:1px;
      background:currentColor;transform:rotate(-45deg)}
    @keyframes bgm-spin{to{transform:rotate(360deg)}}
    @media (prefers-reduced-motion: reduce){#bgm-toggle.playing{animation:none}}
  `;
  document.head.appendChild(css);
  document.body.appendChild(btn);

  let wanted = true; // 사용자가 끄기 전까지는 재생 의도 유지
  const paint = () => {
    btn.classList.toggle("playing", !audio.paused);
    btn.classList.toggle("off", audio.paused);
  };
  const tryPlay = () => { if (wanted) audio.play().then(paint).catch(paint); };

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (audio.paused) { wanted = true; audio.play().then(paint).catch(paint); }
    else { wanted = false; audio.pause(); paint(); }
  });

  // 자동재생 시도 → 막히면 첫 상호작용(터치·클릭·스크롤)에서 재시도
  tryPlay();
  ["pointerdown", "touchstart", "scroll", "keydown"].forEach((ev) =>
    window.addEventListener(ev, function once() {
      window.removeEventListener(ev, once);
      tryPlay();
    }, { passive: true })
  );
  paint();
})();
