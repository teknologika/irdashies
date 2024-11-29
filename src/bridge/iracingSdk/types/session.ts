import type {
  SessionData,
  SessionResultsPosition,
  SessionInfo as Info,
} from '@irsdk-node/types';

export type Session = SessionData & {
  QualifyResultsInfo?: { Results: SessionResultsPosition[] };
};

export type SessionInfo = Info;
export type SessionResults = SessionResultsPosition;
