#!/usr/bin/env node
// 자체 합성 BGM 생성 — 저작권 무관한 잔잔한 피아노풍 아르페지오 루프 (WAV)
// 사용법: node scripts/gen-bgm.mjs  →  assets/bgm/serene.wav
// 실제 서비스에서는 라이선스 구매한 음원(mp3)으로 교체 권장 (DEPLOY.md 참고)
import fs from "node:fs";
import path from "node:path";

const SR = 22050;             // 샘플레이트 (모노 16bit)
const BPM = 66;
const BEAT = 60 / BPM;        // 초/박
const BARS = 8;               // 8마디 루프
const DUR = BARS * 4 * BEAT;

// C장조 잔잔한 진행: C – Am – F – G 를 두 번, 마지막은 C로 해소
const CHORDS = [
  [261.63, 329.63, 392.0],   // C
  [220.0, 261.63, 329.63],   // Am
  [174.61, 220.0, 261.63],   // F  (낮게)
  [196.0, 246.94, 293.66],   // G
];

const N = Math.floor(SR * DUR);
const buf = new Float32Array(N);

// 피아노풍 톤: 감쇠하는 사인 + 옥타브 배음 약간
function note(freq, start, len, vel) {
  const s0 = Math.floor(start * SR);
  const s1 = Math.min(N, Math.floor((start + len) * SR));
  for (let i = s0; i < s1; i++) {
    const t = (i - s0) / SR;
    const env = Math.exp(-t * 2.2) * Math.min(1, t * 60); // 어택 + 감쇠
    const v =
      Math.sin(2 * Math.PI * freq * t) * 0.7 +
      Math.sin(2 * Math.PI * freq * 2 * t) * 0.18 +
      Math.sin(2 * Math.PI * freq * 3 * t) * 0.06;
    buf[i] += v * env * vel;
  }
}

for (let bar = 0; bar < BARS; bar++) {
  const chord = CHORDS[bar % 4];
  const t0 = bar * 4 * BEAT;
  // 베이스 (근음 한 옥타브 아래, 마디 첫 박)
  note(chord[0] / 2, t0, BEAT * 3.6, 0.28);
  // 아르페지오: 8분음표로 낮은음→높은음→되돌아오기
  const seq = [0, 1, 2, 1, 0, 1, 2, 1];
  seq.forEach((ci, k) => {
    const jitter = (Math.sin(bar * 7 + k * 3) + 1) * 0.006; // 미세한 휴먼라이즈
    note(chord[ci] * 2, t0 + k * BEAT * 0.5 + jitter, BEAT * 0.9, 0.16 + (k === 0 ? 0.05 : 0));
  });
  // 상성부 멜로디 음 하나 (2박째, 마디마다 코드 최고음)
  if (bar % 2 === 0) note(chord[2] * 2, t0 + BEAT, BEAT * 2.5, 0.1);
}

// 루프 이음새 부드럽게: 앞뒤 0.4초 크로스페이드 개념으로 끝부분 페이드
const fade = Math.floor(SR * 0.4);
for (let i = 0; i < fade; i++) {
  buf[N - 1 - i] *= i / fade;
  buf[i] *= Math.min(1, i / (fade * 0.5));
}

// 정규화 + 16bit PCM
let peak = 0;
for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(buf[i]));
const gain = 0.72 / peak;
const pcm = Buffer.alloc(N * 2);
for (let i = 0; i < N; i++) pcm.writeInt16LE(Math.round(buf[i] * gain * 32767), i * 2);

// WAV 헤더
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + pcm.length, 4);
header.write("WAVE", 8);
header.write("fmt ", 12);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);      // PCM
header.writeUInt16LE(1, 22);      // mono
header.writeUInt32LE(SR, 24);
header.writeUInt32LE(SR * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(pcm.length, 40);

const out = path.join(import.meta.dirname, "..", "assets", "bgm", "serene.wav");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, Buffer.concat([header, pcm]));
console.log(`✅ ${out} (${((44 + pcm.length) / 1024 / 1024).toFixed(2)}MB, ${DUR.toFixed(1)}s 루프)`);
