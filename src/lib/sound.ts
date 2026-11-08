// Short UI sounds (Epidemic Sound). Every play restarts the sound, so quick repeat taps each
// get one.
//   copy   — click when something is copied (95ms)
//   select — bubbly select for tools, contacts and "View my work" (0.2s, mastered ~7dB
//            quieter than the click, so it plays at full volume to sit at a similar level)
//   open   — dull confirm click when a video card is pressed to open it (0.32s)
//
// Played through the Web Audio API from buffers decoded ahead of time. <audio> elements add
// noticeable latency on phones (and fetch the file on the first tap), so the sound lagged the
// touch; a decoded buffer starts within a few milliseconds. Falls back to <audio> where the
// Web Audio API is unavailable or the buffers aren't ready yet.

const SOUNDS = {
  copy: { src: "/sounds/copy-click.mp3", volume: 0.6 },
  select: { src: "/sounds/select-bubbly.mp3", volume: 1 },
  open: { src: "/sounds/open-confirm.mp3", volume: 0.7 },
} as const;

type SoundName = keyof typeof SOUNDS;

let ctx: AudioContext | null = null;
const buffers: Partial<Record<SoundName, AudioBuffer>> = {};
let loading: Promise<void> | null = null;
const fallback: Partial<Record<SoundName, HTMLAudioElement>> = {};

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  // Phones start the context suspended until a user gesture; resuming inside the tap unlocks it
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function preload() {
  if (loading) return loading;
  const audio = getContext();
  if (!audio) return null;
  loading = Promise.all(
    (Object.keys(SOUNDS) as SoundName[]).map(async (name) => {
      const res = await fetch(SOUNDS[name].src);
      buffers[name] = await audio.decodeAudioData(await res.arrayBuffer());
    })
  )
    .then(() => {})
    .catch(() => {
      loading = null; // allow a retry on the next interaction
    });
  return loading;
}

// Decode the (tiny) files as soon as the page is idle, and unlock audio on the very first touch,
// so even the first tap plays without delay
if (typeof window !== "undefined") {
  const warm = () => preload();
  window.addEventListener("pointerdown", warm, { once: true, capture: true, passive: true });
  window.addEventListener("keydown", warm, { once: true, capture: true });
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (idle) idle(warm);
  else setTimeout(warm, 1500);
}

export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  const audio = getContext();
  const buffer = buffers[name];
  if (audio && buffer) {
    const source = audio.createBufferSource();
    const gain = audio.createGain();
    gain.gain.value = SOUNDS[name].volume;
    source.buffer = buffer;
    source.connect(gain).connect(audio.destination);
    source.start(0);
    return;
  }

  // Not decoded yet (or no Web Audio): plain <audio>, and start decoding for next time
  preload();
  let el = fallback[name];
  if (!el) {
    el = new Audio(SOUNDS[name].src);
    el.volume = SOUNDS[name].volume;
    fallback[name] = el;
  }
  el.currentTime = 0;
  // Browsers only allow sound in response to a tap or click; stay quiet if it's refused
  el.play().catch(() => {});
}

export const playCopySound = () => playSound("copy");
export const playSelectSound = () => playSound("select");
export const playOpenSound = () => playSound("open");
