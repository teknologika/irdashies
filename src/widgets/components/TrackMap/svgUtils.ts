// Function to parse the `d` attribute into path commands
export const parsePathData = (d: string): string[] => {
  const commands = d.match(/([MLCZHVTA][^MLCZHVTA]*)/gi); // Matches path commands
  return commands ? commands.map((cmd) => cmd.trim()) : [];
};

// Function to split the path into inside and outside parts
export const splitPathData = (
  commands: string[]
): { inside: string; outside: string } => {
  const halfwayIndex = Math.ceil(commands.length / 2);
  const insideCommands = commands.slice(0, halfwayIndex).join(' ');
  const outsideCommands = commands.slice(halfwayIndex).join(' ');
  return { inside: insideCommands, outside: outsideCommands };
};

// Function to find the intersection of two lines
export const lineIntersection = (
  p1: DOMPoint,
  p2: DOMPoint,
  p3: DOMPoint,
  p4: DOMPoint
) => {
  const denominator =
    (p4.y - p3.y) * (p2.x - p1.x) - (p4.x - p3.x) * (p2.y - p1.y);
  if (denominator === 0) return null;

  const ua =
    ((p4.x - p3.x) * (p1.y - p3.y) - (p4.y - p3.y) * (p1.x - p3.x)) /
    denominator;
  const ub =
    ((p2.x - p1.x) * (p1.y - p3.y) - (p2.y - p1.y) * (p1.x - p3.x)) /
    denominator;

  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return null;

  const x = p1.x + ua * (p2.x - p1.x);
  const y = p1.y + ua * (p2.y - p1.y);

  return { x, y };
};

// Find the intersection point using a more efficient approach
export const findIntersectionPoint = (
  path1: SVGPathElement, // Inside path
  path2: SVGPathElement // Start/Finish path
) => {
  if (!path1 || !path2) return null;

  const path1Length = path1.getTotalLength();
  const path2Length = path2.getTotalLength();
  const initialStep = Math.max(path1Length, path2Length) / 100; // Initial coarse step

  for (let i = 0; i < path1Length; i += initialStep) {
    const p1 = path1.getPointAtLength(i);
    const p2 = path1.getPointAtLength(Math.min(i + initialStep, path1Length));

    for (let j = 0; j < path2Length; j += initialStep) {
      const p3 = path2.getPointAtLength(j);
      const p4 = path2.getPointAtLength(Math.min(j + initialStep, path2Length));

      // Skip if bounding boxes don't overlap
      const bbox1 = {
        xMin: Math.min(p1.x, p2.x),
        xMax: Math.max(p1.x, p2.x),
        yMin: Math.min(p1.y, p2.y),
        yMax: Math.max(p1.y, p2.y),
      };
      const bbox2 = {
        xMin: Math.min(p3.x, p4.x),
        xMax: Math.max(p3.x, p4.x),
        yMin: Math.min(p3.y, p4.y),
        yMax: Math.max(p3.y, p4.y),
      };

      if (
        bbox1.xMax < bbox2.xMin ||
        bbox1.xMin > bbox2.xMax ||
        bbox1.yMax < bbox2.yMin ||
        bbox1.yMin > bbox2.yMax
      ) {
        continue; // No overlap, skip
      }

      // Check intersection if bounding boxes overlap
      const intersection = lineIntersection(p1, p2, p3, p4);

      if (intersection) {
        return { x: intersection.x, y: intersection.y, length: i };
      }
    }
  }

  return null;
};

// Function to find the direction of the track based on the order of turns
// looks at the position of the first two turns to determine the direction
export const findDirection2 = (turnsSvgGroup: SVGGElement) => {
  // get text position of turn 1
  const turn1 = turnsSvgGroup?.querySelector('text') as SVGTextElement;
  const turn1Position = turn1?.getBoundingClientRect();

  // get text position of turn 2
  const turn2 = turnsSvgGroup?.querySelector(
    'text:nth-child(2)'
  ) as SVGTextElement;
  const turn2Position = turn2?.getBBox();

  if (turn1Position && turn2Position) {
    const direction = {
      x: turn2Position.x - turn1Position.x,
      y: turn2Position.y - turn1Position.y,
    };

    return direction.x > 0 ? 'clockwise' : 'anticlockwise';
  }

  return 'clockwise';
};

// Function to find the direction of the track based on the order of turns
// looks at the position of the first two turns to determine the direction
export const findDirection = (trackId: number) => {
  if (
    [
      3, 8, 11, 12, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
      37, 39, 40, 47, 51, 52, 53, 94, 101, 103, 104, 105, 110, 113, 114, 115,
      116, 120, 121, 122, 123, 124, 129, 130, 131, 132, 133, 135, 136, 137, 138,
      143, 152, 158, 161, 162, 169, 170, 171, 175, 176, 178, 188, 189, 190, 191,
      192, 193, 198, 201, 202, 203, 204, 208, 211, 212, 213, 214, 215, 217, 225,
      226, 227, 229, 230, 231, 232, 235, 236, 237, 238, 245, 248, 256, 256, 256,
      266, 267, 271, 273, 274, 275, 276, 277, 279, 286, 287, 288, 295, 299, 303,
      304, 305, 314, 320, 330, 331, 334, 335, 339, 340, 344, 350, 351, 357, 362,
      364, 365, 366, 371, 373, 374, 380, 381, 382, 383, 384, 386, 387, 388, 398,
      400, 414, 418, 419, 424, 426, 428, 429, 430, 431, 437, 438, 442, 443, 446,
      447, 452, 453, 462, 475, 476, 477, 478, 479, 480, 481, 482, 488, 489, 493,
      494, 496, 497, 500, 506, 513, 514, 518, 519, 520, 522,
    ].includes(trackId)
  ) {
    return 'anticlockwise';
  }

  return 'clockwise';
};
