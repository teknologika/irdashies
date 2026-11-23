import { ipcMain } from 'electron';
import type { ReplayRebuildRuntime } from '../processors/replayRebuildRuntime';
import logger from '../logger';

export function setupReplayRebuildBridge(runtime: ReplayRebuildRuntime): void {
  ipcMain.handle(
    'replayRebuild:start',
    async (_event, sessionNums: number[]) => {
      try {
        await runtime.start(sessionNums);
      } catch (err) {
        logger.error('[ReplayRebuildBridge] start failed:', err);
        throw err;
      }
    }
  );

  ipcMain.handle('replayRebuild:resume', async () => {
    try {
      await runtime.resume();
    } catch (err) {
      logger.error('[ReplayRebuildBridge] resume failed:', err);
      throw err;
    }
  });

  ipcMain.handle('replayRebuild:cancel', async () => {
    try {
      await runtime.cancel();
    } catch (err) {
      logger.error('[ReplayRebuildBridge] cancel failed:', err);
      throw err;
    }
  });
}
