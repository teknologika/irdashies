export type ReplayRebuildPhase = 'sweep' | 'confirm';

export type ReplayRebuildStatus =
  | { kind: 'idle' }
  | { kind: 'preparing' }
  | {
      kind: 'sweeping';
      sessionNum: number;
      sessionIndex: number;
      totalSessions: number;
      progressPct: number;
      windowsFound: number;
      lapsFound: number;
    }
  | {
      kind: 'confirming';
      sessionNum: number;
      sessionIndex: number;
      totalSessions: number;
      windowIndex: number;
      totalWindows: number;
      progressPct: number;
      incidentsFound: number;
      lapsFound: number;
    }
  | {
      kind: 'writing';
    }
  | {
      kind: 'done';
      incidentsTotal: number;
      lapsTotal: number;
      completedAt: number;
    }
  | {
      kind: 'interrupted';
      sessionIndex: number;
      totalSessions: number;
    };

export interface ReplayRebuildSnapshot {
  status: ReplayRebuildStatus;
  version: number;
}

export interface ReplayRebuildBridge {
  start: (sessionNums: number[]) => Promise<void>;
  resume: () => Promise<void>;
  cancel: () => Promise<void>;
}
