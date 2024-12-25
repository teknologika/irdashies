import { BrowserWindow } from 'electron';
import { DashboardWidget, updateDashboardWidget } from './storage/dashboards';

export const trackWindowMovement = (
  widget: DashboardWidget,
  browserWindow: BrowserWindow
) => {
  // Tracks dragged events on window and updates the widget layout
  browserWindow.on('moved', () => updateWidgetLayout(browserWindow, widget));
  browserWindow.on('resized', () => updateWidgetLayout(browserWindow, widget));
};

function updateWidgetLayout(
  browserWindow: BrowserWindow,
  widget: DashboardWidget
) {
  const [x, y] = browserWindow.getPosition();
  const [width, height] = browserWindow.getSize();
  widget.layout.x = x;
  widget.layout.y = y;
  widget.layout.width = width;
  widget.layout.height = height;

  updateDashboardWidget(widget, 'default');
}
