import { DIFFICULTY_LABELS, Difficulty } from '../engine/grading';
import { generatePuzzleAsync } from './client';

export interface SmokeReport {
  rows: { level: string; difficulty: string; exact: boolean; ms: number; puzzle: string }[];
  /** Longest gap between 50 ms main-thread timer ticks while generating (ms). */
  maxTickGapMs: number;
  ticks: number;
  done: boolean;
}

/** Dev smoke test (open the app with `?smoke`): request one puzzle per level through the real worker. */
export async function runSmoke(): Promise<SmokeReport> {
  const report: SmokeReport = { rows: [], maxTickGapMs: 0, ticks: 0, done: false };
  (window as unknown as { __smoke: SmokeReport }).__smoke = report;
  const log = document.createElement('pre');
  log.id = 'smoke-log';
  document.body.append(log);

  let last = performance.now();
  const timer = setInterval(() => {
    const now = performance.now();
    report.maxTickGapMs = Math.max(report.maxTickGapMs, now - last);
    report.ticks++;
    last = now;
  }, 50);

  for (const level of [0, 1, 2, 3, 4] as Difficulty[]) {
    const t = performance.now();
    const r = await generatePuzzleAsync(level);
    const row = {
      level: DIFFICULTY_LABELS[level],
      difficulty: DIFFICULTY_LABELS[r.difficulty],
      exact: r.exact,
      ms: Math.round(performance.now() - t),
      puzzle: r.puzzle,
    };
    report.rows.push(row);
    log.textContent += `${row.level}: ${row.difficulty} exact=${row.exact} ${row.ms}ms ${row.puzzle}\n`;
  }
  clearInterval(timer);
  report.done = true;
  return report;
}
