(function () {
  "use strict";
  // ── 설정: 토스페이먼츠 가입 후 발급받은 "클라이언트 키"로 교체하세요 ──
  // 아래는 토스 공식 문서의 공개 테스트 키라 지금도 결제창 테스트가 됩니다.
  const TOSS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

  const form = document.getElementById("order-form");
  const payBtn = document.getElementById("pay-btn");
  const pick = document.getElementById("template-pick");
  const tabs = document.getElementById("tier-tabs");
  const tierDesc = document.getElementById("tier-desc");
  const priceLabel = document.getElementById("price-label");
  const priceValue = document.getElementById("price-value");

  const TIER_FEATURES = {
    basic: "갤러리 6장 · 달력 · 지도 · 계좌복사 · 공유",
    signature: "갤러리 12장 · 배경음악(BGM) · 베이직 기능 전부",
    premium: "갤러리 20장 · BGM · 애니메이션 효과 · 인트로 모션",
  };

  let CATALOG = null;
  let current = null; // 선택된 템플릿 객체
  let currentTier = "signature";
  let widgets = null;
  let widgetsReady = false;

  const won = (n) => n.toLocaleString("ko-KR") + "원";
  const tplOf = (id) => CATALOG.templates.find((t) => t.id === id);

  function renderTabs() {
    tabs.innerHTML = Object.entries(CATALOG.tiers)
      .map(([key, t]) => `<button type="button" class="tier-tab${key === currentTier ? " on" : ""}" data-tier="${key}">${t.label} <small>${won(t.price)}</small></button>`)
      .join("");
  }

  function renderPick() {
    const items = CATALOG.templates.filter((t) => t.tier === currentTier);
    pick.innerHTML = items
      .map((t) => `
      <label>
        <input type="radio" name="template" value="${t.id}" ${current && current.id === t.id ? "checked" : ""} />
        <span class="pick-card">
          <b>${t.name}</b><small>${t.desc}</small>
          <a class="preview-link" href="../templates/${t.id}/" target="_blank" rel="noopener">미리보기 ↗</a>
        </span>
      </label>`)
      .join("");
    tierDesc.textContent = TIER_FEATURES[currentTier];
  }

  function select(id) {
    current = tplOf(id);
    const tier = CATALOG.tiers[current.tier];
    priceLabel.textContent = `${current.name} · ${tier.label}`;
    priceValue.textContent = won(tier.price);
    payBtn.textContent = `${won(tier.price)} 결제하기`;
    if (widgetsReady) widgets.setAmount({ currency: "KRW", value: tier.price }).catch(console.error);
  }

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".tier-tab");
    if (!btn) return;
    currentTier = btn.dataset.tier;
    renderTabs();
    renderPick();
  });

  pick.addEventListener("change", (e) => {
    if (e.target.name === "template") select(e.target.value);
  });

  // customerKey: 비회원 주문이므로 브라우저별 랜덤 키
  let customerKey = localStorage.getItem("mosida_ck");
  if (!customerKey) {
    customerKey = "ck_" + crypto.randomUUID();
    localStorage.setItem("mosida_ck", customerKey);
  }

  (async () => {
    CATALOG = await fetch("../catalog.json").then((r) => r.json());

    // ?t=템플릿id 로 진입하면 해당 템플릿 프리셀렉트
    const q = new URLSearchParams(location.search).get("t");
    const preset = q && tplOf(q) ? tplOf(q) : tplOf("danyeon");
    currentTier = preset.tier;
    renderTabs();
    renderPick();

    const tossPayments = TossPayments(TOSS_CLIENT_KEY);
    widgets = tossPayments.widgets({ customerKey });
    await widgets.setAmount({ currency: "KRW", value: CATALOG.tiers[preset.tier].price });
    await Promise.all([
      widgets.renderPaymentMethods({ selector: "#payment-method" }),
      widgets.renderAgreement({ selector: "#agreement" }),
    ]);
    widgetsReady = true;
    // 위젯 준비 후 선택 반영 (라디오 checked 는 renderPick에서)
    const checked = form.querySelector('input[name="template"]:checked');
    select(checked ? checked.value : preset.id);
  })().catch((e) => console.error("[mosida] 초기화 실패", e));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!current || !widgetsReady) return;

    let firstInvalid = null;
    form.querySelectorAll("[required]").forEach((el) => {
      el.classList.toggle("invalid", !el.value.trim());
      if (!el.value.trim() && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    const fd = new FormData(form);
    const order = Object.fromEntries(fd.entries());
    const tier = CATALOG.tiers[current.tier];
    const orderId = "mosida_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    sessionStorage.setItem("mosida_order", JSON.stringify({ orderId, price: tier.price, order }));

    payBtn.disabled = true;
    try {
      await widgets.requestPayment({
        orderId,
        orderName: `모시다 청첩장 — ${current.name}(${tier.label})`,
        customerName: order.groomName + "·" + order.brideName,
        successUrl: new URL("success.html", location.href).href,
        failUrl: new URL("fail.html", location.href).href,
      });
    } catch (err) {
      console.warn("[mosida] 결제 중단", err);
    } finally {
      payBtn.disabled = false;
    }
  });
})();
