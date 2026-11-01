// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { render } from '@testing-library/react';
import { GameMark } from '../src/GameMark';
import { GAMES } from '../src/games/registry';

const read = (p: string) => readFileSync(p, 'utf8');
const png = (p: string) => { const b = readFileSync(p); return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) }; };
describe('store listing text respects Google Play limits', () => {
  const L = read('docs/play-store/LISTING.md');
  const title = /\*\*App name \(max 30\):\*\* (.+)/.exec(L)![1].trim(), short = /\*\*Short description \(max 80\):\*\* (.+)/.exec(L)![1].trim();
  const long = L.split('## Full description (max 4000)')[1].split("## What's new")[0].trim();
  it('title, short and full description fit', () => { expect(title.length).toBeLessThanOrEqual(30); expect(short.length).toBeLessThanOrEqual(80); expect(long.length).toBeLessThanOrEqual(4000); expect(long.length).toBeGreaterThan(500); });
  it('mentions every game by name and makes no gambling or money claims', () => {
    for (const g of GAMES) expect(long.toLowerCase(), g.name).toContain(g.name.toLowerCase().replace('13-card ', ''));
    expect(long).toMatch(/No real-money gambling/); expect(long.toLowerCase()).not.toMatch(/win real|cash prize|jackpot|casino/);
  });
});
describe('store images are the sizes Google Play asks for', () => {
  it('icon 512, feature graphic 1024x500, phone screenshots 16:9 landscape', () => {
    expect(png('store/icon-512.png')).toEqual({ w: 512, h: 512 }); expect(png('store/feature-graphic-1024x500.png')).toEqual({ w: 1024, h: 500 });
    const shots = ['1-games', '2-callbreak', '3-rummy', '4-spoons', '5-confidence-8', '6-missions', '7-themes'].map(n => `store/phone-${n}.png`);
    for (const s of shots) { const d = png(s); expect(d.w / d.h).toBeCloseTo(16 / 9, 2); expect(Math.min(d.w, d.h)).toBeGreaterThanOrEqual(320); expect(Math.max(d.w, d.h)).toBeLessThanOrEqual(3840); }
    expect(shots.length).toBeGreaterThanOrEqual(2);
  });
});
describe('public legal pages', () => {
  for (const [f, must] of [['privacy', /no ads/i], ['terms', /no cash value/i], ['delete-data', /Clear player data/]] as const)
    it(`${f}.html exists, has contact placeholders to fill, and says the right things`, () => { const h = read(`public/${f}.html`); expect(h).toMatch(must); expect(h).toContain('{{EMAIL}}'); expect(h).toContain('{{PUBLISHER}}'); });
  it('the privacy page is honest about room-code connections and the absence of accounts and ads', () => { const h = read('public/privacy.html'); expect(h).toMatch(/PeerJS/); expect(h).toMatch(/IP address/); expect(h).toMatch(/no accounts/i); expect(h).not.toMatch(/analytics (is|are) used/i); });
  it('has an Android link file placeholder', () => { expect(JSON.parse(read('public/.well-known/assetlinks.json'))).toEqual([]); });
});
describe('Android project', () => {
  const gradle = read('android/app/build.gradle'), vars = read('android/variables.gradle'), manifest = read('android/app/src/main/AndroidManifest.xml'), cap = read('capacitor.config.ts');
  it('uses one app id everywhere and targets the API level Google Play requires (36)', () => {
    const id = /appId: '([^']+)'/.exec(cap)![1]; expect(id).toMatch(/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/); expect(gradle).toContain(`applicationId "${id}"`); expect(gradle).toContain(`namespace = "${id}"`);
    expect(existsSync(`android/app/src/main/java/${id.split('.').join('/')}/MainActivity.java`)).toBe(true);
    expect(Number(/targetSdkVersion = (\d+)/.exec(vars)![1])).toBeGreaterThanOrEqual(36); expect(Number(/compileSdkVersion = (\d+)/.exec(vars)![1])).toBeGreaterThanOrEqual(36);
  });
  it('is landscape-only, full-screen, asks only for the Internet permission, and starts at version 1', () => {
    expect(manifest).toContain('sensorLandscape'); expect(manifest.match(/uses-permission/g)!.length).toBe(1); expect(manifest).toContain('android.permission.INTERNET'); expect(gradle).toMatch(/versionCode 1/);
    expect(read('android/app/src/main/res/values/styles.xml')).toContain('windowFullscreen');
  });
  it('the cloud build workflow runs the tests, builds the web app and syncs it', () => { const w = read('.github/workflows/android.yml'); expect(w).toContain('npm test'); expect(w).toContain('cap sync android'); expect(w).toContain('bundleRelease'); expect(read('.gitignore')).toMatch(/\*\.keystore/); });
});
describe('every game has its own illustrated icon', () => {
  it('renders a different drawing for each of the 15 games', () => {
    const seen = new Map<string, string>();
    for (const g of GAMES) { const { container } = render(<GameMark gameId={g.id} />), svg = container.querySelector('svg')!.innerHTML; expect(svg.length, g.id).toBeGreaterThan(80); expect(seen.has(svg) ? seen.get(svg) : undefined, `${g.id} duplicates another icon`).toBeUndefined(); seen.set(svg, g.id); }
    expect(seen.size).toBe(15);
  });
});
