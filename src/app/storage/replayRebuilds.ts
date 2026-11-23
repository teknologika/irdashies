import * as fsp from 'node:fs/promises';
import * as path from 'node:path';
import logger from '../logger';
import { listArchiveFiles, pruneArchiveFile } from './sessionArchiveFiles';
import type { RebuildIndex } from '../processors/ReplayContextProcessor';

export interface ReplayRebuildRecord {
  subSessionId: string;
  sessionNums: number[];
  completedAt: number;
  sweepSpeed: number;
  confirmSpeed: number;
  coverage: { sessionNum: number; lapsFound: number; lapsInResults: number }[];
}

const FILE_PREFIX = 'rebuild-';
const MAX_REBUILD_FILES = 20;

function getStorageDir(): string {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { app } = require('electron') as typeof import('electron');
  return path.join(app.getPath('userData'), 'replay-rebuilds');
}

function getFilePath(subSessionId: string, storageDir: string): string {
  return path.join(storageDir, `${FILE_PREFIX}${subSessionId}.json`);
}

const isRecord = (value: unknown): value is ReplayRebuildRecord => {
  if (!value || typeof value !== 'object') return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.subSessionId === 'string' &&
    Array.isArray(r.sessionNums) &&
    typeof r.completedAt === 'number' &&
    typeof r.sweepSpeed === 'number' &&
    typeof r.confirmSpeed === 'number' &&
    Array.isArray(r.coverage)
  );
};

export async function saveRebuildRecord(
  record: ReplayRebuildRecord
): Promise<void> {
  const storageDir = getStorageDir();
  try {
    await fsp.mkdir(storageDir, { recursive: true });
  } catch {
    // ignore
  }

  const filePath = getFilePath(record.subSessionId, storageDir);
  const tempPath = `${filePath}.${process.pid}.tmp`;
  try {
    await fsp.writeFile(tempPath, JSON.stringify(record), 'utf8');
    await fsp.rename(tempPath, filePath);
    logger.info(
      `[ReplayRebuilds] Saved rebuild record for ${record.subSessionId}`
    );
  } catch (err) {
    await fsp.unlink(tempPath).catch(() => undefined);
    logger.error('[ReplayRebuilds] Failed to save rebuild record:', err);
    throw err;
  }

  await pruneOldRebuildFiles(storageDir);
}

export async function loadRebuildRecord(
  subSessionId: string
): Promise<ReplayRebuildRecord | null> {
  const storageDir = getStorageDir();
  const filePath = getFilePath(subSessionId, storageDir);
  try {
    const text = await fsp.readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(text);
    return isRecord(parsed) ? parsed : null;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      logger.warn(`[ReplayRebuilds] Failed to read rebuild record:`, err);
    }
    return null;
  }
}

async function pruneOldRebuildFiles(storageDir: string): Promise<void> {
  const files = await listArchiveFiles(
    storageDir,
    FILE_PREFIX,
    '[ReplayRebuilds]'
  );
  if (files.length <= MAX_REBUILD_FILES) return;
  const toRemove = files.slice(0, files.length - MAX_REBUILD_FILES);
  await Promise.all(
    toRemove.map((f) =>
      pruneArchiveFile(f, new Map(), new Map(), '[ReplayRebuilds]')
    )
  );
}

/** RebuildIndex implementation backed by the rebuild storage. */
export function createRebuildIndex(): RebuildIndex {
  return {
    async has(subSessionId: string): Promise<boolean> {
      const record = await loadRebuildRecord(subSessionId);
      return record !== null;
    },
  };
}
