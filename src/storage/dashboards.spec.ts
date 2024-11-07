import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createDefaultDashboardIfNotExists,
  listDashboards,
  getDashboard,
  saveDashboard,
} from './dashboards';
import { defaultDashboard } from './defaultDashboard';
import * as storage from './storage';

vi.mock('./storage', () => ({
  readData: vi.fn(),
  writeData: vi.fn(),
}));

describe('dashboards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createDefaultDashboardIfNotExists', () => {
    it('should create default dashboard if none exists', () => {
      createDefaultDashboardIfNotExists();

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: defaultDashboard,
      });
    });

    it('should not create default dashboard if one already exists', () => {
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: defaultDashboard,
      });

      createDefaultDashboardIfNotExists();

      expect(storage.writeData).not.toHaveBeenCalled();
    });
  });

  describe('listDashboards', () => {
    it('should return an empty object if no dashboards exist', () => {
      vi.spyOn(storage, 'readData').mockReturnValueOnce(null);

      const dashboards = listDashboards();

      expect(dashboards).toEqual({});
    });

    it('should return existing dashboards', () => {
      const dashboardsData = { default: defaultDashboard };
      vi.spyOn(storage, 'readData').mockReturnValueOnce(dashboardsData);

      const dashboards = listDashboards();

      expect(dashboards).toEqual(dashboardsData);
    });
  });

  describe('getDashboard', () => {
    it('should return undefined if no dashboards exist', () => {
      vi.spyOn(storage, 'readData').mockReturnValueOnce(null);

      const dashboard = getDashboard('default');

      expect(dashboard).toBeUndefined();
    });

    it('should return the requested dashboard if it exists', () => {
      const dashboardsData = { default: defaultDashboard };
      vi.spyOn(storage, 'readData').mockReturnValueOnce(dashboardsData);

      const dashboard = getDashboard('default');

      expect(dashboard).toEqual(defaultDashboard);
    });
  });

  describe('saveDashboard', () => {
    it('should save a new dashboard', () => {
      const newDashboard = { widgets: [] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce(null);

      saveDashboard('newDashboard', newDashboard);

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        newDashboard,
      });
    });

    it('should update an existing dashboard', () => {
      const existingDashboards = { default: defaultDashboard };
      const updatedDashboard = { widgets: [] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce(existingDashboards);

      saveDashboard('default', updatedDashboard);

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: updatedDashboard,
      });
    });
  });
});
