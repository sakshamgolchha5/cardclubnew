// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import App from '../src/App';
import { MissionsPanel } from '../src/Missions';
import { ACHIEVEMENTS, ALL_GAMES, TEMPLATES, dayKey, loadProgress, missionsFor, recordMatch } from '../src/progress';
import { GAMES } from '../src/games/registry';

const coins = () => JSON.parse(localStorage.getItem('cca.coins') ?? '120') as number;
const D = (s: string) => new Date(`${s}T12:00:00`);
beforeEach(() => { localStorage.clear(); cleanup(); });

describe('daily missions', () => {
  it('everyone gets the same 3 different missions on a day, and they change from day to day', () => {
    const a = missionsFor('2026-10-25'), b = missionsFor('2026-10-25'), c = missionsFor('2026-10-26');
    expect(a).toEqual(b); expect(new Set(a.map(m => m.id)).size).toBe(3); expect(a.every(m => TEMPLATES.some(t => t.id === m.id))).toBe(true);
    const days = ['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29']; expect(new Set(days.map(d => missionsFor(d).map(m => m.id).join())).size).toBeGreaterThan(1); expect(c.length).toBe(3);
  });
  it('counts matches, pays the reward once and never twice', () => {
    localStorage.setItem('cca.progress', JSON.stringify({ stats: { played: 0, won: 0, byGame: {}, bigWins: 0, streak: 0, bestStreak: 0, lastDay: '', missionsDone: 0 }, achievements: {}, day: '2026-10-25', missions: [{ id: 'play2', progress: 0, done: false }, { id: 'win1', progress: 0, done: false }, { id: 'room', progress: 0, done: false }], todayGames: [] }));
    const now = D('2026-10-25'); localStorage.setItem('cca.coins', '100');
    const r1 = recordMatch({ game: 'hearts', place: 1, players: 4, mode: 'bots' }, now);
    expect(r1.lines.some(l => l.includes('Win a match'))).toBe(true);
    const r2 = recordMatch({ game: 'hearts', place: 3, players: 4, mode: 'bots' }, now);
    expect(r2.lines.some(l => l.includes('Finish 2 matches'))).toBe(true); expect(r2.lines.filter(l => l.includes('Win a match')).length).toBe(0);
    const p = loadProgress(now); expect(p.missions.find(m => m.id === 'room')!.progress).toBe(0);
    recordMatch({ game: 'bluff', place: 2, players: 3, mode: 'room' }, now); expect(loadProgress(now).missions.find(m => m.id === 'room')!.done).toBe(true);
  });
});
describe('streaks and achievements', () => {
  it('a streak grows on consecutive days and restarts after a gap; playing twice in a day counts once', () => {
    const play = (d: string) => recordMatch({ game: 'hearts', place: 4, players: 4, mode: 'bots' }, D(d));
    play('2026-10-20'); play('2026-10-20'); expect(loadProgress(D('2026-10-20')).stats.streak).toBe(1);
    play('2026-10-21'); play('2026-10-22'); const s = loadProgress(D('2026-10-22')).stats; expect(s.streak).toBe(3); expect(s.bestStreak).toBe(3);
    expect(loadProgress(D('2026-10-22')).achievements['streak-3']).toBeTruthy();
    play('2026-10-25'); const t = loadProgress(D('2026-10-25')).stats; expect(t.streak).toBe(1); expect(t.bestStreak).toBe(3);
  });
  it('unlocks achievements once, pays their coins, and tracks different games', () => {
    localStorage.setItem('cca.coins', '0'); const now = D('2026-10-25');
    const first = recordMatch({ game: 'callbreak', place: 1, players: 4, mode: 'bots' }, now);
    expect(first.lines.filter(l => l.startsWith('Achievement')).map(l => l.split(':')[1].split('·')[0].trim())).toEqual(expect.arrayContaining(['Welcome to the table', 'First win']));
    expect(coins()).toBe(first.coins); const again = recordMatch({ game: 'callbreak', place: 1, players: 4, mode: 'bots' }, now);
    expect(again.lines.some(l => l.includes('First win'))).toBe(false);
    for (const g of ['hearts', 'bluff', 'seven', 'yaniv']) recordMatch({ game: g, place: 2, players: 4, mode: 'bots' }, now);
    expect(loadProgress(now).achievements['games-5']).toBeTruthy();
    recordMatch({ game: 'spoons', place: 1, players: 6, mode: 'bots' }, now); expect(loadProgress(now).achievements['crowd-win']).toBeTruthy();
  });
  it('the "all games" achievement matches the real number of games', () => { expect(ALL_GAMES).toBe(GAMES.length); expect(ACHIEVEMENTS.length).toBe(12); expect(new Set(ACHIEVEMENTS.map(a => a.id)).size).toBe(12); });
});
describe('screens', () => {
  it('the Missions tab shows the streak, three missions and every achievement', () => {
    render(<MissionsPanel />); expect(screen.getByText(/DAILY STREAK/)).toBeTruthy(); expect(document.querySelectorAll('.mission').length).toBe(3); expect(document.querySelectorAll('.ach').length).toBe(12);
  });
  it('is a tab in the menu next to the others', () => {
    render(<App />); fireEvent.click(screen.getAllByRole('button', { name: /Missions/ })[0]);
    expect(screen.getByRole('heading', { name: 'Daily missions' })).toBeTruthy(); expect(document.querySelectorAll('.mission').length).toBe(3);
    fireEvent.click(screen.getAllByRole('button', { name: /Settings/ })[0]); expect(screen.queryByRole('heading', { name: 'Daily missions' })).toBeNull();
  });
  it('a day key is stable', () => { expect(dayKey(D('2026-01-05'))).toBe('2026-01-05'); });
});
