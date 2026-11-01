import type { Card } from '../../engine/cards';
import type { Level } from '../types';
import { Action, State, legalPlays } from './engine';

export function chooseAction(v: State, seat: number, level: Level, rng: () => number): Action {
  const plays = legalPlays(v, seat);
  if (plays.length === 1) return { type: 'play', card: plays[0] };
  const asc = [...plays].sort((a, b) => a.rank - b.rank), hand = v.hands[seat], cnt = (s: number) => hand.filter(c => c.suit === s).length;
  const play = (card: Card): Action => ({ type: 'play', card });
  if (!v.trick.length) {   // vary the lead suit so the same player does not keep collecting cuts
    const suits = [...new Set(plays.map(c => c.suit))], suit = suits[Math.floor(rng() * suits.length)];
    return play(asc.filter(c => c.suit === suit)[0]);
  }
  const led = v.trick[0].card.suit, follow = asc.filter(c => c.suit === led);
  if (!follow.length) return play(asc[0]);                         // you cannot follow, so shed the lowest card without giving away a high card
  const top = Math.max(...v.trick.filter(t => t.card.suit === led).map(t => t.card.rank)), under = follow.filter(c => c.rank < top);
  return play(under.length ? under[0] : follow[0]);                // stay under the highest card with the smallest card possible
}
