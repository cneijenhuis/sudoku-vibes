// Calibration run for the difficulty levels (not part of `npm test`): generates puzzles per level
// with fixed seeds and prints hit rate, time, givens, score, open moves, spread and technique mix.
//
//   node tools/calibrate.mjs [puzzlesPerLevel=100] [firstLevel=1] [lastLevel=9]
//
// The TypeScript sources are loaded through Vite's module loader (already a dev dependency).
import { createServer } from 'vite';

const count = Number(process.argv[2] ?? 100);
const first = Number(process.argv[3] ?? 1);
const last = Number(process.argv[4] ?? 9);

const server = await createServer({
  configFile: false,
  appType: 'custom',
  server: { middlewareMode: true },
  logLevel: 'error',
  optimizeDeps: { noDiscovery: true },
});
const load = (path) => server.ssrLoadModule(path);
const { generatePuzzle } = await load('/src/generator/generate.ts');
const { analyze, Technique } = await load('/src/engine/techniques.ts');
const { parse } = await load('/src/engine/board.ts');
const { DIFFICULTY_LABELS, rate, scoreBand } = await load('/src/engine/grading.ts');

const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor((sorted.length * p) / 100))];
const num = (x, d = 0) => (Number.isFinite(x) ? x.toFixed(d) : 'inf');
const techniqueNames = Object.keys(Technique).filter((k) => Number.isNaN(Number(k)));

console.log(`Calibration: ${count} puzzles per level, seeds 1..${count}, budget 8000 ms (desktop Node, not a phone)\n`);
console.log('level        hit   median  p95   max ms | givens  | score min/med/max  | open p10/med/p90 | band top fifth');
const mixes = [];
for (let level = first - 1; level <= last - 1; level++) {
  const { lo, hi } = scoreBand(level);
  const ms = [];
  const givens = [];
  const scores = [];
  const opens = [];
  let hits = 0;
  let topFifth = 0;
  const usedBy = Object.fromEntries(techniqueNames.map((n) => [n, 0]));
  const hardestBy = {};
  for (let seed = 1; seed <= count; seed++) {
    const t = performance.now();
    const r = generatePuzzle(level, { seed });
    ms.push(performance.now() - t);
    if (r.exact) hits++;
    const board = parse(r.puzzle);
    givens.push(board.filter((v) => v !== 0).length);
    const analysis = analyze(board);
    const rating = rate(analysis);
    scores.push(rating.score);
    opens.push(rating.openMoves);
    if (rating.score >= lo + (hi - lo) * 0.8) topFifth++;
    for (const n of new Set(analysis.steps.map((s) => Technique[s.technique]))) usedBy[n]++;
    const h = analysis.hardest === null ? 'none' : Technique[analysis.hardest];
    hardestBy[h] = (hardestBy[h] ?? 0) + 1;
  }
  const sort = (a) => [...a].sort((x, y) => x - y);
  const [m, g, s, o] = [sort(ms), sort(givens), sort(scores), sort(opens)];
  console.log(
    `${`${level + 1} ${DIFFICULTY_LABELS[level]}`.padEnd(12)} ${`${Math.round((hits / count) * 100)}%`.padStart(4)}` +
      `  ${num(pct(m, 50)).padStart(6)} ${num(pct(m, 95)).padStart(5)} ${num(m[m.length - 1]).padStart(6)}` +
      ` | ${g[0]}-${g[g.length - 1]} (med ${pct(g, 50)})`.padEnd(18) +
      `| ${s[0]}/${pct(s, 50)}/${s[s.length - 1]}`.padEnd(21) +
      `| ${num(pct(o, 10), 1)}/${num(pct(o, 50), 1)}/${num(pct(o, 90), 1)}`.padEnd(19) +
      `| ${topFifth}% of [${lo}, ${hi})`,
  );
  mixes.push({ level, usedBy, hardestBy });
}
console.log('\nTechnique mix: share of puzzles whose solve uses the technique (%), and hardest technique');
for (const { level, usedBy, hardestBy } of mixes) {
  const used = Object.entries(usedBy).filter(([, n]) => n > 0).map(([k, n]) => `${k} ${Math.round((n / count) * 100)}`).join(', ');
  const hardest = Object.entries(hardestBy).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join(', ');
  console.log(`${level + 1} ${DIFFICULTY_LABELS[level]}: uses ${used}\n   hardest: ${hardest}`);
}
await server.close();
