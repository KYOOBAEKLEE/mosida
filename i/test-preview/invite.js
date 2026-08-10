(function () {
  "use strict";
  const D = window.INVITE;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  // ---------- 데이터 조회 ----------
  const get = (path, obj) => path.split(".").reduce((o, k) => (o == null ? o : o[k]), obj);

  const date = new Date(D.wedding.dateISO);
  const DOW = ["일", "월", "화", "수", "목", "금", "토"];
  const pad = (n) => String(n).padStart(2, "0");
  const hour12 = () => {
    const h = date.getHours();
    const ampm = h < 12 ? "오전" : "오후";
    const hh = h % 12 === 0 ? 12 : h % 12;
    return date.getMinutes() ? `${ampm} ${hh}시 ${date.getMinutes()}분` : `${ampm} ${hh}시`;
  };

  // 표시용 문자열 — data-bind="fmt.X" 로 사용
  const fmt = {
    coverDate: `${date.getFullYear()}. ${pad(date.getMonth() + 1)}. ${pad(date.getDate())}. ${DOW[date.getDay()]}요일 ${hour12()}`,
    coverVenue: `${D.wedding.venueName} ${D.wedding.hall}`,
    fullDate: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${DOW[date.getDay()]}요일 ${hour12()}`,
  };

  // ---------- 바인딩 ----------
  $$("[data-bind]").forEach((el) => {
    const path = el.dataset.bind;
    const v = path.startsWith("fmt.") ? fmt[path.slice(4)] : get(path, D);
    if (v != null) el.textContent = v;
  });
  $$("[data-src]").forEach((el) => { el.src = get(el.dataset.src, D); });
  $$("[data-tel]").forEach((el) => { el.href = "tel:" + get(el.dataset.tel, D).replace(/-/g, ""); });

  document.title = `${D.groom.name} ♥ ${D.bride.name} 결혼합니다`;

  // ---------- 달력 ----------
  const cal = $("#calendar");
  if (cal) {
    const y = date.getFullYear(), m = date.getMonth();
    const first = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    let html = DOW.map((d) => `<span class="dow">${d}</span>`).join("");
    for (let i = 0; i < first; i++) html += "<span></span>";
    for (let d = 1; d <= days; d++) {
      const cls = ["day"];
      if (new Date(y, m, d).getDay() === 0) cls.push("sun");
      if (d === date.getDate()) cls.push("wedding-day");
      html += `<span class="${cls.join(" ")}">${d}</span>`;
    }
    cal.innerHTML = html;
  }

  // ---------- D-day ----------
  const dday = $("#dday");
  if (dday) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(date); target.setHours(0, 0, 0, 0);
    const diff = Math.round((target - today) / 86400000);
    dday.innerHTML =
      diff > 0 ? `${D.groom.name} ♥ ${D.bride.name}의 결혼식이 <b>${diff}일</b> 남았습니다.`
      : diff === 0 ? `오늘, 두 사람이 결혼합니다.`
      : `${D.groom.name} ♥ ${D.bride.name}, 결혼 <b>${-diff}일째</b>입니다.`;
  }

  // ---------- 갤러리 + 라이트박스 ----------
  const gallery = $("#gallery");
  const lightbox = $("#lightbox");
  if (gallery) {
    gallery.innerHTML = D.gallery.map((src, i) => `<img src="${src}" alt="웨딩 사진 ${i + 1}" loading="lazy" />`).join("");
    gallery.addEventListener("click", (e) => {
      if (e.target.tagName !== "IMG") return;
      $("#lightbox-img").src = e.target.src;
      lightbox.hidden = false;
    });
    lightbox.addEventListener("click", () => { lightbox.hidden = true; });
  }

  // ---------- 지도 ----------
  const addr = encodeURIComponent(D.wedding.address);
  const venue = encodeURIComponent(D.wedding.venueName);
  $("#kakao-map").href = D.wedding.kakaoMapUrl || `https://map.kakao.com/link/search/${venue}`;
  $("#naver-map").href = D.wedding.naverMapUrl || `https://map.naver.com/p/search/${venue}`;
  $("#copy-address").addEventListener("click", () => copy(D.wedding.address, "주소가 복사되었습니다"));

  // ---------- 계좌 아코디언 ----------
  const accounts = $("#accounts");
  const side = (label, person) => `
    <details>
      <summary>${label} 측 계좌번호</summary>
      ${person.accounts.map((a) => `
        <div class="account-row">
          <div><div class="who">${a.holder}</div>${a.bank} ${a.number}</div>
          <button class="copy-btn" data-copy="${a.bank} ${a.number}">복사</button>
        </div>`).join("")}
    </details>`;
  accounts.innerHTML = side("신랑", D.groom) + side("신부", D.bride);
  accounts.addEventListener("click", (e) => {
    const btn = e.target.closest(".copy-btn");
    if (btn) copy(btn.dataset.copy, "계좌번호가 복사되었습니다");
  });

  // ---------- 복사 + 토스트 ----------
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function copy(text, msg) {
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
      .then(() => toast(msg))
      .catch(() => {
        // 구형 브라우저 폴백
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta); ta.select();
        document.execCommand("copy"); ta.remove(); toast(msg);
      });
  }

  // ---------- 공유 ----------
  $("#share").addEventListener("click", () => {
    const data = { title: document.title, url: location.href };
    if (navigator.share) navigator.share(data).catch(() => {});
    else copy(location.href, "청첩장 주소가 복사되었습니다");
  });

  // ---------- 스크롤 등장 ----------
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { threshold: 0.15 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 90}ms`; io.observe(el); });
})();
