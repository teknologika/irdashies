export type DriverRatingBadgeProps = {
  license: string | undefined;
  rating: number | undefined;
};

export const DriverRatingBadge = ({
  license = '',
  rating = 0,
}: DriverRatingBadgeProps) => {
  const licenseLevel = license.charAt(0);
  const colorMap: { [key: string]: string } = {
    A: 'border-blue-500 bg-blue-800',
    B: 'border-green-500 bg-green-800',
    C: 'border-yellow-500 bg-yellow-800',
    D: 'border-orange-500 bg-orange-800',
    R: 'border-red-500 bg-red-800',
  };
  const color = colorMap[licenseLevel] ?? '';
  const simplifiedRating = (rating / 1000).toFixed(1);
  return (
    <div
      className={`text-center text-white w-[85px] border-solid rounded-md text-xs m-0.5 px-1 border-2 ${color}`}
    >
      {license} {simplifiedRating}k
    </div>
  );
};
