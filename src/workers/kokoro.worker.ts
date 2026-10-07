import { KokoroTTS } from 'kokoro-js';

const MODEL_ID = 'onnx-community/Kokoro-82M-v1.0-ONNX';
const VOICE = 'bf_emma';

type Backend = 'webgpu' | 'wasm';

type ModelProgress = {
  status?: string;
  file?: string;
  progress?: number;
};

type GenerateMessage = {
  type: 'generate';
  id: number;
  text: string;
  speed: number;
};

let modelPromise: Promise<KokoroTTS> | null = null;
let activeBackend: Backend | null = null;

function canUseWebGpu(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

function loadModel(backend: Backend): Promise<KokoroTTS> {
  activeBackend = backend;
  return KokoroTTS.from_pretrained(MODEL_ID, {
    device: backend,
    dtype: backend === 'webgpu' ? 'fp32' : 'q8',
    progress_callback: (progress: ModelProgress) => {
      if (progress.status === 'progress' && progress.file?.includes('.onnx') && typeof progress.progress === 'number') {
        self.postMessage({ type: 'progress', backend, progress: Math.min(95, progress.progress) });
      }
    },
  });
}

async function getModel(): Promise<KokoroTTS> {
  if (modelPromise) return modelPromise;

  const preferredBackend: Backend = canUseWebGpu() ? 'webgpu' : 'wasm';
  modelPromise = loadModel(preferredBackend).catch((error) => {
    if (preferredBackend === 'wasm') throw error;
    console.warn('Kokoro WebGPU initialization failed; using quantized WASM.', error);
    modelPromise = loadModel('wasm');
    return modelPromise;
  });
  return modelPromise;
}

self.addEventListener('message', async (event: MessageEvent<GenerateMessage>) => {
  if (event.data.type !== 'generate') return;

  const { id, text, speed } = event.data;
  try {
    const model = await getModel();
    const audio = await model.generate(text, {
      voice: VOICE,
      speed: Math.min(1.15, Math.max(0.75, speed)),
    });
    const wav = audio.toWav();
    self.postMessage(
      { type: 'audio', id, wav, backend: activeBackend },
      { transfer: [wav] },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kokoro speech generation failed.';
    self.postMessage({ type: 'error', id, message });
  }
});

export {};
