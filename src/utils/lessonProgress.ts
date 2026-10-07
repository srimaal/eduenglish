import { isLessonId, type LessonProgressResponse } from '../types/lessonProgress';

export const GUEST_LESSONS_KEY = 'singlish_guru_lesson_progress_guest_v1';
export const lessonProgressKey = (uid: string) => `singlish_guru_lesson_progress_user_${encodeURIComponent(uid)}_v1`;
type Saved = { completed: string[]; pending: string[] };
type Snapshot = Saved & { status: string; error: string; storageWarning: string; guestIds: string[] };
const unique = (ids: string[]) => [...new Set(ids)].filter(isLessonId);
function read(key: string): Saved {
  try {
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    return { completed: unique(Array.isArray(data?.completed) ? data.completed : []), pending: unique(Array.isArray(data?.pending) ? data.pending : []) };
  } catch { return { completed: [], pending: [] }; }
}

// Separate namespaces for guests and each Firebase UID. Never infer ownership from browser data.
export class LessonProgressController {
  private key: string;
  private state: Snapshot;
  private listeners = new Set<() => void>();
  private generation = 0;
  private active = false;
  private syncing = false;
  constructor(private uid: string | null | undefined) {
    this.key = uid ? lessonProgressKey(uid) : GUEST_LESSONS_KEY;
    const saved = uid === undefined ? { completed: [], pending: [] } : read(this.key);
    this.state = { ...saved, status: uid === undefined ? 'checking' : uid ? 'loading' : 'guest', error: '', storageWarning: '', guestIds: uid ? read(GUEST_LESSONS_KEY).completed : [] };
  }
  getSnapshot = () => this.state;
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; };
  private update(patch: Partial<Snapshot>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach(listener => listener());
  }
  private persist(completed: string[], pending: string[]) {
    const saved = { completed: unique(completed), pending: unique(pending) };
    let storageWarning = '';
    try { localStorage.setItem(this.key, JSON.stringify(saved)); }
    catch { storageWarning = 'Browser storage is unavailable. Keep this tab open until cloud saving succeeds; guest progress cannot survive a reload.'; }
    this.update({ ...saved, storageWarning });
  }
  private refreshLocal = () => {
    const saved = read(this.key);
    this.update({ completed: unique([...this.state.completed, ...saved.completed]), pending: unique([...this.state.pending, ...saved.pending]), guestIds: this.uid ? read(GUEST_LESSONS_KEY).completed : [] });
  };
  private onStorage = (event: StorageEvent) => {
    if (event.key === this.key || event.key === GUEST_LESSONS_KEY) { this.refreshLocal(); void this.sync(); }
  };
  start = () => {
    this.active = true;
    this.generation++;
    window.addEventListener('online', this.sync);
    window.addEventListener('focus', this.sync);
    window.addEventListener('storage', this.onStorage);
    void this.sync();
    return () => {
      this.active = false;
      this.generation++;
      this.syncing = false;
      window.removeEventListener('online', this.sync);
      window.removeEventListener('focus', this.sync);
      window.removeEventListener('storage', this.onStorage);
    };
  };
  complete = (lessonIds: string[]) => {
    if (!this.active || this.uid === undefined) return;
    this.refreshLocal();
    const newIds = unique(lessonIds).filter(id => !this.state.completed.includes(id));
    if (!newIds.length) return;
    this.persist([...this.state.completed, ...newIds], this.uid ? [...this.state.pending, ...newIds] : []);
    this.update({ status: this.uid ? 'pending' : 'guest' });
    void this.sync();
  };
  importGuest = () => { if (this.uid) this.complete(read(GUEST_LESSONS_KEY).completed); };
  private async request(lessonIds?: string[]): Promise<string[]> {
    const response = await fetch(lessonIds ? '/api/progress/lessons' : '/api/progress', {
      method: lessonIds ? 'POST' : 'GET', credentials: 'same-origin', cache: 'no-store',
      headers: { 'X-Progress-User': this.uid!, ...(lessonIds ? { 'Content-Type': 'application/json' } : {}) },
      ...(lessonIds ? { body: JSON.stringify({ lessonIds }) } : {}), signal: AbortSignal.timeout(20_000),
    });
    if (response.status === 401 || response.status === 409) throw new Error('Your sign-in expired or changed in another tab. Refresh and sign in again. Pending lessons remain saved for this account.');
    if (!response.ok) throw new Error('Cloud sync failed. Your pending lessons are kept on this device. Retry when connected.');
    const data: LessonProgressResponse = await response.json();
    if (data.userId !== this.uid || !Array.isArray(data.completedLessonIds) || !data.completedLessonIds.every(isLessonId)) throw new Error('Unexpected progress response. Please refresh and try again.');
    return unique(data.completedLessonIds);
  }
  sync = async () => {
    if (!this.active || !this.uid || this.syncing) return;
    const generation = this.generation;
    const current = () => this.active && generation === this.generation;
    this.syncing = true;
    this.update({ status: 'loading', error: '' });
    try {
      const remote = await this.request();
      if (!current()) return;
      this.refreshLocal();
      this.persist([...remote, ...this.state.completed], this.state.pending);
      while (this.state.pending.length) {
        const sent = [...this.state.pending];
        const completed = await this.request(sent);
        if (!current()) return;
        this.refreshLocal();
        this.persist([...completed, ...this.state.completed], this.state.pending.filter(id => !sent.includes(id)));
      }
      this.update({ status: 'synced', error: '' });
    } catch (error) {
      if (current()) this.update({ status: 'error', error: error instanceof Error ? error.message : 'Cloud sync failed. Please retry.' });
    } finally { if (current()) this.syncing = false; }
  };
}
