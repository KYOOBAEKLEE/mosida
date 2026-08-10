# 모시다 — 모바일 청첩장 서비스

하루 만에 완성되는 프리미엄 모바일 청첩장. 모든 기능 포함 24,900원 단일가.

## 구조

```
index.html            랜딩 페이지 (판매)
order/                주문 폼 + 토스페이먼츠 결제
api/confirm.js        결제 승인 서버리스 함수 (Vercel)
templates/danyeon/    템플릿 1호 "담연" — data.js만 바꾸면 새 청첩장
i/<슬러그>/            고객별 완성 청첩장 (make-invite.mjs가 생성)
scripts/make-invite.mjs  주문 JSON → 청첩장 폴더 생성
```

## 로컬 실행 / 테스트

```bash
npm run serve   # http://localhost:3333
npm test        # 결제 승인 로직 테스트
```

## 판매 시작

[DEPLOY.md](DEPLOY.md) 참고 — Vercel 배포 + 토스페이먼츠 키 2개만 꽂으면 끝.
