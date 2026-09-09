import type { RitualType } from "./charms";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(
  freq: number,
  startAt: number,
  duration: number,
  opts: { type?: OscillatorType; gain?: number; sweepTo?: number; detune?: number } = {},
) {
  const audio = getCtx();
  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(freq, startAt);
  if (opts.sweepTo) {
    osc.frequency.exponentialRampToValueAtTime(opts.sweepTo, startAt + duration);
  }
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, startAt);

  const peak = opts.gain ?? 0.18;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

function playWard() {
  const t = getCtx().currentTime;
  tone(720, t, 0.16, { type: "triangle", sweepTo: 260, gain: 0.16 });
  tone(1080, t + 0.03, 0.1, { type: "sine", gain: 0.07 });
}

function playBless() {
  const t = getCtx().currentTime;
  tone(392, t, 0.32, { type: "sine", gain: 0.14 });
  tone(523.25, t + 0.09, 0.36, { type: "sine", gain: 0.15 });
  tone(659.25, t + 0.02, 0.5, { type: "sine", gain: 0.05 });
}

function playSparkle() {
  const t = getCtx().currentTime;
  const notes = [880, 1108.7, 1318.5, 1760];
  notes.forEach((f, i) => tone(f, t + i * 0.045, 0.14, { type: "sine", gain: 0.08 }));
}

function playChime() {
  const t = getCtx().currentTime;
  tone(660, t, 1.1, { type: "sine", gain: 0.16 });
  tone(660 * 2.02, t, 0.9, { type: "sine", gain: 0.05 });
  tone(660 * 2.76, t, 0.7, { type: "sine", gain: 0.03 });
}

export function playRitualSound(ritual: RitualType) {
  try {
    if (ritual === "ward") playWard();
    else if (ritual === "bless") playBless();
    else if (ritual === "sparkle") playSparkle();
    else if (ritual === "chime") playChime();
  } catch {
    // audio unsupported/blocked — fail silently
  }
}
