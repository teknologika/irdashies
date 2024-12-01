import { getTailwindColor } from '../../../utils/colors';

type DriverClassHeaderProps = {
  className: string | undefined;
  classColor: number | undefined;
  totalDrivers: number | undefined;
  sof: number | undefined;
};

export const DriverClassHeader = ({
  className,
  classColor,
  totalDrivers,
  sof,
}: DriverClassHeaderProps) => {
  if (!className) {
    return (
      <tr>
        <td colSpan={6} className="pb-3"></td>
      </tr>
    );
  }

  return (
    <tr>
      <td></td>
      <td colSpan={4} className="p-0">
        <div className={`[text-shadow:_1px_1px_1px_rgba(0_0_0/0.2)] mt-3 flex`}>
          <span
            className={`${getTailwindColor(classColor).classHeader} px-2 py-1 font-bold border-l-4`}
          >
            {className}
          </span>
          <span
            className={`${getTailwindColor(classColor).driverIcon} px-2 py-1  font-light flex items-center`}
          >
            {sof ? `${sof?.toFixed(0)} ` : ''} ({totalDrivers})
          </span>
        </div>
      </td>
    </tr>
  );
};
