type PendingRequest = {
  resolve: (wav: ArrayBuffer) => void;
  reject: (error: Error) => void;
};

type WorkerReply =
  | { type: 'audio'; id: number; wav: ArrayBuffer; backend: 'webgpu' | 'wasm' }
  | { type: 'error'; id: number; message: string }
  | { type: 'progress'; backend: 'webgpu' | 'wasm'; progress: number };

export const KOKORO_STATUS_EVENT = 'singlish-guru:kokoro-status';

export type KokoroStatus = {
  phase: 'loading' | 'ready' | 'error';
  progress?: number;
  backend?: 'webgpu' | 'wasm';
};

let worker: Worker | null = null;
let nextRequestId = 0;
let audioContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let finishActiveAudio: (() => void) | null = null;
let playbackGeneration = 0;
let kokoroReady = false;
const pending = new Map<number, PendingRequest>();

function publishStatus(detail: KokoroStatus): void {
  window.dispatchEvent(new CustomEvent<KokoroStatus>(KOKORO_STATUS_EVENT, { detail }));
}

function isLowPoweredDevice(): boolean {
  const nav = navigator as Navigator & { deviceMemory?: number };
  return (nav.deviceMemory !== undefined && nav.deviceMemory <= 2) || navigator.hardwareConcurrency <= 2;
}

export function canUseKokoro(): boolean {
  return typeof window !== 'undefined'
    && typeof Worker !== 'undefined'
    && !isLowPoweredDevice();
}

function getWorker(): Worker {
  if (worker) return worker;
  worker = new Worker(new URL('../workers/kokoro.worker.ts', import.meta.url), { type: 'module' });
  worker.addEventListener('message', (event: MessageEvent<WorkerReply>) => {
    if (event.data.type === 'progress') {
      publishStatus({ phase: 'loading', progress: event.data.progress, backend: event.data.backend });
      return;
    }
    const request = pending.get(event.data.id);
    if (!request) return;
    pending.delete(event.data.id);
    if (event.data.type === 'audio') {
      kokoroReady = true;
      publishStatus({ phase: 'ready', progress: 100, backend: event.data.backend });
      request.resolve(event.data.wav);
    } else {
      publishStatus({ phase: 'error' });
      request.reject(new Error(event.data.message));
    }
  });
  worker.addEventListener('error', (event) => {
    const error = new Error(event.message || 'Kokoro worker failed.');
    pending.forEach((request) => request.reject(error));
    pending.clear();
    publishStatus({ phase: 'error' });
    worker?.terminate();
    worker = null;
  });
  return worker;
}

function generate(text: string, speed: number): Promise<ArrayBuffer> {
  const id = ++nextRequestId;
  if (!kokoroReady) publishStatus({ phase: 'loading', progress: 3 });
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ type: 'generate', id, text, speed });
  });
}

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

// Call during the original click/tap so delayed model generation does not lose
// the browser's audio permission window.
export function prepareKokoroAudio(): void {
  if (!canUseKokoro()) return;
  const context = getAudioContext();
  if (context.state === 'suspended') void context.resume();
}

function releaseAudio(): void {
  if (activeSource) {
    activeSource.onended = null;
    try {
      activeSource.stop();
    } catch {
      // The source may already have ended.
    }
    activeSource.disconnect();
    activeSource = null;
  }
  finishActiveAudio?.();
  finishActiveAudio = null;
}

export async function playKokoroSpeech(text: string, speed: number): Promise<void> {
  if (!canUseKokoro()) throw new Error('This device is using lightweight speech mode.');
  const generation = playbackGeneration;
  const context = getAudioContext();
  if (context.state === 'suspended') await context.resume();
  const wav = await generate(text, speed);
  if (generation !== playbackGeneration) throw new DOMException('Speech cancelled.', 'AbortError');
  releaseAudio();
  const decodedAudio = await context.decodeAudioData(wav.slice(0));
  if (generation !== playbackGeneration) throw new DOMException('Speech cancelled.', 'AbortError');
  const source = context.createBufferSource();
  source.buffer = decodedAudio;
  source.connect(context.destination);
  activeSource = source;
  try {
    await new Promise<void>((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        finishActiveAudio = null;
        resolve();
      };
      finishActiveAudio = finish;
      source.onended = finish;
      source.start();
    });
  } finally {
    if (activeSource === source) releaseAudio();
  }
}

export function stopKokoroSpeech(): void {
  playbackGeneration += 1;
  releaseAudio();
}
