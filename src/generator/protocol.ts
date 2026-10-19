import type { Difficulty } from '../engine/grading';
import { generatePuzzle, type GeneratedPuzzle } from './generate';

export interface WorkerRequest {
  id: number;
  difficulty: Difficulty;
  seed?: number;
}

export type WorkerResponse =
  | { id: number; result: GeneratedPuzzle }
  | { id: number; error: string };

/** Pure request handler used by the worker entry point (and testable without a Worker). */
export function handleRequest(req: WorkerRequest): WorkerResponse {
  try {
    const options = req.seed === undefined ? {} : { seed: req.seed };
    return { id: req.id, result: generatePuzzle(req.difficulty, options) };
  } catch (err) {
    return { id: req.id, error: err instanceof Error ? err.message : String(err) };
  }
}
