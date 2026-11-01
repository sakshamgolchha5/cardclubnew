/** Streaks, daily missions and achievements. Everything lives on the device (localStorage); coins are paid out automatically when a goal is reached. */
export const ALL_GAMES = 15;
export type Mode = 'bots' | 'pass' | 'room';
export interface Stats { played: number; won: number; byGame: Record<string, { played: number; won: number }>; bigWins: number; streak: number; bestStreak: number; lastDay: string; missionsDone: number }
export interface MissionState { id: string; progress: number; done: boolean }
export interface Progress { stats: Stats; achievements: Record<string, string>; day: string; missions: MissionState[]; todayGames: string[] }
export interface Template { id: string; title: string; target: number; reward: number }
export interface Achievement { id: string; title: string; desc: string; icon: string; reward: number; done: (s: Stats) => boolean }
export interface MatchInput { game: string; place: number; players: number; mode: Mode }
export interface MatchOutcome { coins: number; lines: string[] }

export const TEMPLATES: Template[] = [
  { id: 'play2', title: 'Finish 2 matches', target: 2, reward: 30 }, { id: 'play3', title: 'Finish 3 matches', target: 3, reward: 45 },
  { id: 'win1', title: 'Win a match', target: 1, reward: 50 }, { id: 'top2', title: 'Finish in the top 2', target: 1, reward: 30 },
  { id: 'variety2', title: 'Play 2 different games', target: 2, reward: 40 }, { id: 'crowd', title: 'Play a match with 5 or more players', target: 1, reward: 35 },
  { id: 'room', title: 'Play a Room Code match with friends', target: 1, reward: 40 },
];
const played = (s: Stats) => Object.keys(s.byGame).length;
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-match', title: 'Welcome to the table', desc: 'Finish your first match', icon: '♠', reward: 30, done: s => s.played >= 1 },
  { id: 'first-win', title: 'First win', desc: 'Win a match', icon: '★', reward: 50, done: s => s.won >= 1 },
  { id: 'matches-10', title: 'Regular', desc: 'Finish 10 matches', icon: '♥', reward: 60, done: s => s.played >= 10 },
  { id: 'wins-5', title: 'On a roll', desc: 'Win 5 matches', icon: '♦', reward: 100, done: s => s.won >= 5 },
  { id: 'games-5', title: 'Curious', desc: 'Play 5 different games', icon: '?', reward: 60, done: s => played(s) >= 5 },
  { id: 'streak-3', title: 'Three days running', desc: 'Play on 3 days in a row', icon: '3', reward: 75, done: s => s.bestStreak >= 3 },
  { id: 'crowd-win', title: 'Crowd pleaser', desc: 'Win a match with 6 or more players', icon: '♛', reward: 80, done: s => s.bigWins >= 1 },
  { id: 'missions-5', title: 'Daily regular', desc: 'Complete 5 daily missions', icon: '✓', reward: 80, done: s => s.missionsDone >= 5 },
  { id: 'streak-7', title: 'A week at the table', desc: 'Play on 7 days in a row', icon: '7', reward: 200, done: s => s.bestStreak >= 7 },
  { id: 'matches-50', title: 'Club veteran', desc: 'Finish 50 matches', icon: '♣', reward: 250, done: s => s.played >= 50 },
  { id: 'games-all', title: 'Collector of games', desc: `Play all ${ALL_GAMES} games`, icon: '✦', reward: 300, done: s => played(s) >= ALL_GAMES },
  { id: 'wins-25', title: 'Table champion', desc: 'Win 25 matches', icon: '♚', reward: 400, done: s => s.won >= 25 },
];
const DEFAULT_STATS = (): Stats => ({ played: 0, won: 0, byGame: {}, bigWins: 0, streak: 0, bestStreak: 0, lastDay: '', missionsDone: 0 });
export const dayKey = (d: Date = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const yesterdayOf = (d: Date) => { const y = new Date(d); y.setDate(y.getDate() - 1); return dayKey(y); };
/** Same three missions for everyone on a given day (a small seeded shuffle of the templates). */
export function missionsFor(day: string): MissionState[] {
  let seed = [...day].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7); const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 2 ** 32; };
  const pool = [...TEMPLATES]; for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, 3).map(t => ({ id: t.id, progress: 0, done: false }));
}
const read = (): Progress => { try { const p = JSON.parse(localStorage.getItem('cca.progress') ?? 'null'); if (p?.stats) return p; } catch { /* fresh */ } return { stats: DEFAULT_STATS(), achievements: {}, day: '', missions: [], todayGames: [] }; };
const write = (p: Progress) => { try { localStorage.setItem('cca.progress', JSON.stringify(p)); } catch { /* storage full or blocked */ } };
const coinsNow = () => { try { const v = JSON.parse(localStorage.getItem('cca.coins') ?? '120'); return typeof v === 'number' ? v : 120; } catch { return 120; } };
const pay = (n: number) => { try { localStorage.setItem('cca.coins', JSON.stringify(coinsNow() + n)); } catch { /* ignore */ } };
/** Today's progress (starts a fresh set of missions when the day changes). */
export function loadProgress(now: Date = new Date()): Progress {
  const p = read(), day = dayKey(now);
  if (p.day !== day) { p.day = day; p.missions = missionsFor(day); p.todayGames = []; write(p); }
  return p;
}
export function recordMatch(m: MatchInput, now: Date = new Date()): MatchOutcome {
  const p = loadProgress(now), s = p.stats, day = dayKey(now), lines: string[] = []; let coins = 0;
  const won = m.place === 1;
  s.played += 1; if (won) s.won += 1; if (won && m.players >= 6) s.bigWins += 1;
  const g = (s.byGame[m.game] ??= { played: 0, won: 0 }); g.played += 1; if (won) g.won += 1;
  if (s.lastDay !== day) { s.streak = s.lastDay === yesterdayOf(now) ? s.streak + 1 : 1; s.lastDay = day; s.bestStreak = Math.max(s.bestStreak, s.streak); }
  if (!p.todayGames.includes(m.game)) p.todayGames.push(m.game);
  for (const ms of p.missions) {
    if (ms.done) continue; const t = TEMPLATES.find(x => x.id === ms.id)!;
    ms.progress = t.id === 'win1' ? ms.progress + (won ? 1 : 0) : t.id === 'top2' ? ms.progress + (m.place <= 2 ? 1 : 0) : t.id === 'crowd' ? ms.progress + (m.players >= 5 ? 1 : 0)
      : t.id === 'room' ? ms.progress + (m.mode === 'room' ? 1 : 0) : t.id === 'variety2' ? p.todayGames.length : ms.progress + 1;
    if (ms.progress >= t.target) { ms.progress = t.target; ms.done = true; s.missionsDone += 1; coins += t.reward; lines.push(`Mission complete: ${t.title} · +${t.reward} coins`); }
  }
  for (const a of ACHIEVEMENTS) if (!p.achievements[a.id] && a.done(s)) { p.achievements[a.id] = day; coins += a.reward; lines.push(`Achievement unlocked: ${a.title} · +${a.reward} coins`); }
  write(p); if (coins) pay(coins);
  return { coins, lines };
}
