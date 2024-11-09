import { BrowserWindow } from 'electron';
import { DashboardWidget, updateDashboardWidget } from '../storage/dashboards';

export const trackWindowMovement = (
  widget: DashboardWidget,
  browserWindow: BrowserWindow
) => {
  // Tracks dragged events on window and updates the widget layout
  browserWindow.on('moved', () => {
    const [x, y] = browserWindow.getPosition();
    widget.layout.x = x;
    widget.layout.y = y;

    updateDashboardWidget(widget, 'default');
  });
};
