const blessings = [
  "愿你提笔从容，落笔有光，每一步都算数。",
  "把心放稳，把题看清，你比想象中更有力量。",
  "祝你会的全对，蒙的有运，难的也能拆出方向。",
  "愿所有伏案的清晨，都变成考场上的底气。",
  "先做会做的，稳住能拿的，剩下的交给勇气。",
  "别急，别慌，你已经把路走到这里，就继续向前。",
  "愿你笔下有山河，眼里有星光，心里有答案。",
  "今天的你只管认真，明天的风会把好消息送来。",
  "愿你合上笔盖的那一刻，有战士收刀入鞘的从容。",
  "金榜题名不是偶然，是你一次次坚持后的回响。"
];

const burstGlyphs = ["金", "榜", "题", "名", "稳", "冲", "光", "愿"];
const burstColors = ["#ffe9a6", "#d89b26", "#fff8ea", "#ffcf6b"];
const blessingButton = document.querySelector("#blessingButton");
const blessingText = document.querySelector("#blessingText");
const musicButton = document.querySelector("#musicButton");
const musicButtonText = musicButton?.querySelector(".music-button__text");
let currentBlessing = blessings.indexOf(blessingText?.textContent.trim());
let audioContext;
let masterGain;
let melodyTimer;
let melodyIndex = 0;
let musicPlaying = false;

const melody = [
  { frequency: 523.25, duration: 0.52, volume: 0.08 },
  { frequency: 659.25, duration: 0.52, volume: 0.07 },
  { frequency: 783.99, duration: 0.72, volume: 0.07 },
  { frequency: 659.25, duration: 0.52, volume: 0.06 },
  { frequency: 587.33, duration: 0.52, volume: 0.07 },
  { frequency: 698.46, duration: 0.52, volume: 0.06 },
  { frequency: 880, duration: 0.82, volume: 0.06 },
  { frequency: 783.99, duration: 0.72, volume: 0.06 }
];

function pickBlessing() {
  let next = currentBlessing;

  while (next === currentBlessing) {
    next = Math.floor(Math.random() * blessings.length);
  }

  currentBlessing = next;
  return blessings[next];
}

function createPetalBurst(origin) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduceMotion) {
    return;
  }

  const rect = origin.getBoundingClientRect();
  const startX = rect.left + rect.width / 2;
  const startY = rect.top + rect.height / 2;

  burstGlyphs.forEach((glyph, index) => {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * index) / burstGlyphs.length - Math.PI / 2;
    const distance = 68 + Math.random() * 46;

    particle.className = "petal";
    particle.textContent = glyph;
    particle.style.setProperty("--x", `${startX}px`);
    particle.style.setProperty("--y", `${startY}px`);
    particle.style.setProperty("--dx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--dy", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--rotate", `${Math.floor(Math.random() * 120 - 60)}deg`);
    particle.style.setProperty("--petal-color", burstColors[index % burstColors.length]);
    particle.style.fontSize = `${17 + Math.random() * 9}px`;

    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 950);
  });
}

function updateMusicButton() {
  if (!musicButton || !musicButtonText) {
    return;
  }

  musicButton.setAttribute("aria-pressed", String(musicPlaying));
  musicButton.setAttribute("aria-label", musicPlaying ? "关闭背景音乐" : "开启背景音乐");
  musicButtonText.textContent = musicPlaying ? "关闭背景音乐" : "开启背景音乐";
}

function ensureAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("AudioContext unavailable");
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    masterGain.connect(audioContext.destination);
  }
}

function playSoftNote(frequency, startTime, duration, volume) {
  const oscillator = audioContext.createOscillator();
  const noteGain = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, startTime);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1600, startTime);
  noteGain.gain.setValueAtTime(0.0001, startTime);
  noteGain.gain.exponentialRampToValueAtTime(volume, startTime + 0.06);
  noteGain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(filter);
  filter.connect(noteGain);
  noteGain.connect(masterGain);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.04);
}

function scheduleMelody() {
  if (!audioContext || !masterGain || !musicPlaying) {
    return;
  }

  const note = melody[melodyIndex % melody.length];
  const startTime = audioContext.currentTime + 0.04;

  playSoftNote(note.frequency, startTime, note.duration, note.volume);

  if (melodyIndex % 4 === 0) {
    playSoftNote(note.frequency / 2, startTime, 1.9, 0.032);
  }

  melodyIndex += 1;
}

async function startMusic() {
  try {
    ensureAudioContext();

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    musicPlaying = true;
    updateMusicButton();
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), audioContext.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.16, audioContext.currentTime + 0.7);
    scheduleMelody();
    window.clearInterval(melodyTimer);
    melodyTimer = window.setInterval(scheduleMelody, 620);
  } catch {
    if (musicButtonText) {
      musicButtonText.textContent = "当前浏览器不支持音乐";
    }
    musicButton?.setAttribute("aria-label", "当前浏览器不支持音乐");
    musicButton?.setAttribute("disabled", "");
  }
}

function stopMusic() {
  window.clearInterval(melodyTimer);
  musicPlaying = false;
  updateMusicButton();

  if (audioContext && masterGain) {
    masterGain.gain.cancelScheduledValues(audioContext.currentTime);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value, 0.0001), audioContext.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.45);
  }
}

blessingButton?.addEventListener("click", () => {
  blessingText.textContent = pickBlessing();
  createPetalBurst(blessingButton);
});

musicButton?.addEventListener("click", () => {
  if (musicPlaying) {
    stopMusic();
    return;
  }

  startMusic();
});
