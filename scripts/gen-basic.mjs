#!/usr/bin/env node
// 베이직 등급 8종 생성기 — templates/sunbaek 을 기준으로 테마 변주 7종을 찍어낸다.
// 사용법: node scripts/gen-basic.mjs   (재실행 시 변주 폴더를 덮어씀. sunbaek 자체도 img/invite/data를 채움)
import fs from "node:fs";
import path from "node:path";

const root = path.join(import.meta.dirname, "..");
const T = (p) => path.join(root, "templates", p);

const THEMES = [
  // sunbaek 은 기준작 — theme 값은 이미 style.css 에 있는 그대로
  { id: "sunbaek", frame: "arch",
    fonts: "family=Noto+Serif+KR:wght@300;400;600&family=Hahmlet:wght@300;400;500",
    serif: '"Noto Serif KR", serif', display: '"Hahmlet", serif',
    bg: "#ffffff", bgSoft: "#f7f6f4", ink: "#33312e", inkSoft: "#8a867f",
    accent: "#9a938a", line: "#e9e6e1", photo: ["#eceae6", "#d8d4cd"] },
  { id: "misaek", frame: "rounded",
    fonts: "family=Gowun+Batang:wght@400;700&family=Song+Myung",
    serif: '"Gowun Batang", serif', display: '"Song Myung", serif',
    bg: "#faf6ee", bgSoft: "#f2ecdf", ink: "#453c30", inkSoft: "#93876f",
    accent: "#b09468", line: "#e6ddc9", photo: ["#f0e7d3", "#dcc9a4"] },
  { id: "yeonbunhong", frame: "circle",
    fonts: "family=Gowun+Dodum&family=Hahmlet:wght@300;400;500",
    serif: '"Gowun Dodum", sans-serif', display: '"Hahmlet", serif',
    bg: "#fdf7f8", bgSoft: "#f9edef", ink: "#4a3a3e", inkSoft: "#a08a8f",
    accent: "#d48a9b", line: "#f0dde1", photo: ["#f7dfe4", "#eab6c2"] },
  { id: "saebyeok", frame: "rect",
    fonts: "family=IBM+Plex+Sans+KR:wght@300;400;500&family=Hahmlet:wght@300;400;500",
    serif: '"IBM Plex Sans KR", sans-serif', display: '"Hahmlet", serif',
    bg: "#f5f7fa", bgSoft: "#ebeff5", ink: "#333a43", inkSoft: "#84909f",
    accent: "#7d93ad", line: "#dde4ec", photo: ["#e3eaf2", "#bfcedd"] },
  { id: "yeondut", frame: "rounded",
    fonts: "family=Gowun+Dodum&family=Gowun+Batang:wght@400;700",
    serif: '"Gowun Dodum", sans-serif', display: '"Gowun Batang", serif',
    bg: "#f6faf3", bgSoft: "#edf4e7", ink: "#37402f", inkSoft: "#8a967d",
    accent: "#7fa06f", line: "#dfe9d6", photo: ["#e6f0dc", "#c2d6ae"] },
  { id: "morae", frame: "arch",
    fonts: "family=Noto+Serif+KR:wght@300;400;600&family=Song+Myung",
    serif: '"Noto Serif KR", serif', display: '"Song Myung", serif',
    bg: "#faf7f0", bgSoft: "#f2ede1", ink: "#423d33", inkSoft: "#948a77",
    accent: "#b3a284", line: "#e7dfd0", photo: ["#efe8d8", "#d6c7ab"] },
  { id: "jaetbit", frame: "rect",
    fonts: "family=IBM+Plex+Sans+KR:wght@300;400;500&family=Noto+Serif+KR:wght@300;400;600",
    serif: '"IBM Plex Sans KR", sans-serif', display: '"Noto Serif KR", serif',
    bg: "#f6f6f6", bgSoft: "#ededed", ink: "#2f2f2f", inkSoft: "#8a8a8a",
    accent: "#6b6b6b", line: "#e1e1e1", photo: ["#e8e8e8", "#c9c9c9"] },
  { id: "meok", frame: "circle",
    fonts: "family=Nanum+Myeongjo:wght@400;700&family=Song+Myung",
    serif: '"Nanum Myeongjo", serif', display: '"Song Myung", serif',
    bg: "#fcfcfa", bgSoft: "#f3f3ef", ink: "#26241f", inkSoft: "#7d7a72",
    accent: "#2e2c29", line: "#e5e4df", photo: ["#ececea", "#cfcec9"] },
];

const svg = ([c1, c2], w, h, label) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs>
<rect width="${w}" height="${h}" fill="url(#g)"/>
<g fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2">
<path d="M ${w * 0.5} ${h * 0.72} C ${w * 0.45} ${h * 0.55}, ${w * 0.55} ${h * 0.45}, ${w * 0.5} ${h * 0.3}"/>
<ellipse cx="${w * 0.5}" cy="${h * 0.28}" rx="${w * 0.05}" ry="${w * 0.08}"/>
<ellipse cx="${w * 0.44}" cy="${h * 0.5}" rx="${w * 0.06}" ry="${w * 0.03}" transform="rotate(-30 ${w * 0.44} ${h * 0.5})"/>
<ellipse cx="${w * 0.56}" cy="${h * 0.6}" rx="${w * 0.06}" ry="${w * 0.03}" transform="rotate(30 ${w * 0.56} ${h * 0.6})"/>
</g>
<text x="50%" y="88%" text-anchor="middle" font-family="serif" font-size="${w * 0.045}" fill="#ffffff" fill-opacity="0.8" letter-spacing="3">${label}</text>
</svg>`;

const themeBlock = (t) => `:root {
  --bg: ${t.bg};
  --bg-soft: ${t.bgSoft};
  --ink: ${t.ink};
  --ink-soft: ${t.inkSoft};
  --accent: ${t.accent};
  --line: ${t.line};
  --serif: ${t.serif};
  --display: ${t.display};
}`;

const baseHtml = fs.readFileSync(T("sunbaek/index.html"), "utf8");
const baseCss = fs.readFileSync(T("sunbaek/style.css"), "utf8");
const inviteJs = fs.readFileSync(T("danyeon/invite.js"), "utf8");
const dataJs = fs.readFileSync(T("danyeon/data.js"), "utf8");

for (const t of THEMES) {
  const dir = T(t.id);
  fs.mkdirSync(path.join(dir, "img"), { recursive: true });

  // index.html: 폰트 링크 + 프레임 클래스 교체
  const html = baseHtml
    .replace(/family=[^"]+&display=swap/, `${t.fonts}&display=swap`)
    .replace(/<body class="frame-\w+">/, `<body class="frame-${t.frame}">`);
  fs.writeFileSync(path.join(dir, "index.html"), html);

  // style.css: THEME 블록 교체
  const css = baseCss.replace(
    /\/\* ===THEME=== \*\/[\s\S]*?\/\* ===\/THEME=== \*\//,
    `/* ===THEME=== */\n${themeBlock(t)}\n/* ===/THEME=== */`
  );
  fs.writeFileSync(path.join(dir, "style.css"), css);

  fs.writeFileSync(path.join(dir, "invite.js"), inviteJs);
  fs.writeFileSync(path.join(dir, "data.js"), dataJs);

  fs.writeFileSync(path.join(dir, "img/cover.svg"), svg(t.photo, 600, 800, "OUR WEDDING"));
  for (let i = 1; i <= 6; i++)
    fs.writeFileSync(path.join(dir, `img/photo-${i}.svg`), svg(t.photo, 600, 600, `PHOTO ${i}`));

  console.log(`✅ templates/${t.id}/`);
}
