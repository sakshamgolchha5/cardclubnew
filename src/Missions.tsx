import { useMemo } from 'react';
import { ACHIEVEMENTS, TEMPLATES, loadProgress } from './progress';

/** The Missions tab: today's streak and three missions, then the achievements. */
export function MissionsPanel() {
  const p = useMemo(() => loadProgress(), []), s = p.stats, unlocked = ACHIEVEMENTS.filter(a => p.achievements[a.id]).length;
  return (
    <div className="missions">
      <section className="hub-panel streak-card"><div><p className="eyebrow">DAILY STREAK</p><h2>{s.streak > 0 && s.lastDay === p.day ? `${s.streak} day${s.streak === 1 ? '' : 's'} in a row` : 'Play a match today to keep going'}</h2><small>Best streak: {s.bestStreak} · Matches played: {s.played} · Won: {s.won}</small></div><div className="streak-flame" aria-hidden="true">{Math.max(s.streak, 0)}</div></section>
      <section className="hub-panel"><p className="eyebrow">TODAY'S MISSIONS</p>
        <div className="mission-list">{p.missions.map(m => { const t = TEMPLATES.find(x => x.id === m.id)!; return (
          <div key={m.id} className={`mission ${m.done ? 'done' : ''}`}><span className="mission-tick" aria-hidden="true">{m.done ? '✓' : ''}</span><span className="mission-main"><b>{t.title}</b><i><u style={{ width: `${Math.round((m.progress / t.target) * 100)}%` }} /></i><small>{m.progress} / {t.target}</small></span><span className="mission-reward">◈ {t.reward}</span></div>); })}</div>
        <small className="hint-line">New missions every day. Coins are added the moment you finish a mission.</small></section>
      <section className="hub-panel"><p className="eyebrow">ACHIEVEMENTS · {unlocked} / {ACHIEVEMENTS.length}</p>
        <div className="ach-grid">{ACHIEVEMENTS.map(a => { const got = p.achievements[a.id]; return (
          <div key={a.id} className={`ach ${got ? 'got' : ''}`}><span className="ach-icon" aria-hidden="true">{got ? a.icon : '🔒'}</span><span><b>{a.title}</b><small>{a.desc}</small></span><em>{got ? 'Unlocked' : `◈ ${a.reward}`}</em></div>); })}</div></section>
    </div>
  );
}
