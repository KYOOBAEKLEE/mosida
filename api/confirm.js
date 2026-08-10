// 토스페이먼츠 결제 승인 (Vercel Serverless Function)
// 필요한 환경변수:
//   TOSS_SECRET_KEY   — 토스페이먼츠 시크릿 키 (test_gsk_... 또는 live_gsk_...)
//   ORDER_WEBHOOK_URL — (선택) 주문 내용을 받을 웹훅 URL (디스코드/슬랙 등)
const PRICE = 24900; // 클라이언트가 보낸 금액을 믿지 않고 서버 가격표로 검증

async function confirmHandler(req, res, deps = {}) {
  const doFetch = deps.fetch || fetch;
  const env = deps.env || process.env;

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  const { paymentKey, orderId, amount, order } = req.body || {};
  if (!paymentKey || !orderId) return res.status(400).json({ error: "missing paymentKey/orderId" });
  if (Number(amount) !== PRICE) return res.status(400).json({ error: "amount mismatch" });

  const secretKey = env.TOSS_SECRET_KEY;
  if (!secretKey) return res.status(500).json({ error: "TOSS_SECRET_KEY not configured" });

  // 1) 토스 결제 승인
  const tossRes = await doFetch("https://api.tosspayments.com/v1/payments/confirm", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(secretKey + ":").toString("base64"),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ paymentKey, orderId, amount: PRICE }),
  });
  const payment = await tossRes.json();
  if (!tossRes.ok) {
    return res.status(tossRes.status).json({ error: payment.message || "toss confirm failed" });
  }

  // 2) 주문 내용을 운영자에게 전달 (실패해도 결제는 이미 승인 — 고객을 막지 않는다)
  if (env.ORDER_WEBHOOK_URL) {
    const lines = Object.entries(order || {}).map(([k, v]) => `${k}: ${v}`).join("\n");
    await doFetch(env.ORDER_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `💌 새 청첩장 주문!\n주문번호: ${orderId}\n금액: ${PRICE.toLocaleString()}원\n${lines}`,
        text: `새 청첩장 주문 ${orderId}`, // 슬랙 호환
      }),
    }).catch(() => {});
  }

  return res.status(200).json({ ok: true, orderId: payment.orderId });
}

module.exports = (req, res) => confirmHandler(req, res);
module.exports.confirmHandler = confirmHandler;
module.exports.PRICE = PRICE;
