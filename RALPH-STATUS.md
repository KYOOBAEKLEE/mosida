# 랄프루프 진행 상황 — ✅ 완성 기준 전부 충족

## 완성 기준 체크리스트
- [x] 1. 고품질 모바일 청첩장 템플릿 3종 — 담연(한지 클래식) · 하늘(하늘빛 모던) · 담음(딥그린 골드 럭셔리), 전부 브라우저 시각 검증 완료
- [x] 2. 주문 제작 플로우 (order/ 폼 + make-invite.mjs 제작 스크립트)
- [x] 3. 토스페이먼츠 결제 연동 — 위젯 v2 렌더링 확인(테스트 키), api/confirm.js 승인+금액검증+웹훅, 테스트 6/6
- [x] 4. 랜딩 페이지 + SEO (sitemap, robots, JSON-LD, OG) + 이용약관/개인정보처리방침
- [x] 5. 로컬 동작 검증 — 전 페이지 200, 전 템플릿 스크린샷 QA, npm test 통과
- [x] 6. 배포 안내 문서 (DEPLOY.md) + 홍보 초안 (marketing/launch-posts.md)

## 남은 일 = 사장님(사용자)만 할 수 있는 일 — DEPLOY.md 참고
1. GitHub 푸시 + Vercel 배포 (5분)
2. 사업자등록 + 토스페이먼츠 가맹 가입 → 키 2개 꽂기 (order/order.js의 TOSS_CLIENT_KEY, Vercel 환경변수 TOSS_SECRET_KEY)
3. 디스코드 웹훅 → ORDER_WEBHOOK_URL (주문 알림)
4. 홍보 시작 (marketing/launch-posts.md 복붙)

## 이후 개선 아이디어 (판매 시작 후)
- 방명록/RSVP (Supabase 무료 티어)
- 카카오톡 공유 SDK (카카오 개발자 앱 키 필요)
- 고객 사진 업로드 폼 (지금은 카톡 채널로 수령)
- 템플릿 4호+ (판매 데이터 보고 결정)
