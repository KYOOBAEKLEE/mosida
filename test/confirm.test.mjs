import { test } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { confirmHandler, priceOf } = require("../api/confirm.js");
const catalog = require("../catalog.json");

function mockRes() {
  const res = { statusCode: 0, body: null };
  res.status = (c) => { res.statusCode = c; return res; };
  res.json = (b) => { res.body = b; return res; };
  return res;
}
const req = (body, method = "POST") => ({ method, body });

test("카탈로그 가격표 — 24종 전부 등급 가격이 나온다", () => {
  assert.equal(catalog.templates.length, 24);
  for (const t of catalog.templates) {
    assert.equal(priceOf(t.id), catalog.tiers[t.tier].price, t.id);
  }
  assert.equal(priceOf("danyeon"), 16900);
  assert.equal(priceOf("sunbaek"), 9900);
  assert.equal(priceOf("byeolbam"), 24900);
});

test("POST 이외 메서드 거부", async () => {
  const res = mockRes();
  await confirmHandler(req({}, "GET"), res);
  assert.equal(res.statusCode, 405);
});

test("모르는 템플릿 거부", async () => {
  const res = mockRes();
  await confirmHandler(req({ paymentKey: "pk", orderId: "o1", amount: 9900, order: { template: "hacker" } }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "unknown template");
});

test("금액 위조 거부 — 프리미엄 템플릿을 베이직 가격으로", async () => {
  const res = mockRes();
  await confirmHandler(req({ paymentKey: "pk", orderId: "o1", amount: 9900, order: { template: "byeolbam" } }), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "amount mismatch");
});

test("시크릿 키 미설정 시 500", async () => {
  const res = mockRes();
  await confirmHandler(req({ paymentKey: "pk", orderId: "o1", amount: 16900, order: { template: "danyeon" } }), res, { env: {} });
  assert.equal(res.statusCode, 500);
});

test("정상 승인 → 토스 호출은 서버 가격 + 웹훅 전달 + 200", async () => {
  const calls = [];
  const doFetch = async (url, opts) => {
    calls.push({ url, opts });
    if (url.includes("tosspayments")) {
      const sent = JSON.parse(opts.body);
      assert.equal(sent.amount, 24900); // moran = premium
      return { ok: true, status: 200, json: async () => ({ orderId: sent.orderId, status: "DONE" }) };
    }
    return { ok: true, status: 200, json: async () => ({}) };
  };
  const res = mockRes();
  await confirmHandler(
    req({ paymentKey: "pk", orderId: "o1", amount: 24900, order: { template: "moran", groomName: "김도현" } }),
    res,
    { fetch: doFetch, env: { TOSS_SECRET_KEY: "sk", ORDER_WEBHOOK_URL: "https://hook.example/x" } }
  );
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.ok, true);
  assert.equal(calls.length, 2);
  assert.ok(calls[1].opts.body.includes("김도현"));
});

test("토스 승인 실패 시 에러 전달", async () => {
  const doFetch = async () => ({ ok: false, status: 402, json: async () => ({ message: "카드 한도 초과" }) });
  const res = mockRes();
  await confirmHandler(
    req({ paymentKey: "pk", orderId: "o1", amount: 16900, order: { template: "danyeon" } }),
    res,
    { fetch: doFetch, env: { TOSS_SECRET_KEY: "sk" } }
  );
  assert.equal(res.statusCode, 402);
  assert.equal(res.body.error, "카드 한도 초과");
});
