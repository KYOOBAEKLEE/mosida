// 청첩장 데이터 — 이 파일만 바꾸면 새 청첩장이 완성됩니다.
// scripts/make-invite.mjs 가 주문 JSON으로 이 파일을 자동 생성합니다.
window.INVITE = {
  groom: {
    name: "김도현",
    order: "장남",            // 장남, 차남, 아들 …
    father: "김영수",
    mother: "박미경",
    phone: "010-1234-5678",
    accounts: [
      { bank: "국민은행", number: "123456-01-234567", holder: "김도현" },
      { bank: "신한은행", number: "110-234-567890", holder: "김영수" },
    ],
  },
  bride: {
    name: "이서연",
    order: "장녀",
    father: "이준호",
    mother: "최은정",
    phone: "010-8765-4321",
    accounts: [
      { bank: "카카오뱅크", number: "3333-01-2345678", holder: "이서연" },
    ],
  },
  wedding: {
    dateISO: "2026-10-24T13:00:00+09:00",
    venueName: "더채플앳청담",
    hall: "채플홀 3층",
    address: "서울 강남구 선릉로 757",
    // 지도 링크는 주소로 자동 생성됩니다. 직접 지정하려면 아래 주석을 해제하세요.
    // kakaoMapUrl: "", naverMapUrl: "",
  },
  greeting: {
    title: "소중한 분들을 초대합니다",
    message:
      "서로가 마주 보며 다져온 사랑을\n이제 함께 한곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있도록\n앞날을 축복해 주시면 감사하겠습니다.",
  },
  gallery: [
    "img/photo-1.svg",
    "img/photo-2.svg",
    "img/photo-3.svg",
    "img/photo-4.svg",
    "img/photo-5.svg",
    "img/photo-6.svg",
  ],
  cover: { photo: "img/cover.svg" },
};
