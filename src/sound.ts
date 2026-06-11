// Moteur audio synthétisé : effets sonores + musique d'ambiance générative.
// Tout est généré en WebAudio, aucun asset à charger.

export type SfxKind = "tap" | "win" | "error" | "dice" | "flip" | "drop";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let musicGain: GainNode | null = null;
let soundOn = true;
let musicOn = false;
let musicTimer: number | null = null;
let nextBarTime = 0;
let barIndex = 0;
let noiseBuffer: AudioBuffer | null = null;

const ensureCtx = (): AudioContext | null => {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 1;
    master.connect(ctx.destination);
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => undefined);
  return ctx;
};

const getNoise = (audio: AudioContext) => {
  if (!noiseBuffer) {
    noiseBuffer = audio.createBuffer(1, audio.sampleRate, audio.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  }
  return noiseBuffer;
};

const tone = (
  audio: AudioContext,
  destination: AudioNode,
  options: { freq: number; at: number; dur: number; type?: OscillatorType; vol?: number; glideTo?: number }
) => {
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = options.type || "triangle";
  osc.frequency.setValueAtTime(options.freq, options.at);
  if (options.glideTo) osc.frequency.exponentialRampToValueAtTime(options.glideTo, options.at + options.dur);
  const vol = options.vol ?? 0.05;
  gain.gain.setValueAtTime(0, options.at);
  gain.gain.linearRampToValueAtTime(vol, options.at + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, options.at + options.dur);
  osc.connect(gain);
  gain.connect(destination);
  osc.start(options.at);
  osc.stop(options.at + options.dur + 0.05);
};

const diceRattle = (audio: AudioContext, destination: AudioNode) => {
  const now = audio.currentTime;
  for (let i = 0; i < 6; i += 1) {
    const at = now + i * 0.055 + Math.random() * 0.03;
    const source = audio.createBufferSource();
    source.buffer = getNoise(audio);
    const filter = audio.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 900 + Math.random() * 2200;
    filter.Q.value = 1.6;
    const gain = audio.createGain();
    gain.gain.setValueAtTime(0.09 - i * 0.008, at);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(destination);
    source.start(at, Math.random(), 0.06);
  }
};

export const sfx = (kind: SfxKind) => {
  if (!soundOn) return;
  const audio = ensureCtx();
  if (!audio || !master) return;
  const now = audio.currentTime;
  if (kind === "tap") {
    tone(audio, master, { freq: 420, at: now, dur: 0.07, type: "triangle", vol: 0.045 });
  } else if (kind === "error") {
    tone(audio, master, { freq: 160, at: now, dur: 0.14, type: "square", vol: 0.035 });
  } else if (kind === "win") {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      tone(audio, master!, { freq, at: now + index * 0.09, dur: 0.22, type: "triangle", vol: 0.06 });
      tone(audio, master!, { freq: freq / 2, at: now + index * 0.09, dur: 0.22, type: "sine", vol: 0.03 });
    });
  } else if (kind === "dice") {
    diceRattle(audio, master);
  } else if (kind === "flip") {
    tone(audio, master, { freq: 300, at: now, dur: 0.09, type: "triangle", vol: 0.04, glideTo: 620 });
  } else if (kind === "drop") {
    tone(audio, master, { freq: 520, at: now, dur: 0.11, type: "triangle", vol: 0.05, glideTo: 210 });
  }
};

// --- Musique d'ambiance : boucle d'arpèges douce (do majeur, 4 accords) ---

const chords: number[][] = [
  [261.63, 329.63, 392.0, 523.25],  // C
  [220.0, 261.63, 329.63, 440.0],   // Am
  [174.61, 220.0, 261.63, 349.23],  // F
  [196.0, 246.94, 293.66, 392.0]    // G
];
const bassNotes = [130.81, 110.0, 87.31, 98.0];
const BAR = 2.4;

const scheduleBar = (audio: AudioContext, destination: AudioNode, start: number, bar: number) => {
  const chord = chords[bar % chords.length];
  const bass = bassNotes[bar % bassNotes.length];
  tone(audio, destination, { freq: bass, at: start, dur: BAR * 0.9, type: "sine", vol: 0.045 });
  for (let i = 0; i < 8; i += 1) {
    const note = chord[i % chord.length] * (i >= 4 ? 2 : 1);
    tone(audio, destination, { freq: note, at: start + i * (BAR / 8), dur: 0.34, type: "triangle", vol: 0.022 });
  }
  // petite mélodie une bar sur deux
  if (bar % 2 === 1) {
    const lead = chord[(bar + 1) % chord.length] * 2;
    tone(audio, destination, { freq: lead, at: start + BAR / 2, dur: 0.5, type: "sine", vol: 0.03 });
  }
};

const musicTick = () => {
  if (!ctx || !musicGain || !musicOn) return;
  while (nextBarTime < ctx.currentTime + 1.2) {
    if (nextBarTime < ctx.currentTime) nextBarTime = ctx.currentTime + 0.05;
    scheduleBar(ctx, musicGain, nextBarTime, barIndex);
    nextBarTime += BAR;
    barIndex += 1;
  }
};

const startMusic = () => {
  const audio = ensureCtx();
  if (!audio || !master || musicTimer !== null) return;
  if (!musicGain) {
    musicGain = audio.createGain();
    musicGain.connect(master);
  }
  musicGain.gain.setValueAtTime(0, audio.currentTime);
  musicGain.gain.linearRampToValueAtTime(1, audio.currentTime + 1.2);
  nextBarTime = audio.currentTime + 0.1;
  musicTick();
  musicTimer = window.setInterval(musicTick, 400);
};

const stopMusic = () => {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
  }
  if (ctx && musicGain) {
    musicGain.gain.cancelScheduledValues(ctx.currentTime);
    musicGain.gain.setValueAtTime(musicGain.gain.value, ctx.currentTime);
    musicGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
  }
};

export const configureAudio = (options: { sound: boolean; music: boolean }) => {
  soundOn = options.sound;
  if (options.music !== musicOn) {
    musicOn = options.music;
    if (musicOn) startMusic();
    else stopMusic();
  }
};

// Les navigateurs mobiles exigent un geste utilisateur avant de jouer du son :
// au premier toucher, on (re)démarre le contexte et la musique si activée.
if (typeof document !== "undefined") {
  const unlock = () => {
    const audio = ensureCtx();
    if (audio && musicOn && musicTimer === null) startMusic();
  };
  document.addEventListener("pointerdown", unlock, { passive: true });
}
