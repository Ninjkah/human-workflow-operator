import type { AppState, AuditEvent, Job, JobStatus, Target } from './types';
import { openUrl } from '@tauri-apps/plugin-opener';

const STORAGE_KEY = 'yt-human-workflow-state-v1';

const defaultState: AppState = {
  accounts: [],
  targets: [],
  jobs: [],
  audit: []
};

export function uid(prefix: string): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
  return `${prefix}_${hex}`;
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(defaultState)) as AppState;
    return { ...defaultState, ...JSON.parse(raw) } as AppState;
  } catch {
    return JSON.parse(JSON.stringify(defaultState)) as AppState;
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function parseYouTubeTarget(url: string): Pick<Target, 'videoId' | 'commentId' | 'verified'> {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'youtu.be') {
      return { verified: false };
    }

    let videoId: string | undefined;
    if (host === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\//, '').split('/')[0] || undefined;
    } else {
      videoId = parsed.searchParams.get('v') || undefined;
    }

    // YouTube comment links commonly carry the comment reference in `lc`.
    // This parser intentionally treats it as an identifier only; it does not
    // perform any engagement action.
    const commentId = parsed.searchParams.get('lc') || undefined;

    return {
      videoId,
      commentId,
      verified: Boolean(videoId)
    };
  } catch {
    return { verified: false };
  }
}

export function addAudit(
  state: AppState,
  jobId: string | undefined,
  actor: AuditEvent['actor'],
  type: string,
  details?: string
): AppState {
  return {
    ...state,
    audit: [
      ...state.audit,
      {
        id: uid('audit'),
        jobId,
        actor,
        type,
        timestamp: new Date().toISOString(),
        details
      }
    ]
  };
}

export function transitionJob(
  state: AppState,
  jobId: string,
  nextStatus: JobStatus,
  actor: AuditEvent['actor'],
  details?: string
): AppState {
  const allowed: Record<JobStatus, JobStatus[]> = {
    queued: ['waiting_for_human', 'cancelled', 'error'],
    waiting_for_human: ['human_confirmed', 'skipped', 'cancelled', 'error'],
    human_confirmed: ['completed', 'error'],
    skipped: [],
    cancelled: [],
    error: ['queued', 'cancelled'],
    completed: []
  };

  const current = state.jobs.find((j) => j.id === jobId);
  if (!current) throw new Error('Job not found.');
  if (!allowed[current.status].includes(nextStatus)) {
    throw new Error(`Invalid transition ${current.status} → ${nextStatus}`);
  }

  const now = new Date().toISOString();
  const jobs: Job[] = state.jobs.map((job) =>
    job.id === jobId ? { ...job, status: nextStatus, updatedAt: now } : job
  );

  let next: AppState = { ...state, jobs };
  next = addAudit(next, jobId, actor, `JOB_${nextStatus.toUpperCase()}`, details);
  saveState(next);
  return next;
}

export async function openTarget(url: string): Promise<void> {
  await openUrl(url);
}
