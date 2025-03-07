export const getTailwindStyle = (
  color?: number
): {
  driverIcon: string;
  classHeader: string;
  fill: string;
  canvasFill: string;
} => {
  const hex = `#${color?.toString(16)}`;
  const classColorMap: Record<
    string,
    {
      driverIcon: string;
      classHeader: string;
      fill: string;
      canvasFill: string;
    }
  > = {
    '#ffda59': {
      driverIcon: 'bg-orange-800 border-orange-500',
      classHeader: 'bg-orange-500 border-orange-500',
      fill: 'fill-orange-500',
      canvasFill: getColor('orange'),
    },
    '#33ceff': {
      driverIcon: 'bg-blue-800 border-blue-500',
      classHeader: 'bg-blue-500 border-blue-500',
      fill: 'fill-blue-500',
      canvasFill: getColor('blue'),
    },
    '#ff5888': {
      driverIcon: 'bg-pink-800 border-pink-500',
      classHeader: 'bg-pink-500 border-pink-500',
      fill: 'fill-pink-500',
      canvasFill: getColor('pink'),
    },
    '#ae6bff': {
      driverIcon: 'bg-purple-800 border-purple-500',
      classHeader: 'bg-purple-500 border-purple-500',
      fill: 'fill-purple-500',
      canvasFill: getColor('purple'),
    },
    '#ffffff': {
      driverIcon: 'bg-sky-800 border-sky-500',
      classHeader: 'bg-sky-500 border-sky-500',
      fill: 'fill-sky-500',
      canvasFill: getColor('sky'),
    },
  };

  return classColorMap[hex] ?? classColorMap['#ffffff'];
};

export const getColor = (color?: string, value = 500) => {
  const styles = getComputedStyle(document.documentElement);
  const computedColor = styles.getPropertyValue(`--color-${color}-${value}`);
  return computedColor;
};
