import { describe, expect, it } from 'vitest';
import { Difficulty } from '../engine/grading';
import { Disposed, Superseded, createGeneratorClient, type WorkerLike } from './client';
import type { GeneratedPuzzle } from './generate';
import { handleRequest, type WorkerRequest, type WorkerResponse } from './protocol';

class FakeWorker implements WorkerLike {
  onmessage: WorkerLike['onmessage'] = null;
  onerror: WorkerLike['onerror'] = null;
  onmessageerror: WorkerLike['onmessageerror'] = null;
  sent: WorkerRequest[] = [];
  terminated = false;
  postMessage(m: WorkerRequest): void {
    this.sent.push(m);
  }
  terminate(): void {
    this.terminated = true;
  }
  reply(r: WorkerResponse): void {
    this.onmessage?.({ data: r });
  }
}

const puzzle = (tag: string): GeneratedPuzzle => ({
  puzzle: tag.padEnd(81, '0'),
  solution: '1'.repeat(81),
  difficulty: Difficulty.Easy,
  exact: true,
});

function setup() {
  const workers: FakeWorker[] = [];
  const client = createGeneratorClient(() => {
    const w = new FakeWorker();
    workers.push(w);
    return w;
  });
  return { workers, client };
}

describe('generator client', () => {
  it('resolves with the worker result', async () => {
    const { workers, client } = setup();
    const p = client.generate(Difficulty.Hard, 5);
    const w = workers[0]!;
    expect(w.sent).toEqual([{ id: 1, difficulty: Difficulty.Hard, seed: 5 }]);
    w.reply({ id: 1, result: puzzle('1') });
    await expect(p).resolves.toEqual(puzzle('1'));
  });

  it('supersedes an in-flight request and drops its late reply', async () => {
    const { workers, client } = setup();
    const first = client.generate(Difficulty.Easy);
    const second = client.generate(Difficulty.Medium);
    await expect(first).rejects.toBeInstanceOf(Superseded);
    // The stale worker is terminated and a fresh one is started for the new request.
    expect(workers).toHaveLength(2);
    expect(workers[0]!.terminated).toBe(true);
    expect(workers[1]!.terminated).toBe(false);
    workers[0]!.reply({ id: 1, result: puzzle('stale') });
    workers[1]!.reply({ id: 2, result: puzzle('2') });
    await expect(second).resolves.toEqual(puzzle('2'));
  });

  it('ignores errors from a superseded worker', async () => {
    const { workers, client } = setup();
    const first = client.generate(Difficulty.Easy);
    const second = client.generate(Difficulty.Medium);
    await expect(first).rejects.toBeInstanceOf(Superseded);
    workers[0]!.onerror?.({ message: 'stale err' });
    workers[0]!.onmessageerror?.({});
    expect(workers[1]!.terminated).toBe(false);
    workers[1]!.reply({ id: 2, result: puzzle('2') });
    await expect(second).resolves.toEqual(puzzle('2'));
  });

  it('dispose rejects a pending request and the next request respawns', async () => {
    const { workers, client } = setup();
    const p = client.generate(Difficulty.Easy);
    client.dispose();
    await expect(p).rejects.toBeInstanceOf(Disposed);
    expect(workers[0]!.terminated).toBe(true);
    void client.generate(Difficulty.Easy);
    expect(workers).toHaveLength(2);
  });

  it('rejects on an unreadable worker message', async () => {
    const { workers, client } = setup();
    const p = client.generate(Difficulty.Easy);
    workers[0]!.onmessageerror?.({});
    await expect(p).rejects.toThrow('unreadable');
    expect(workers[0]!.terminated).toBe(true);
  });

  it('rejects when the worker reports an error message', async () => {
    const { workers, client } = setup();
    const p = client.generate(Difficulty.Easy);
    workers[0]!.reply({ id: 1, error: 'boom' });
    await expect(p).rejects.toThrow('boom');
  });

  it('rejects on a worker crash and starts a fresh worker next time', async () => {
    const { workers, client } = setup();
    const p = client.generate(Difficulty.Easy);
    workers[0]!.onerror?.({ message: 'crashed' });
    await expect(p).rejects.toThrow('crashed');
    expect(workers[0]!.terminated).toBe(true);
    const q = client.generate(Difficulty.Easy);
    expect(workers).toHaveLength(2);
    workers[1]!.reply({ id: 2, result: puzzle('3') });
    await expect(q).resolves.toEqual(puzzle('3'));
  });

  it('rejects when the worker cannot be created', async () => {
    const client = createGeneratorClient(() => {
      throw new Error('no worker');
    });
    await expect(client.generate(Difficulty.Easy)).rejects.toThrow('no worker');
  });
});

describe('worker request handler', () => {
  it('returns a result for a valid request and an error for a bad one', () => {
    const ok = handleRequest({ id: 7, difficulty: Difficulty.Easy, seed: 3 });
    expect('result' in ok && ok.result.exact).toBe(true);
    expect(ok.id).toBe(7);
    const bad = handleRequest({ id: 8, difficulty: 99 as Difficulty });
    expect(bad).toEqual({ id: 8, error: 'Unknown difficulty: 99' });
  });
});
