type DriverClassHeaderProps = {
  className: string;
  classIdx: number;
};

export const DriverClassHeader = ({
  className,
  classIdx,
}: DriverClassHeaderProps) => {
  return (
    <tr>
      <td></td>
      <td colSpan={4} className="p-0">
        <div
          className={`[text-shadow:_1px_1px_0px_rgb(0_0_0)] font-bold mt-3 px-2 py-1 inline-block border-l-4 ${classColorMap[classIdx % classColorMap.length]}`}
        >
          {className}
        </div>
      </td>
    </tr>
  );
};

export const classColorMap = [
  'bg-yellow-500 border-yellow-500',
  'bg-blue-500 border-blue-500',
  'bg-pink-500 border-pink-500',
  'bg-purple-500 border-purple-500',
];
