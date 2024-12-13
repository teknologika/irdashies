import { useEffect, useRef, useState } from 'react';
import {
  findDirection,
  findIntersectionPoint,
  parsePathData,
  splitPathData,
} from './svgUtils';

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
  const [direction, setDirection] = useState<'clockwise' | 'anticlockwise'>(
    'clockwise'
  );
  const [intersection, setIntersection] = useState<{
    x: number;
    y: number;
    length: number;
  }>({ x: 0, y: 0, length: 0 });

  useEffect(() => {
    const direction = findDirection(trackId);
    setDirection(direction);
  }, [trackId]);

  useEffect(() => {
    const ref = containerRef?.current;
    const insidePath = ref?.querySelector(
      'g.generated-inside-path path'
    ) as SVGPathElement | null;
    const combinedPath = ref?.querySelector(
      'g.active path'
    ) as SVGPathElement | null;

    if (!insidePath || !combinedPath) return;

    // Parse the path data and split it into inside and outside paths
    const pathData = combinedPath.getAttribute('d');
    if (pathData) {
      const commands = parsePathData(pathData);
      const { inside } = splitPathData(commands);

      // Set the inside path data so we can use it track the car
      insidePath.setAttribute('d', inside);
    }
  }, [trackSvgString]);

  useEffect(() => {
    const ref = containerRef?.current;
    const insidePath = ref?.querySelector(
      'g.generated-inside-path path'
    ) as SVGPathElement | null;
    const startFinishPath = ref?.querySelector(
      'g.start-finish path'
    ) as SVGPathElement | null;

    if (!insidePath || !startFinishPath) return;

    // Get the intersection point and length
    const intersection = findIntersectionPoint(insidePath, startFinishPath);

    if (!intersection) return;

    setIntersection(intersection);
  }, [trackSvgString, direction]);

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

    if (!insidePath || !startFinishPath) return;

    const totalLength = insidePath?.getTotalLength() || 0;
    indicator?.setAttribute('class', 'fill-red-500');
    function updateCarPosition(percent: number) {
      const adjustedLength = (totalLength * (percent / 100)) % totalLength;
      const length =
        direction === 'anticlockwise'
          ? (intersection.length + adjustedLength) % totalLength
          : (intersection.length - adjustedLength + totalLength) % totalLength;
      const point = insidePath?.getPointAtLength(length);

      if (indicator && point) {
        indicator.setAttribute('cx', `${point.x}`);
        indicator.setAttribute('cy', `${point.y}`);
      }
    }

    updateCarPosition(progress ?? 0);
  }, [progress, trackSvgString, direction, intersection]);

  return (
    <div
      ref={containerRef}
      dangerouslySetInnerHTML={{ __html: trackSvgString }}
    ></div>
  );
};
