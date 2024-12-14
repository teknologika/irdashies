import fs, { readdirSync } from 'fs';
import { JSDOM } from 'jsdom';
import {
  findDirection,
  findIntersectionPoint,
  parsePathData,
  splitPathData,
} from './svgUtils';

const processTrackSvg = (trackId: string) => {
  const track = fs.readFileSync(
    `./src/widgets/components/TrackMap/tracks/${trackId}.svg`
  );

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
  fs.writeFileSync(
    `./src/widgets/components/TrackMap/tracks/${trackId}.svg`,
    root.innerHTML
  );
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
    const { inside } = splitPathData(commands);

    // Set the inside path data so we can use it track the car
    insidePath.setAttribute('d', inside);
  }

  return insidePath;
};

readdirSync('./src/widgets/components/TrackMap/tracks').forEach((file) => {
  if (file.endsWith('.svg')) {
    const trackId = file.split('.')[0];
    processTrackSvg(trackId);
  }
});
