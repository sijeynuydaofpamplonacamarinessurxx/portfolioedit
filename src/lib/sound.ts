// Short UI sounds (Epidemic Sound). Each is loaded once on first use; every play restarts
// it so quick repeat taps each get a sound.
//   copy   — click when something is copied (95ms)
//   select — bubbly select for tools, contacts and "View my work" (0.2s, mastered ~7dB
//            quieter than the click, so it plays at full volume to sit at a similar level)
//   open   — dull confirm click when a video card is pressed to open it (0.32s)

const SOUNDS = {
  copy: { src: "/sounds/copy-click.mp3", volume: 0.6 },
  select: { src: "/sounds/select-bubbly.mp3", volume: 1 },
  open: { src: "/sounds/open-confirm.mp3", volume: 0.7 },
} as const;

type SoundName = keyof typeof SOUNDS;

const cache: Partial<Record<SoundName, HTMLAudioElement>> = {};

export function playSound(name: SoundName) {
  if (typeof window === "undefined") return;
  let audio = cache[name];
  if (!audio) {
    audio = new Audio(SOUNDS[name].src);
    audio.volume = SOUNDS[name].volume;
    cache[name] = audio;
  }
  audio.currentTime = 0;
  // Browsers only allow sound in response to a click; stay quiet if it's refused
  audio.play().catch(() => {});
}

export const playCopySound = () => playSound("copy");
export const playSelectSound = () => playSound("select");
export const playOpenSound = () => playSound("open");
