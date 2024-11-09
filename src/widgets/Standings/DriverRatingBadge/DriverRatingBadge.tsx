export type DriverRatingBadgeProps = {
  licenseString: string | undefined;
  rating: number | undefined;
};

export const DriverRatingBadge = ({
  licenseString = '',
  rating = 0,
}: DriverRatingBadgeProps) => {
  const licenseLevel = licenseString.charAt(0);
  const colorMap: { [key: string]: string } = {
    A: 'border-blue-500 bg-blue-800',
    B: 'border-green-500 bg-green-800',
    C: 'border-yellow-500 bg-yellow-800',
    D: 'border-orange-500 bg-orange-800',
    R: 'border-red-500 bg-red-800',
  };
  const color = colorMap[licenseLevel] || 'border-blue-500 bg-blue-800';
  const simplifiedRating = (rating / 1000).toFixed(1);
  return (
    <div
      className={`text-center w-[85px] border-solid rounded-md text-xs m-0.5 px-1 border-2 ${color}`}
    >
      {licenseString} {simplifiedRating}k
    </div>
  );
};
