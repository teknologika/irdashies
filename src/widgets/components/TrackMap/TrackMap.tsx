import { useEffect, useRef, useState } from 'react';

export const useTrackLoader = (trackId: number) => {
  const [svg, setSvg] = useState<string>('');
  useEffect(() => {
    async function fetchTrack() {
      const url = new URL(`./tracks/${trackId}.svg`, import.meta.url).href;
      const track = await fetch(url);
      const svg = await track.text();
      setSvg(svg);
    }

    fetchTrack();
  }, [trackId]);

  return svg;
};

export const TrackMap = ({
  trackId,
  progress,
}: {
  trackId: number;
  progress: number;
}) => {
  const trackSvgString = useTrackLoader(trackId);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = containerRef?.current;
    const insidePath = ref?.querySelector(
      'g.generated-inside-path path'
    ) as SVGPathElement | null;
    const startFinishPath = ref?.querySelector(
      'g.start-finish path'
    ) as SVGPathElement | null;
    const indicator = ref?.querySelector(
      'g.car-indicator circle'
    ) as SVGPathElement | null;

    const direction = insidePath?.getAttribute('direction') as
      | 'clockwise'
      | 'anticlockwise';
    const intersectionLength = +(
      insidePath?.getAttribute('intersection-length') || 0
    );

    if (!insidePath || !startFinishPath) return;

    const totalLength = insidePath?.getTotalLength() || 0;
    indicator?.setAttribute('class', 'fill-red-500');
    function updateCarPosition(percent: number) {
      const adjustedLength = (totalLength * (percent / 100)) % totalLength;
      const length =
        direction === 'anticlockwise'
          ? (intersectionLength + adjustedLength) % totalLength
          : (intersectionLength - adjustedLength + totalLength) % totalLength;
      const point = insidePath?.getPointAtLength(length);

      if (indicator && point) {
        indicator.setAttribute('cx', `${point.x}`);
        indicator.setAttribute('cy', `${point.y}`);
      }
    }

    updateCarPosition(progress ?? 0);
  }, [trackSvgString, progress]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: trackSvgString }}
    ></div>
  );
};
