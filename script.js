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
let currentBlessing = blessings.indexOf(blessingText?.textContent.trim());

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

blessingButton?.addEventListener("click", () => {
  blessingText.textContent = pickBlessing();
  createPetalBurst(blessingButton);
});
