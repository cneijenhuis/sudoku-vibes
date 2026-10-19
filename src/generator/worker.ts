// Web Worker entry point: runs puzzle generation off the main thread.
import { handleRequest, type WorkerRequest, type WorkerResponse } from './protocol';

interface WorkerScope {
  onmessage: ((event: { data: WorkerRequest }) => void) | null;
  postMessage(message: WorkerResponse): void;
}

const scope = self as unknown as WorkerScope;
scope.onmessage = (event) => scope.postMessage(handleRequest(event.data));
