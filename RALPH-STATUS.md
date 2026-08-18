# 랄프루프 진행 상황 — ✅ 확장 과제 완성 기준 전부 충족 (2026-08-12)

## 확장 과제 체크리스트
- [x] 1. 시장조사 (docs/market-research.md) — 경쟁사 7곳 가격·기능 조사, 3등급 가격 확정
- [x] 2. 템플릿 24종 = 베이직 8(9,900원) + 시그니처 8(16,900원) + 프리미엄 8(24,900원)
      — 자동 계약 검사 스크립트로 24종 전부: 파일 완비, invite.js/data.js 바이트 동일,
      등급별 BGM/효과 스크립트 포함 여부, 필수 id 11종, lightbox 버그 픽스 확인
- [x] 3. BGM — assets/bgm.js (자동재생 정책 대응: 차단 시 첫 상호작용에서 재생, 토글 버튼),
      assets/bgm/serene.wav (자체 합성 → 저작권 무관)
- [x] 4. 애니메이션 효과 엔진 — assets/effects.js (snow/sparkle/fireflies/petals 5색, 캔버스,
      reduced-motion 비활성), 프리미엄 8종에 적용 + 표지 인트로 모션 각기 구현
- [x] 5. 주문 플로우 개편 — 등급 탭 + 24종 카드 + 미리보기 링크 + 동적 가격/결제위젯 금액,
      ?t=id 프리셀렉트, api/confirm.js 는 catalog.json 기반 서버 가격표 검증 (테스트 7/7)
- [x] 6. 검증 — 24종 전부 HTTP 200, 계약 검사 통과, 랜딩·주문·별밤·필름 브라우저 QA

## 구조 요약 (다음 세션용)
- catalog.json = 템플릿·등급·가격의 단일 진실 소스 (landing/order/confirm/sitemap 전부 이것 기준)
- 베이직 8종은 scripts/gen-basic.mjs 로 재생성 가능 (sunbaek이 기준작)
- 새 템플릿 추가법: docs/template-spec.md 명세로 폴더 제작 → catalog.json 에 등록 → sitemap 재생성
- 주문 처리: 웹훅 주문 JSON → node scripts/make-invite.mjs 주문.json 슬러그 → 사진 교체 → git push

## 이후 개선 아이디어 (판매 데이터 보고 결정)
- 방명록/RSVP (Supabase), 카카오톡 공유 SDK, 고객 사진 업로드 폼, 라이선스 BGM 교체
