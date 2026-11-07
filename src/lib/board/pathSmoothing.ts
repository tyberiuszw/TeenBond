/**
 * Smooths raw point array [x0, y0, x1, y1, ...] into cubic/quadratic Bezier SVG path
 */
export function pointsToSvgPath(points: number[]): string {
  if (!points || points.length < 2) return '';

  if (points.length === 2) {
    return `M ${points[0]} ${points[1]} L ${points[0] + 0.1} ${points[1] + 0.1}`;
  }

  if (points.length === 4) {
    return `M ${points[0]} ${points[1]} L ${points[2]} ${points[3]}`;
  }

  let d = `M ${points[0]} ${points[1]}`;
  for (let i = 2; i < points.length - 2; i += 2) {
    const xc = (points[i] + points[i + 2]) / 2;
    const yc = (points[i + 1] + points[i + 3]) / 2;
    d += ` Q ${points[i]} ${points[i + 1]} ${xc} ${yc}`;
  }

  const lastX = points[points.length - 2];
  const lastY = points[points.length - 1];
  d += ` L ${lastX} ${lastY}`;

  return d;
}

/**
 * Snaps line end point to nearest 45 degree angle when Shift key is pressed
 */
export function snapLineAngle(
  startX: number,
  startY: number,
  endX: number,
  endY: number
): { x: number; y: number } {
  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) return { x: endX, y: endY };

  const angleRad = Math.atan2(dy, dx);
  const snapStep = Math.PI / 4; // 45 degrees
  const snappedAngle = Math.round(angleRad / snapStep) * snapStep;

  return {
    x: startX + Math.cos(snappedAngle) * distance,
    y: startY + Math.sin(snappedAngle) * distance,
  };
}

/**
 * Generates catenary sag Bezier curve between two pushpins for Red Yarn
 */
export function getRedYarnBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const midX = (x1 + x2) / 2;
  // Natural physical gravity sag proportional to distance
  const sag = Math.min(60, Math.max(15, distance * 0.15));
  const midY = (y1 + y2) / 2 + sag;

  return `M ${x1} ${y1} Q ${midX} ${midY} ${x2} ${y2}`;
}
