import type { Card } from '../../engine/cards';
import type { Level } from '../types';
import { Action, State, value } from './engine';

/** Bots only use what they know: their own known cards and anything they peeked at. */
export function chooseAction(v: State, seat: number, level: Level, rng: () => number): Action {
  const mine = v.know[seat], n = v.config.players, ri = (k: number) => Math.floor(rng() * k);
  const known = mine.map((c, i) => (c ? { c, i } : null)).filter(Boolean) as { c: Card; i: number }[], unknown = mine.map((c, i) => (c ? -1 : i)).filter(i => i >= 0);
  const est = known.reduce((a, k) => a + value(k.c), 0) + unknown.length * 6;
  if (v.step === 'opening') return { type: 'openingDone' };
  if (v.step === 'challenge') {
    const indexes = mine.flatMap((c, i) => c?.rank === v.challenge?.card.rank ? [i] : []);
    return indexes.length ? { type: 'match', indexes } : { type: 'passMatch' };
  }
  if (v.step === 'start') {
    const call = v.caller === null && (level === 'easy' ? est <= 4 && rng() < 0.3 : level === 'medium' ? est <= 8 && unknown.length <= 1 : est <= 9 && unknown.length === 0 || est <= 5);
    return call ? { type: 'cabo' } : { type: 'take' };
  }
  if (v.step === 'drawn') {
    const d = v.drawn!, dv = value(d);
    if (!mine.length) return { type: 'dump' };
    if (level === 'easy') return rng() < 0.4 ? { type: 'swap', index: ri(mine.length) } : { type: 'dump' };
    const worst = known.sort((a, b) => value(b.c) - value(a.c))[0];
    if (worst && dv + 2 <= value(worst.c)) return { type: 'swap', index: worst.i };          // a known high card is worth replacing
    if (unknown.length && dv <= 4) return { type: 'swap', index: unknown[ri(unknown.length)] }; // a low card beats a mystery card
    return { type: 'dump' };
  }
  if (v.step === 'seen') return { type: 'done' };
  if (v.power === 'peekSwap') { const opp = [...Array(n).keys()].filter(i => i !== seat && v.handSizes[i] > 0); if (!opp.length) return { type: 'skip' }; const target = opp[ri(opp.length)]; return { type: 'spy', seat: target, index: ri(v.handSizes[target]) }; }
  if (v.power === 'swap' && v.tradeTarget) {
    const worst = known.sort((a, b) => value(b.c) - value(a.c))[0];
    return worst ? { type: 'trade', mine: worst.i, seat: v.tradeTarget.seat, index: v.tradeTarget.index } : { type: 'skip' };
  }
  if (v.power === 'self') return unknown.length ? { type: 'peek', index: unknown[ri(unknown.length)] } : { type: 'skip' };
  if (v.power === 'other') { const opp = [...Array(n).keys()].filter(i => i !== seat && v.handSizes[i] > 0); if (!opp.length || (level === 'easy' && rng() < 0.3)) return { type: 'skip' }; const target = opp[ri(opp.length)]; return { type: 'spy', seat: target, index: ri(v.handSizes[target]) }; }
  // J / Q: trade my worst known card for an unseen one
  const worst = known.sort((a, b) => value(b.c) - value(a.c))[0];
  if (level === 'easy' || !worst || value(worst.c) < 8) {
    const opp = [...Array(n).keys()].filter(i => i !== seat && v.handSizes[i] > 0); if (!opp.length) return { type: 'skip' }; const target = opp[ri(opp.length)];
    return level === 'easy' && rng() < 0.5 ? { type: 'skip' } : worst && value(worst.c) >= 8 ? { type: 'trade', mine: worst.i, seat: target, index: ri(v.handSizes[target]) } : { type: 'skip' };
  }
  const opp = [...Array(n).keys()].filter(i => i !== seat && v.handSizes[i] > 0); if (!opp.length) return { type: 'skip' }; const target = opp[ri(opp.length)];
  return { type: 'trade', mine: worst.i, seat: target, index: ri(v.handSizes[target]) };
}
