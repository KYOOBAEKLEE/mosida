# 모시다 템플릿 제작 명세 (에이전트 필독)

기준 구현: `templates/danyeon/` (index.html, style.css, invite.js, data.js, img/)

## 불변 계약 — 지키지 않으면 서비스가 깨진다
1. `data.js`, `invite.js` 는 danyeon 것을 **바이트 그대로 복사** (수정 금지)
2. index.html 은 다음 id/속성/클래스를 반드시 포함 (invite.js가 의존):
   `#calendar #dday #gallery #lightbox #lightbox-img #accounts #kakao-map #naver-map #copy-address #share #toast`,
   `data-bind` / `data-src` / `data-tel` 속성 구조, `.reveal`, `.copy-btn`, `.account-row`, `.calendar .dow/.day/.sun/.wedding-day`
3. 섹션 구성 유지: 표지 / 초대글+혼주+연락 / 예식안내(달력·D-day) / 갤러리 / 오시는길 / 마음전하실곳 / 푸터 / 라이트박스 / 토스트
4. CSS 필수: `.lightbox[hidden]{display:none}` (display:flex가 hidden을 덮는 버그 방지),
   `word-break: keep-all`, `#app{max-width:440px;margin:0 auto}`, reduced-motion 대응
5. `img/` 에 cover.svg + photo-1~6.svg 플레이스홀더 (테마 색으로 node 스크립트 생성 후 스크립트 삭제)

## 등급별 기능 (index.html 에서 스크립트로 조립)
- **시그니처**: `</body>` 직전 순서대로
  ```html
  <script src="data.js"></script>
  <script>window.INVITE.bgm = { src: "/assets/bgm/serene.wav" };</script>
  <script src="invite.js"></script>
  <script src="/assets/bgm.js"></script>
  ```
- **프리미엄**: 위에 더해 effects 설정 + effects.js (효과 종류는 catalog.json 의 effect 필드)
  ```html
  <script>window.INVITE.bgm = { src: "/assets/bgm/serene.wav" };
  window.INVITE.effects = { type: "sparkle" };</script>
  <script src="invite.js"></script>
  <script src="/assets/bgm.js"></script>
  <script src="/assets/effects.js"></script>
  ```
  프리미엄은 추가로 표지 인트로 모션 필수: 3초 이내 CSS 애니메이션(페이드/슬라이드/커튼 등 테마에 맞게),
  reduced-motion 시 비활성.
- **베이직**: bgm/effects 없음 (gen-basic.mjs 로 생성하므로 에이전트가 만들 일 없음)

## 디자인 원칙
- 모바일 우선(390px 기준), 데스크톱은 중앙 컬럼
- 폰트는 Google Fonts 한글 (Gowun Batang/Dodum, Hahmlet, Song Myung, Noto Serif KR, Nanum Myeongjo, IBM Plex Sans KR 등 조합 자유)
- 템플릿마다 완전히 다른 무드 — 색·질감·프레임·장식 모티프로 차별화
- 검증: `node --check invite.js data.js` + 완성 후 파일 목록과 3줄 요약만 보고
