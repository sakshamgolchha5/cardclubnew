/** Tiny synthesized sound effects (no audio files): a card click, a "your turn" ping, win / lose jingles, a hint chime. Sound and vibration share one switch in Settings. */
let ctx: AudioContext | null = null;
export const soundOn = () => { try { return localStorage.getItem('cca.sound') !== 'off'; } catch { return true; } };
export const setSound = (on: boolean) => { try { localStorage.setItem('cca.sound', on ? 'on' : 'off'); } catch { /* ignore */ } };
const audio = (): AudioContext | null => {
  if (!soundOn()) return null;
  try { if (!ctx) { const C = (window as any).AudioContext || (window as any).webkitAudioContext; if (!C) return null; ctx = new C(); } if (ctx!.state === 'suspended') void ctx!.resume(); return ctx; } catch { return null; }
};
function tone(freq: number, dur: number, { type = 'sine' as OscillatorType, vol = 0.06, at = 0, to = 0 } = {}) {
  const a = audio(); if (!a) return;
  try {
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + at;
    o.type = type; o.frequency.setValueAtTime(freq, t); if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.02);
  } catch { /* audio blocked */ }
}
export const buzz = (ms: number) => { try { if (soundOn()) navigator.vibrate?.(ms); } catch { /* not supported */ } };
export const sfx = {
  click: () => tone(900, 0.05, { type: 'triangle', vol: 0.04, to: 500 }),
  turn: () => { tone(660, 0.12, { vol: 0.05 }); tone(880, 0.16, { vol: 0.05, at: 0.1 }); },
  hint: () => { tone(784, 0.1, { vol: 0.05 }); tone(1175, 0.18, { vol: 0.05, at: 0.09 }); },
  coin: () => { tone(988, 0.07, { type: 'square', vol: 0.03 }); tone(1319, 0.14, { type: 'square', vol: 0.03, at: 0.07 }); },
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, { vol: 0.06, at: i * 0.12 })),
  lose: () => [392, 330, 262].forEach((f, i) => tone(f, 0.26, { type: 'triangle', vol: 0.05, at: i * 0.14 })),
};
