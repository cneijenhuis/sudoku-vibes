import type { Difficulty } from '../engine/grading';
import type { GeneratedPuzzle } from './generate';
import type { WorkerRequest, WorkerResponse } from './protocol';

/** Rejection reason for a request replaced by a newer one; callers can ignore it. */
export class Superseded extends Error {
  constructor() {
    super('Puzzle request superseded by a newer request');
    this.name = 'Superseded';
  }
}

/** Rejection reason for a request still pending when the client is disposed. */
export class Disposed extends Error {
  constructor() {
    super('Puzzle generator client disposed');
    this.name = 'Disposed';
  }
}

/** The subset of `Worker` the client uses (lets tests inject a fake). */
export interface WorkerLike {
  postMessage(message: WorkerRequest): void;
  terminate(): void;
  onmessage: ((event: { data: WorkerResponse }) => void) | null;
  onerror: ((event: { message?: string }) => void) | null;
  onmessageerror: ((event: unknown) => void) | null;
}

export interface GeneratorClient {
  /** Request a puzzle; a newer call supersedes (rejects) any in-flight one. */
  generate(difficulty: Difficulty, seed?: number): Promise<GeneratedPuzzle>;
  /** Stop the worker and reject any pending request with `Disposed`; the next request starts a new worker. */
  dispose(): void;
}

interface Pending {
  id: number;
  resolve: (p: GeneratedPuzzle) => void;
  reject: (e: Error) => void;
}

export function createGeneratorClient(createWorker: () => WorkerLike): GeneratorClient {
  let worker: WorkerLike | null = null;
  let nextId = 0;
  let pending: Pending | null = null;

  function stopWorker(): void {
    worker?.terminate();
    worker = null;
  }

  function dispose(): void {
    const p = pending;
    pending = null;
    stopWorker();
    p?.reject(new Disposed());
  }

  function fail(error: Error): void {
    const p = pending;
    pending = null;
    stopWorker();
    p?.reject(error);
  }

  function start(): WorkerLike {
    const w = createWorker();
    w.onmessage = (event) => {
      const msg = event.data;
      // Replies for superseded requests are dropped.
      if (!pending || msg.id !== pending.id) return;
      const p = pending;
      pending = null;
      if ('error' in msg) p.reject(new Error(msg.error));
      else p.resolve(msg.result);
    };
    w.onmessageerror = () => w === worker && fail(new Error('Puzzle generator worker sent an unreadable message'));
    w.onerror = (event) => w === worker && fail(new Error(event.message || 'Puzzle generator worker failed'));
    return w;
  }

  return {
    generate(difficulty, seed) {
      if (pending) {
        // Kill the stale run (it may be a slow Hard/Almost Impossible search) and respawn lazily.
        const old = pending;
        pending = null;
        stopWorker();
        old.reject(new Superseded());
      }
      const id = ++nextId;
      return new Promise<GeneratedPuzzle>((resolve, reject) => {
        pending = { id, resolve, reject };
        try {
          worker ??= start();
          worker.postMessage(seed === undefined ? { id, difficulty } : { id, difficulty, seed });
        } catch (err) {
          fail(err instanceof Error ? err : new Error(String(err)));
        }
      });
    },
    dispose,
  };
}

const defaultClient = createGeneratorClient(
  () => new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' }) as unknown as WorkerLike,
);

/** Generate a puzzle in a background Web Worker. */
export function generatePuzzleAsync(difficulty: Difficulty, seed?: number): Promise<GeneratedPuzzle> {
  return defaultClient.generate(difficulty, seed);
}

/** Abort the in-flight request (rejecting it with `Disposed`); the next request starts a fresh worker. */
export function disposeGenerator(): void {
  defaultClient.dispose();
}
