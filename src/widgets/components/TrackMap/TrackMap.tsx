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

export type TrackMapProps = {
  trackId: number;
  driver: {
    progress: number;
    carIdx: number;
  };
};

export const TrackMap = ({ trackId, driver }: TrackMapProps) => {
  const trackSvgString = useTrackLoader(trackId);
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress, carIdx } = driver;

  useEffect(() => {
    const ref = containerRef?.current;
    const indicator = ref?.querySelector(
      'g.car-indicator circle'
    ) as SVGPathElement | null;

    // add text to svg
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.textContent = carIdx.toString();
    text.setAttribute('x', '50');
    text.setAttribute('y', '50');
    indicator?.appendChild(text);
  }, [trackSvgString, carIdx]);

  useEffect(() => {
    const ref = containerRef?.current;
    const insidePath = ref?.querySelector(
      'g.generated-inside-path path'
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

    if (!insidePath) return;

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
