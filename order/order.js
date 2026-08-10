(function () {
  "use strict";
  // ── 설정: 토스페이먼츠 가입 후 발급받은 "클라이언트 키"로 교체하세요 ──
  // 아래는 토스 공식 문서의 공개 테스트 키라 지금도 결제창 테스트가 됩니다.
  const TOSS_CLIENT_KEY = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
  const PRICE = 24900;

  const form = document.getElementById("order-form");
  const payBtn = document.getElementById("pay-btn");

  // customerKey: 비회원 주문이므로 브라우저별 랜덤 키
  let customerKey = localStorage.getItem("mosida_ck");
  if (!customerKey) {
    customerKey = "ck_" + crypto.randomUUID();
    localStorage.setItem("mosida_ck", customerKey);
  }

  const tossPayments = TossPayments(TOSS_CLIENT_KEY);
  const widgets = tossPayments.widgets({ customerKey });

  (async () => {
    await widgets.setAmount({ currency: "KRW", value: PRICE });
    await Promise.all([
      widgets.renderPaymentMethods({ selector: "#payment-method" }),
      widgets.renderAgreement({ selector: "#agreement" }),
    ]);
  })().catch((e) => console.error("[mosida] 위젯 로드 실패", e));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 필수값 검증
    let firstInvalid = null;
    form.querySelectorAll("[required]").forEach((el) => {
      el.classList.toggle("invalid", !el.value.trim());
      if (!el.value.trim() && !firstInvalid) firstInvalid = el;
    });
    if (firstInvalid) { firstInvalid.focus(); return; }

    const fd = new FormData(form);
    const order = Object.fromEntries(fd.entries());
    const orderId = "mosida_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);

    // 결제 승인 페이지에서 서버로 전달할 주문 내용 보관
    sessionStorage.setItem("mosida_order", JSON.stringify({ orderId, price: PRICE, order }));

    payBtn.disabled = true;
    try {
      await widgets.requestPayment({
        orderId,
        orderName: "모시다 모바일 청첩장",
        customerName: order.groomName + "·" + order.brideName,
        successUrl: location.origin + "/order/success.html",
        failUrl: location.origin + "/order/fail.html",
      });
    } catch (err) {
      // 사용자가 결제창을 닫은 경우 등
      console.warn("[mosida] 결제 중단", err);
    } finally {
      payBtn.disabled = false;
    }
  });
})();
