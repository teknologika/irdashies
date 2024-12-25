import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getOrCreateDefaultDashboard,
  listDashboards,
  getDashboard,
  saveDashboard,
  updateDashboardWidget,
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
      getOrCreateDefaultDashboard();

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: defaultDashboard,
      });
    });

    it('should not create default dashboard if one already exists', () => {
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: defaultDashboard,
      });

      getOrCreateDefaultDashboard();

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

      expect(dashboard).toBeNull();
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

  describe('updateDashboardWidget', () => {
    it('should update a widget in the default dashboard', () => {
      const updatedWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 100, y: 100, width: 600, height: 120 },
      };
      const updatedDashboard = { widgets: [updatedWidget] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: defaultDashboard,
      });

      saveDashboard('default', updatedDashboard);

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: updatedDashboard,
      });
    });

    it('should update a widget in a specific dashboard', () => {
      const updatedWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 100, y: 100, width: 600, height: 120 },
      };
      const updatedDashboard = { widgets: [updatedWidget] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        custom: defaultDashboard,
      });

      saveDashboard('custom', updatedDashboard);

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        custom: updatedDashboard,
      });
    });
  });
  describe('updateDashboardWidget', () => {
    it('should throw an error if the default dashboard does not exist', () => {
      const updatedWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 100, y: 100, width: 600, height: 120 },
      };
      vi.spyOn(storage, 'readData').mockReturnValueOnce(null);

      expect(() => updateDashboardWidget(updatedWidget)).toThrow(
        'Default dashboard not found'
      );
    });

    it('should update an existing widget in the default dashboard', () => {
      const existingWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 0, y: 0, width: 300, height: 100 },
      };
      const updatedWidget = {
        id: 'input',
        enabled: false,
        layout: { x: 100, y: 100, width: 600, height: 120 },
      };
      const existingDashboard = { widgets: [existingWidget] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: existingDashboard,
      });

      updateDashboardWidget(updatedWidget);

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: { widgets: [updatedWidget] },
      });
    });

    it('should update an existing widget in a specific dashboard', () => {
      const existingWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 0, y: 0, width: 300, height: 100 },
      };
      const updatedWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 100, y: 100, width: 600, height: 120 },
      };
      const existingDashboard = { widgets: [existingWidget] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        custom: existingDashboard,
      });

      updateDashboardWidget(updatedWidget, 'custom');

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        custom: { widgets: [updatedWidget] },
      });
    });

    it('should not update a widget if it does not exist in the dashboard', () => {
      const updatedWidget = {
        id: 'input',
        enabled: true,
        layout: { x: 100, y: 100, width: 600, height: 120 },
      };
      const existingDashboard = { widgets: [] };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: existingDashboard,
      });

      updateDashboardWidget(updatedWidget);

      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: { widgets: [] },
      });
    });
  });

  describe('getOrCreateDefaultDashboard', () => {
    it('should return the default dashboard if it exists', () => {
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: defaultDashboard,
      });

      const dashboard = getOrCreateDefaultDashboard();

      expect(dashboard).toEqual(defaultDashboard);
    });

    it('should create and return the default dashboard if it does not exist', () => {
      vi.spyOn(storage, 'readData').mockReturnValueOnce(null);

      const dashboard = getOrCreateDefaultDashboard();

      expect(dashboard).toEqual(defaultDashboard);
      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: defaultDashboard,
      });
    });

    it('should add missing widgets to the default dashboard if some widgets are missing', () => {
      const incompleteDashboard = {
        widgets: defaultDashboard.widgets.slice(0, 1),
      };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: incompleteDashboard,
      });

      const dashboard = getOrCreateDefaultDashboard();

      expect(dashboard.widgets).toEqual(defaultDashboard.widgets);
      expect(storage.writeData).toHaveBeenCalledWith('dashboards', {
        default: defaultDashboard,
      });
    });

    it('should not modify the default dashboard if all widgets are present', () => {
      const completeDashboard = { ...defaultDashboard };
      vi.spyOn(storage, 'readData').mockReturnValueOnce({
        default: completeDashboard,
      });

      const dashboard = getOrCreateDefaultDashboard();

      expect(dashboard).toEqual(completeDashboard);
      expect(storage.writeData).not.toHaveBeenCalled();
    });
  });
});
