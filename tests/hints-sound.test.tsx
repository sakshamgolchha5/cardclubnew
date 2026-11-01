// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act, fireEvent, cleanup, screen } from '@testing-library/react';
import App from '../src/App';
import { describeAction, hintFor, HINT_COST } from '../src/hints';
import { sfx, soundOn, setSound, buzz } from '../src/sound';
import { byId, GAMES } from '../src/games/registry';
import { parseCards } from '../src/engine/cards';

beforeEach(() => { localStorage.clear(); cleanup(); });
describe('hint wording', () => {
  it('turns every kind of action into a plain sentence and the cards to highlight', () => {
    const c = parseCards('QS')[0];
    expect(describeAction({ type: 'play', card: c })).toEqual({ text: 'Play Q♠', cards: [c] });
    expect(describeAction({ type: 'bid', n: 3 }).text).toBe('Try bidding 3');
    expect(describeAction({ type: 'claim', cards: [c, c], rank: 7 }).text).toBe('Play 2 cards as 7s');
    expect(describeAction({ type: 'show', card: c }).text).toContain('complete');
    expect(describeAction({ type: 'stock' }).text).toBe('Draw from the deck'); expect(describeAction({ type: 'yaniv' }).text).toBe('Call Yaniv!');
    for (const t of ['call', 'skip', 'ask', 'grab', 'done', 'drop', 'cabo', 'dump', 'open'] as const) expect(describeAction({ type: t } as any).text.length).toBeGreaterThan(3);
  });
  it('every one of the games can suggest a move', () => {
    for (const def of GAMES) {
      const cfg = Object.fromEntries(def.options.map(o => [o.key, o.def])), s = def.create(cfg, 5), seat = s.turn >= 0 ? s.turn : 0;
      const h = hintFor(def, def.view(s, seat), seat); expect(h, def.id).not.toBeNull(); expect(h!.text.length, def.id).toBeGreaterThan(3);
    }
    expect(GAMES.length).toBe(15);
  });
  it('costs twice what a first-place finish earns', () => { expect(HINT_COST).toBe(200); expect(HINT_COST).toBeGreaterThanOrEqual(2 * 100); });
});
describe('sound', () => {
  it('is on by default, can be switched off, and never throws without audio support', () => {
    expect(soundOn()).toBe(true); setSound(false); expect(soundOn()).toBe(false); setSound(true);
    expect(() => { sfx.click(); sfx.turn(); sfx.hint(); sfx.coin(); sfx.win(); sfx.lose(); buzz(20); }).not.toThrow();
  });
});
describe('hints in a real game', () => {
  const play = (n: number) => { for (let i = 0; i < n; i++) act(() => { vi.advanceTimersByTime(150); }); };
  const open = (coins: number) => {
    vi.useFakeTimers(); localStorage.setItem('cca.coins', JSON.stringify(coins));
    const r = render(<App />), c = r.container, byText = (sel: string, t: string) => [...c.querySelectorAll(sel)].find(e => e.textContent?.includes(t));
    fireEvent.click([...c.querySelectorAll('.game-card')].find(el => el.textContent?.includes('Callbreak'))!.querySelector('.game-launch')!); fireEvent.click(byText('button', 'Fast')!); fireEvent.click(byText('button', 'Start match')!);
    for (let i = 0; i < 400 && !c.querySelector('.hint-btn'); i++) play(1);
    return c;
  };
  it('is never free: the first tap asks, the second tap spends 200 coins and shows the advice', () => {
    const c = open(450); expect(c.querySelector('.yourturn')).toBeTruthy(); expect(c.querySelector('.hint-btn')!.textContent).toContain('200');
    fireEvent.click(c.querySelector('.hint-btn')!); expect(c.querySelector('.hint-btn')!.textContent).toContain('Spend 200'); expect(c.querySelector('.hint-toast')).toBeNull(); expect(JSON.parse(localStorage.getItem('cca.coins')!)).toBe(450);
    fireEvent.click(c.querySelector('.hint-btn')!); expect(c.querySelector('.hint-toast')!.textContent).toMatch(/bidding/i); expect(JSON.parse(localStorage.getItem('cca.coins')!)).toBe(250);
    vi.useRealTimers();
  });
  it('the confirmation fades after a few seconds without spending anything', () => {
    const c = open(450); fireEvent.click(c.querySelector('.hint-btn')!); play(40); expect(c.querySelector('.hint-btn')!.textContent).not.toContain('Spend'); expect(JSON.parse(localStorage.getItem('cca.coins')!)).toBe(450); vi.useRealTimers();
  });
  it('without enough coins you are told what it costs and nothing is spent', () => {
    const c = open(120); fireEvent.click(c.querySelector('.hint-btn')!); expect(c.querySelector('.hint-toast')!.textContent).toMatch(/costs 200 coins and you have 120/); expect(JSON.parse(localStorage.getItem('cca.coins')!)).toBe(120); vi.useRealTimers();
  });
});
describe('settings', () => { it('has a sound switch', () => { render(<App />); fireEvent.click(screen.getAllByRole('button', { name: /Settings/ })[0]); expect(screen.getByLabelText('Sound and vibration')).toBeTruthy(); }); });
