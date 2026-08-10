import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { confirmHandler, PRICE } = require("../api/confirm.js");

function mockRes() {
  const res = { statusCode: 0, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}
const req = (body, method = "POST") => ({ method, body });

test("POST 이외 메서드 거부", async () => {
  const res = mockRes();
  await confirmHandler(req({}, "GET"), res);
  assert.equal(res.statusCode, 405);
});

test("금액 위조 거부", async () => {
  const res = mockRes();
  await confirmHandler(req({ paymentKey: "pk", orderId: "o1", amount: 100 }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "amount mismatch");
});

test("필수값 누락 거부", async () => {
  const res = mockRes();
  await confirmHandler(req({ amount: PRICE }), res);
  assert.equal(res.statusCode, 400);
});

test("시크릿 키 미설정 시 500", async () => {
  const res = mockRes();
  await confirmHandler(req({ paymentKey: "pk", orderId: "o1", amount: PRICE }), res, { env: {} });
  assert.equal(res.statusCode, 500);
});

test("정상 승인 → 토스 호출(서버 가격) + 웹훅 전달 + 200", async () => {
  const calls = [];
  const doFetch = async (url, opts) => {
    calls.push({ url, opts });
    if (url.includes("tosspayments")) {
      const sent = JSON.parse(opts.body);
      assert.equal(sent.amount, PRICE); // 서버 가격표로 승인해야 함
      return { ok: true, status: 200, json: async () => ({ orderId: sent.orderId, status: "DONE" }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const res = mockRes();
  await confirmHandler(
    req({ paymentKey: "pk", orderId: "o1", amount: PRICE, order: { groomName: "김도현" } }),
    res,
    { fetch: doFetch, env: { TOSS_SECRET_KEY: "sk", ORDER_WEBHOOK_URL: "https://hook.example/x" } }
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(calls.length, 2);
  assert.ok(calls[1].opts.body.includes("김도현")); // 주문 내용이 웹훅으로 전달됨
});

test("토스 승인 실패 시 에러 전달", async () => {
  const doFetch = async () => ({ ok: false, status: 402, json: async () => ({ message: "카드 한도 초과" }) });
  const res = mockRes();
  await confirmHandler(
    req({ paymentKey: "pk", orderId: "o1", amount: PRICE }),
    res,
    { fetch: doFetch, env: { TOSS_SECRET_KEY: "sk" } }
  );
  assert.equal(res.statusCode, 402);
  assert.equal(res.body.error, "카드 한도 초과");
});
