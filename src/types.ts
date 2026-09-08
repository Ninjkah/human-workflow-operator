export type Account = {
  id: string;
  displayName: string;
  channelId?: string;
  status: 'active' | 'disabled';
  createdAt: string;
};

export type Target = {
  id: string;
  url: string;
  videoId?: string;
  commentId?: string;
  label?: string;
  verified: boolean;
  createdAt: string;
};

export type JobStatus =
  | 'queued'
  | 'waiting_for_human'
  | 'human_confirmed'
  | 'skipped'
  | 'cancelled'
  | 'error'
  | 'completed';

export type Job = {
  id: string;
  accountId: string;
  targetId: string;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
  note?: string;
};

export type AuditEvent = {
  id: string;
  jobId?: string;
  actor: 'system' | 'operator';
  type: string;
  timestamp: string;
  details?: string;
};

export type AppState = {
  accounts: Account[];
  targets: Target[];
  jobs: Job[];
  audit: AuditEvent[];
};
