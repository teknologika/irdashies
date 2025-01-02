import fs, { readdirSync } from 'fs';
import { JSDOM } from 'jsdom';
import {
  findDirection,
  findIntersectionPoint,
  parsePathData,
  splitPathData,
} from './svg-utils';

const tracksDir = `./src/frontend/components/TrackMap/tracks`;
const processTrackSvg = (trackId: string) => {
  const track = fs.readFileSync(`${tracksDir}/${trackId}.svg`);

  // Create svg element
  const dom = new JSDOM(track.toString());
  const root = dom.window.document.documentElement;
  const svg = root.querySelector('svg') as SVGSVGElement;
  const startFinishPath = svg.querySelector(
    'g.start-finish path'
  ) as SVGPathElement;

  // generate inside path
  const insidePath = generateInsidePath(svg);

  if (!insidePath) throw new Error('Inside path not found');

  // find the intersection point for start/finish line and track
  const intersection =
    findIntersectionPoint(insidePath, startFinishPath)?.length || 0;

  // find the direction
  const direction = findDirection(+trackId);

  insidePath.setAttribute('intersection-length', `${intersection}`);
  insidePath.setAttribute('direction', direction);

  // save svg
  fs.writeFileSync(`${tracksDir}/${trackId}.svg`, root.innerHTML);
};

const generateInsidePath = (svg: SVGElement) => {
  const insidePath = svg.querySelector(
    'g.generated-inside-path path'
  ) as SVGPathElement | null;
  const combinedPath = svg.querySelector(
    'g.active path'
  ) as SVGPathElement | null;

  if (!insidePath || !combinedPath) return;

  // Parse the path data and split it into inside and outside paths
  const pathData = combinedPath.getAttribute('d');
  if (pathData) {
    const commands = parsePathData(pathData);
    let { inside } = splitPathData(commands);

    // Set the inside path data so we can use it track the car
    // close path if it's not already closed
    if (inside[inside.length - 1].toLocaleUpperCase() !== 'Z') {
      inside = inside.concat('Z');
    }
    insidePath.setAttribute('d', inside);
  }

  return insidePath;
};

// Process all track svgs
export const processTrackSvgs = () => {
  readdirSync(tracksDir).forEach((file) => {
    if (file.endsWith('.svg')) {
      const trackId = file.split('.')[0];
      processTrackSvg(trackId);
    }
  });
};
