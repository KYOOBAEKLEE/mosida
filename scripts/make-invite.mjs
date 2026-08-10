#!/usr/bin/env node
// 주문 JSON → 고객 청첩장 생성
// 사용법: node scripts/make-invite.mjs 주문.json [슬러그]
//   주문.json 예시는 scripts/sample-order.json 참고 (웹훅으로 받은 주문 내용 그대로)
//   결과: i/<슬러그>/ 폴더 생성 → git push 또는 vercel --prod 로 배포 → 고객에게 /i/<슬러그>/ 링크 전달
import fs from "node:fs";
import path from "node:path";

const [, , orderFile, slugArg] = process.argv;
if (!orderFile) {
  console.error("사용법: node scripts/make-invite.mjs 주문.json [슬러그]");
  process.exit(1);
}

const root = path.join(import.meta.dirname, "..");
const o = JSON.parse(fs.readFileSync(orderFile, "utf8"));
const template = o.template || "danyeon";
const templateDir = path.join(root, "templates", template);
if (!fs.existsSync(templateDir)) {
  console.error(`템플릿 없음: ${template}`);
  process.exit(1);
}

// 슬러그: 지정 없으면 이름+랜덤 (URL 추측 방지용 랜덤 접미사)
const slug = slugArg || `${o.groomName || "wedding"}-${o.brideName || ""}-${Math.random().toString(36).slice(2, 7)}`
  .replace(/[^\w가-힣-]/g, "");
const outDir = path.join(root, "i", slug);
if (fs.existsSync(outDir)) {
  console.error(`이미 존재: i/${slug}`);
  process.exit(1);
}

// datetime-local("2026-10-24T13:00") → ISO(+09:00)
const dateISO = (o.weddingAt || "").length === 16 ? o.weddingAt + ":00+09:00" : o.weddingAt;

const invite = {
  groom: {
    name: o.groomName || "신랑",
    order: o.groomOrder || "아들",
    father: o.groomFather || "",
    mother: o.groomMother || "",
    phone: o.groomPhone || "",
    accounts: o.groomAccounts || [],
  },
  bride: {
    name: o.brideName || "신부",
    order: o.brideOrder || "딸",
    father: o.brideFather || "",
    mother: o.brideMother || "",
    phone: o.bridePhone || "",
    accounts: o.brideAccounts || [],
  },
  wedding: {
    dateISO,
    venueName: o.venueName || "",
    hall: o.hall || "",
    address: o.address || "",
  },
  greeting: {
    title: o.greetingTitle || "소중한 분들을 초대합니다",
    message: o.greeting ||
      "서로가 마주 보며 다져온 사랑을\n이제 함께 한곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있도록\n앞날을 축복해 주시면 감사하겠습니다.",
  },
  gallery: o.gallery || ["img/photo-1.svg", "img/photo-2.svg", "img/photo-3.svg", "img/photo-4.svg", "img/photo-5.svg", "img/photo-6.svg"],
  cover: { photo: o.coverPhoto || "img/cover.svg" },
};

fs.cpSync(templateDir, outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "data.js"), "window.INVITE = " + JSON.stringify(invite, null, 2) + ";\n");

console.log(`✅ 생성 완료: i/${slug}/`);
console.log(`   미리보기: npx serve 후 /i/${slug}/ 접속`);
console.log(`   사진 교체: i/${slug}/img/ 에 고객 사진을 넣고 data.js 의 gallery/cover 경로 수정`);
