import { rankLabel, SUIT_SYMBOLS, type Card } from './engine/cards';
import type { GAction, GameDef } from './games/types';

export interface Hint { text: string; cards: Card[] }
const name = (c: Card) => `${rankLabel(c.rank)}${SUIT_SYMBOLS[c.suit]}`;
const list = (cs: Card[]) => cs.map(name).join(' ');
/** Plain-English version of an action, plus the cards to highlight. */
export function describeAction(a: GAction): Hint {
  const x = a as any, cards: Card[] = x.card ? [x.card] : Array.isArray(x.cards) ? x.cards : [];
  switch (a.type) {
    case 'bid': return { text: `Try bidding ${x.n}`, cards };
    case 'play': return { text: `Play ${name(x.card)}`, cards };
    case 'throw': return { text: `Throw ${name(x.card)}`, cards };
    case 'show': return { text: `Show with ${name(x.card)} - your hand looks complete`, cards };
    case 'pass': return { text: `Pass ${list(cards)}`, cards };
    case 'give': return { text: `Give ${name(x.card)}`, cards };
    case 'hide': return { text: `Set ${name(x.card)} aside as the hidden trump`, cards };
    case 'trump': return { text: `Choose ${SUIT_SYMBOLS[x.suit]} as trump`, cards: [] };
    case 'claim': return { text: `Play ${cards.length} card${cards.length === 1 ? '' : 's'} as ${rankLabel(x.rank)}s`, cards };
    case 'set': return { text: `Play ${list(cards)}`, cards };
    case 'discard': return { text: `Discard ${list(cards)}`, cards };
    case 'return': return { text: `Give back ${list(cards)}`, cards };
    case 'call': return { text: 'Call their bluff', cards: [] };
    case 'skip': return { text: 'Pass this turn', cards: [] };
    case 'draw': return { text: `Pick card number ${x.index + 1}`, cards: [] };
    case 'stock': case 'drawDeck': case 'take': return { text: 'Draw from the deck', cards: [] };
    case 'open': return { text: 'Take the open card', cards: [] };
    case 'drawDiscard': return { text: `Take the ${x.end} discard`, cards: [] };
    case 'yaniv': return { text: 'Call Yaniv!', cards: [] };
    case 'cabo': return { text: 'Call Cambrio', cards: [] };
    case 'swap': return { text: `Swap with card ${x.index + 1}`, cards: [] };
    case 'dump': return { text: 'Discard the card you drew', cards: [] };
    case 'peek': return { text: `Peek at your card ${x.index + 1}`, cards: [] };
    case 'spy': return { text: 'Spy on another player\'s card', cards: [] };
    case 'trade': return { text: 'Trade one of your cards blindly', cards: [] };
    case 'drop': return { text: 'Drop this deal', cards: [] };
    case 'pick': return { text: `Pass your card number ${x.index + 1}`, cards };
    case 'grab': return { text: 'Grab a spoon NOW!', cards: [] };
    case 'done': return { text: 'Continue', cards: [] };
    default: return { text: 'Try the highlighted option', cards: [] };
  }
}
/** The bot at its strongest, looking at only what you can see, suggests the move. */
export function hintFor(def: GameDef, view: any, seat: number, rng: () => number = Math.random): Hint | null {
  try { return describeAction(def.chooseAction(view, seat, 'hard', rng)); } catch { return null; }
}
/** A hint is never free: it costs about twice what winning a game pays (1st place earns 100 + 15). */
export const HINT_COST = 200;
