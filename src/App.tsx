import { useMemo, useState } from 'react';
import type { Account, AppState, Job, Target } from './types';
import { addAudit, loadState, openTarget, parseYouTubeTarget, saveState, transitionJob, uid } from './lib';

function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [accountName, setAccountName] = useState('');
  const [channelId, setChannelId] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [targetLabel, setTargetLabel] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedTarget, setSelectedTarget] = useState('');
  const [operatorName, setOperatorName] = useState('Operator');
  const [notice, setNotice] = useState('');

  const activeJobs = useMemo(() => state.jobs.filter((j) => !['completed', 'skipped', 'cancelled'].includes(j.status)), [state.jobs]);

  function commit(next: AppState) {
    setState(next);
    saveState(next);
  }

  function addAccount() {
    const displayName = accountName.trim();
    if (!displayName) return setNotice('Enter an account/channel label.');

    const account: Account = {
      id: uid('acct'),
      displayName,
      channelId: channelId.trim() || undefined,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    commit({ ...state, accounts: [...state.accounts, account] });
    setAccountName('');
    setChannelId('');
    setNotice('Account record added. OAuth authorization is intentionally not collected by this starter.');
  }

  function addTarget() {
    const url = targetUrl.trim();
    if (!url) return setNotice('Enter a YouTube URL.');

    const parsed = parseYouTubeTarget(url);
    if (!parsed.verified) return setNotice('That does not look like a valid YouTube video URL.');

    const target: Target = {
      id: uid('target'),
      url,
      videoId: parsed.videoId,
      commentId: parsed.commentId,
      label: targetLabel.trim() || undefined,
      verified: parsed.verified,
      createdAt: new Date().toISOString()
    };

    commit({ ...state, targets: [...state.targets, target] });
    setTargetUrl('');
    setTargetLabel('');
    setNotice('Target added. The app will not automatically engage with it.');
  }

  function createJob() {
    if (!selectedAccount || !selectedTarget) return setNotice('Choose an account and target first.');

    const job: Job = {
      id: uid('job'),
      accountId: selectedAccount,
      targetId: selectedTarget,
      status: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let next = addAudit({ ...state, jobs: [...state.jobs, job] }, job.id, 'system', 'JOB_CREATED');
    commit(next);
    setNotice('Job queued.');
  }

  async function startJob(job: Job) {
    const target = state.targets.find((t) => t.id === job.targetId);
    const account = state.accounts.find((a) => a.id === job.accountId);
    if (!target || !account) return setNotice('Job references missing data.');

    try {
      let next = transitionJob(state, job.id, 'waiting_for_human', 'system', `Prepared for ${account.displayName}`);
      setState(next);
      await openTarget(target.url);
      setNotice(`Target opened for ${account.displayName}. The software is waiting for a human decision.`);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not start job.');
    }
  }

  function humanConfirm(job: Job) {
    try {
      let next = transitionJob(state, job.id, 'human_confirmed', 'operator', `Confirmed by ${operatorName}`);
      next = transitionJob(next, job.id, 'completed', 'operator', `Completed by ${operatorName}`);
      commit(next);
      setNotice('Human checkpoint recorded and job completed.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not confirm job.');
    }
  }

  function skipJob(job: Job) {
    try {
      const next = transitionJob(state, job.id, 'skipped', 'operator', `Skipped by ${operatorName}`);
      commit(next);
      setNotice('Job skipped.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not skip job.');
    }
  }

  function cancelJob(job: Job) {
    try {
      const next = transitionJob(state, job.id, 'cancelled', 'operator', `Cancelled by ${operatorName}`);
      commit(next);
      setNotice('Job cancelled.');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not cancel job.');
    }
  }

  function resetAll() {
    const blank: AppState = { accounts: [], targets: [], jobs: [], audit: [] };
    commit(blank);
    setSelectedAccount('');
    setSelectedTarget('');
    setNotice('Local demo data cleared.');
  }

  return (
    <div className="app-shell">
      <header className="header">
        <div>
          <div className="eyebrow">HUMAN-IN-THE-LOOP</div>
          <h1>Operator Workstation</h1>
          <p className="subtitle">Prepare, verify, open, pause, and record. No automated engagement action is implemented.</p>
        </div>
        <button className="ghost danger" onClick={resetAll}>Reset local data</button>
      </header>

      {notice && <div className="notice">{notice}</div>}

      <main className="grid">
        <section className="card">
          <h2>1. Account records</h2>
          <p className="muted">Store a label or channel ID. Do not enter Google passwords here.</p>
          <input value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="Channel / account label" />
          <input value={channelId} onChange={(e) => setChannelId(e.target.value)} placeholder="YouTube channel ID (optional)" />
          <button onClick={addAccount}>Add account record</button>
          <div className="list">
            {state.accounts.map((account) => (
              <div className="row" key={account.id}>
                <div><strong>{account.displayName}</strong><span>{account.channelId || 'No channel ID'}</span></div>
                <span className="pill">{account.status}</span>
              </div>
            ))}
            {!state.accounts.length && <div className="empty">No account records yet.</div>}
          </div>
        </section>

        <section className="card">
          <h2>2. Target comment URLs</h2>
          <p className="muted">The parser extracts the video ID and optional <code>lc</code> comment reference.</p>
          <input value={targetUrl} onChange={(e) => setTargetUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=...&lc=..." />
          <input value={targetLabel} onChange={(e) => setTargetLabel(e.target.value)} placeholder="Target label (optional)" />
          <button onClick={addTarget}>Add target</button>
          <div className="list">
            {state.targets.map((target) => (
              <div className="row" key={target.id}>
                <div><strong>{target.label || target.videoId}</strong><span>{target.commentId || 'No comment reference'}</span></div>
                <span className="pill ok">{target.verified ? 'verified' : 'unverified'}</span>
              </div>
            ))}
            {!state.targets.length && <div className="empty">No targets yet.</div>}
          </div>
        </section>

        <section className="card full">
          <h2>3. Create a human checkpoint job</h2>
          <div className="form-grid">
            <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
              <option value="">Select account record</option>
              {state.accounts.map((a) => <option key={a.id} value={a.id}>{a.displayName}</option>)}
            </select>
            <select value={selectedTarget} onChange={(e) => setSelectedTarget(e.target.value)}>
              <option value="">Select target</option>
              {state.targets.map((t) => <option key={t.id} value={t.id}>{t.label || t.videoId}</option>)}
            </select>
            <input value={operatorName} onChange={(e) => setOperatorName(e.target.value)} placeholder="Operator name" />
            <button onClick={createJob}>Create job</button>
          </div>
        </section>

        <section className="card full">
          <div className="section-head">
            <div>
              <h2>4. Operator queue</h2>
              <p className="muted">Active jobs: {activeJobs.length}</p>
            </div>
          </div>

          <div className="jobs">
            {state.jobs.map((job) => {
              const account = state.accounts.find((a) => a.id === job.accountId);
              const target = state.targets.find((t) => t.id === job.targetId);
              return (
                <div className="job" key={job.id}>
                  <div className="job-main">
                    <div className="job-title">{account?.displayName || 'Unknown account'} → {target?.label || target?.videoId || 'Unknown target'}</div>
                    <div className="job-meta">{job.status.split('_').join(' ')} · {new Date(job.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="actions">
                    {job.status === 'queued' && <button onClick={() => startJob(job)}>Open target</button>}
                    {job.status === 'waiting_for_human' && <>
                      <button className="primary" onClick={() => humanConfirm(job)}>Human completed</button>
                      <button className="ghost" onClick={() => skipJob(job)}>Skip</button>
                      <button className="ghost danger" onClick={() => cancelJob(job)}>Cancel</button>
                    </>}
                    {['completed', 'skipped', 'cancelled', 'error'].includes(job.status) && <span className="pill">{job.status}</span>}
                  </div>
                </div>
              );
            })}
            {!state.jobs.length && <div className="empty">No jobs created.</div>}
          </div>
        </section>

        <section className="card full">
          <h2>5. Audit log</h2>
          <div className="audit">
            {state.audit.slice().reverse().map((event) => (
              <div className="audit-row" key={event.id}>
                <span>{new Date(event.timestamp).toLocaleString()}</span>
                <strong>{event.type}</strong>
                <span>{event.actor}</span>
                <span>{event.details || ''}</span>
              </div>
            ))}
            {!state.audit.length && <div className="empty">No audit events yet.</div>}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
