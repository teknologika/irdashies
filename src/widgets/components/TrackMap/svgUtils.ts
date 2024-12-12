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
  path1: SVGPathElement,
  path2: SVGPathElement
) => {
  if (path1 && path2) {
    const path1Length = path1.getTotalLength();
    const path2Length = path2.getTotalLength();
    const step = 100; // Increase step size to reduce the number of points checked

    for (let i = 0; i < path1Length; i += step) {
      const p1 = path1.getPointAtLength(i);
      const p2 = path1.getPointAtLength(i + step);

      for (let j = 0; j < path2Length; j += step) {
        const p3 = path2.getPointAtLength(j);
        const p4 = path2.getPointAtLength(j + step);

        const intersection = lineIntersection(p1, p2, p3, p4);

        if (intersection) {
          return {
            x: intersection.x,
            y: intersection.y,
            length: i,
          };
        }
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
export const findDirection = (turnsSvgGroup: SVGGElement) => {
  // get text position of turn 1
  const turns = Array.from(
    turnsSvgGroup?.querySelectorAll('text') || []
  ).filter((el) => !isNaN(Number(el.textContent)));

  const turnsXyPos = Array.from(turns).map((turn) => {
    const turnPosition = turn?.getBoundingClientRect();
    return { x: turnPosition.x, y: turnPosition.y };
  });

  // Helper function to calculate angle between two points
  function calculateAngle(
    point1: { x: number; y: number },
    point2: { x: number; y: number }
  ) {
    return Math.atan2(point2.y - point1.y, point2.x - point1.x);
  }

  // Calculate angular changes
  const angles = [];
  for (let i = 0; i < turnsXyPos.length; i++) {
    const current = turnsXyPos[i];
    const next = turnsXyPos[(i + 1) % turns.length]; // Wrap around for closed loop
    angles.push(calculateAngle(current, next));
  }

  // Calculate total angular change
  let totalAngularChange = 0;
  for (let i = 0; i < angles.length; i++) {
    const currentAngle = angles[i];
    const nextAngle = angles[(i + 1) % angles.length]; // Wrap around for closed loop
    let deltaAngle = nextAngle - currentAngle;

    // Normalize to [-Math.PI, Math.PI]
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

    totalAngularChange += deltaAngle;
  }

  // Determine if the track is clockwise or anti-clockwise
  if (totalAngularChange < 0) {
    console.log('clockwise');
  } else {
    console.log('anticlockwise');
  }
};
