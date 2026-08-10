# 랄프루프 진행 상황

## 완성 기준 체크리스트
- [ ] 1. 고품질 모바일 청첩장 템플릿 3종 이상 — **1/3 (담연 완성)**
- [x] 2. 주문 제작 플로우 (order/ + make-invite.mjs)
- [x] 3. 토스페이먼츠 결제 연동 코드 (위젯 v2 + api/confirm.js, 키만 꽂으면 됨)
- [x] 4. 랜딩 페이지 + SEO (index.html, sitemap, robots, JSON-LD)
- [x] 5. 로컬 동작 검증 (전 페이지 200, npm test 6/6, make-invite 실행 확인)
- [x] 6. 배포 안내 문서 (DEPLOY.md)

## 다음 이터레이션 할 일 (우선순위순)
1. 템플릿 2호 "하늘" — 밝고 모던한 톤 (미니멀, 산세리프 계열, 하늘색). templates/haneul/
2. 템플릿 3호 "담음" — 어둡고 고급스러운 톤 (딥그린/골드, 세리프). templates/dahm/
3. 템플릿 완성 시 order/index.html 의 disabled 라디오 해제 + 랜딩 template-grid 링크 연결
4. 브라우저 실기기 시각 QA (스크린샷으로 디자인 확인, 폰트/레이아웃 깨짐 체크)
5. (여유 시) 방명록·참석여부(RSVP) — 백엔드 필요, Supabase 무료 티어. 지금은 스킵.

## 규칙
- 템플릿은 danyeon 구조 복제: index.html + style.css + invite.js + data.js + img/
- data.js 스키마는 모든 템플릿 공통 (make-invite.mjs가 의존)
- invite.js 로직은 템플릿마다 복사 허용 (디자인 결합도 낮추기 위함)
- i/test-preview/ 는 검증용 샘플 — 지우지 말 것
