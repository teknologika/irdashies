import { useDashboard } from '@irdashies/context';
import { SettingsForm } from './SettingsForm';

export const Settings = () => {
  const { currentDashboard, onDashboardUpdated } = useDashboard();
  if (!currentDashboard || !onDashboardUpdated) {
    return <>Loading...</>;
  }

  return (
    <SettingsForm
      currentDashboard={currentDashboard}
      onDashboardUpdated={onDashboardUpdated}
    />
  );
};
