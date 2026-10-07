import { afterEach, describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import { GUEST_LESSONS_KEY, LessonProgressController, lessonProgressKey } from './lessonProgress';

const stops: (() => void)[] = [];
function start(uid: string | null | undefined) {
  const controller = new LessonProgressController(uid);
  const stop = controller.start();
  stops.push(stop);
  return { controller, stop };
}
const response = (userId: string, ids: string[]) => ({ ok: true, status: 200, json: async () => ({ userId, completedLessonIds: ids }) });
afterEach(() => { stops.splice(0).forEach(stop => stop()); vi.unstubAllGlobals(); });

describe('Account-scoped lesson sync', () => {
  it('keeps guest completions local and ignores invalid or duplicate lesson IDs', () => {
    const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
    const { controller } = start(null);
    controller.complete(['lesson-1', 'lesson-1', 'lesson-1001']);
    expect(controller.getSnapshot().completed).toEqual(['lesson-1']);
    expect(JSON.parse(localStorage.getItem(GUEST_LESSONS_KEY)!).completed).toEqual(['lesson-1']);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it('does not save before account detection finishes', () => {
    const { controller } = start(undefined);
    controller.complete(['lesson-1']);
    expect(controller.getSnapshot().completed).toEqual([]);
    expect(localStorage.getItem(GUEST_LESSONS_KEY)).toBeNull();
  });
  it('imports guest lessons only after explicit action and sends no claimed identity in the body', async () => {
    localStorage.setItem(GUEST_LESSONS_KEY, JSON.stringify({ completed: ['lesson-1'], pending: [] }));
    const fetchMock = vi.fn().mockResolvedValue(response('alice', [])); vi.stubGlobal('fetch', fetchMock);
    const { controller } = start('alice');
    await waitFor(() => expect(controller.getSnapshot().status).toBe('synced'));
    expect(controller.getSnapshot().completed).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fetchMock.mockImplementation(async (_url, options) => response('alice', options.method === 'POST' ? ['lesson-1'] : []));
    controller.importGuest();
    await waitFor(() => expect(controller.getSnapshot().status).toBe('synced'));
    const post = fetchMock.mock.calls.find(([, options]) => options.method === 'POST');
    expect(JSON.parse(post![1].body)).toEqual({ lessonIds: ['lesson-1'] });
    expect(post![1].headers['X-Progress-User']).toBe('alice');
    expect(controller.getSnapshot().pending).toEqual([]);
    expect(JSON.parse(localStorage.getItem(GUEST_LESSONS_KEY)!).completed).toEqual(['lesson-1']);
  });
  it('keeps offline pending saves across reloads and retries idempotently', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('offline')); vi.stubGlobal('fetch', fetchMock);
    const first = start('alice');
    first.controller.complete(['lesson-2']);
    await waitFor(() => expect(first.controller.getSnapshot().status).toBe('error'));
    first.stop();
    fetchMock.mockImplementation(async (_url, options) => response('alice', options.method === 'POST' ? ['lesson-1', 'lesson-2'] : ['lesson-1']));
    const { controller } = start('alice');
    await waitFor(() => expect(controller.getSnapshot().status).toBe('synced'));
    expect(controller.getSnapshot().completed.sort()).toEqual(['lesson-1', 'lesson-2']);
    expect(controller.getSnapshot().pending).toEqual([]);
  });
  it('does not expose a previous account or accept its late response after switching', async () => {
    let resolveAlice!: (value: unknown) => void;
    const fetchMock = vi.fn().mockImplementation((_url, options) => options.headers['X-Progress-User'] === 'alice'
      ? new Promise(resolve => { resolveAlice = resolve; }) : Promise.resolve(response('bob', ['lesson-3'])));
    vi.stubGlobal('fetch', fetchMock);
    const alice = start('alice'); alice.controller.complete(['lesson-1']); alice.stop();
    const bob = start('bob');
    await waitFor(() => expect(bob.controller.getSnapshot().status).toBe('synced'));
    resolveAlice(response('alice', ['lesson-2']));
    await Promise.resolve(); await Promise.resolve();
    expect(bob.controller.getSnapshot().completed).toEqual(['lesson-3']);
    expect(JSON.parse(localStorage.getItem(lessonProgressKey('alice'))!).pending).toEqual(['lesson-1']);
    expect(localStorage.getItem(GUEST_LESSONS_KEY)).toBeNull();
  });
  it('preserves lessons completed while a save is already running', async () => {
    let finish!: (value: unknown) => void;
    let posts = 0;
    const fetchMock = vi.fn().mockImplementation((_url, options) => {
      if (options.method !== 'POST') return Promise.resolve(response('alice', []));
      if (++posts === 1) return new Promise(resolve => { finish = resolve; });
      return Promise.resolve(response('alice', ['lesson-1', 'lesson-2']));
    });
    vi.stubGlobal('fetch', fetchMock);
    const { controller } = start('alice');
    await waitFor(() => expect(controller.getSnapshot().status).toBe('synced'));
    controller.complete(['lesson-1']);
    await waitFor(() => expect(posts).toBe(1));
    controller.complete(['lesson-2']);
    finish(response('alice', ['lesson-1']));
    await waitFor(() => expect(controller.getSnapshot().status).toBe('synced'));
    expect(posts).toBe(2);
    expect(controller.getSnapshot().pending).toEqual([]);
    expect(controller.getSnapshot().completed.sort()).toEqual(['lesson-1', 'lesson-2']);
  });
  it('retains pending data when another tab changes the authenticated account', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 409 }));
    const { controller } = start('alice');
    controller.complete(['lesson-1']);
    await waitFor(() => expect(controller.getSnapshot().error).toMatch(/another tab/));
    expect(controller.getSnapshot().pending).toEqual(['lesson-1']);
  });
  it('reports unavailable browser storage instead of claiming a durable local save', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
    const { controller } = start(null);
    controller.complete(['lesson-1']);
    expect(controller.getSnapshot().storageWarning).toMatch(/storage is unavailable/);
    expect(controller.getSnapshot().completed).toEqual(['lesson-1']);
  });
});
