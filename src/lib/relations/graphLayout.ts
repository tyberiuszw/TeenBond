import { Role } from '@/types/auth';
import { GraphNodePosition, RelationshipNode, RelationshipEdge } from '@/types/relationship';

/**
 * Calculates responsive constellation coordinates for team members (2..12)
 * on a virtual canvas (default 700x500).
 * - Leader is always positioned at the top on the central vertical axis (x = width/2, y = 110)
 * - Regular members are distributed on an elliptical constellation arc below the leader
 */
export function calculateConstellationLayout(
  members: { id: string; name: string; role: Role; chameleonColor?: string; color?: string }[],
  width = 700,
  height = 500
): GraphNodePosition[] {
  if (!members || members.length === 0) return [];

  const leader = members.find((m) => m.role === 'leader') || members[0];
  const regularMembers = members.filter((m) => m.id !== leader.id);

  const positions: GraphNodePosition[] = [];

  // Leader on top
  positions.push({
    id: leader.id,
    name: leader.name,
    role: leader.role,
    color: leader.color || leader.chameleonColor || '#10B981',
    x: Math.round(width / 2),
    y: 110,
  });

  const memberCount = regularMembers.length;
  if (memberCount === 0) return positions;

  // Specific canonical positions for standard Alfa 5-person team (4 regular members)
  if (memberCount === 4) {
    const fixedAlpha = [
      { x: 180, y: 240 }, // Left high (Bartek)
      { x: 520, y: 240 }, // Right high (Celina)
      { x: 230, y: 400 }, // Left low (Dawid)
      { x: 470, y: 400 }, // Right low (Ewa)
    ];

    regularMembers.forEach((m, idx) => {
      positions.push({
        id: m.id,
        name: m.name,
        role: m.role,
        color: m.color || m.chameleonColor || '#3B82F6',
        x: fixedAlpha[idx].x,
        y: fixedAlpha[idx].y,
      });
    });
    return positions;
  }

  // Dynamic distribution for any N members
  const centerX = width / 2;
  const centerY = 270;
  const radiusX = Math.min(260, width * 0.38);
  const radiusY = Math.min(170, height * 0.35);

  const angleStep = Math.PI / (memberCount + 1);
  regularMembers.forEach((m, idx) => {
    const angle = Math.PI - (idx + 1) * angleStep; // from left PI to right 0
    const x = Math.round(centerX + radiusX * Math.cos(angle));
    const y = Math.round(centerY + radiusY * Math.sin(angle) * 0.95);

    positions.push({
      id: m.id,
      name: m.name,
      role: m.role,
      color: m.color || m.chameleonColor || '#3B82F6',
      x,
      y,
    });
  });

  return positions;
}

/**
 * Calculates midpoint coordinates between two points (for weight badges).
 */
export function calculateMidpoint(
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
): { x: number; y: number } {
  return {
    x: Math.round((pointA.x + pointB.x) / 2),
    y: Math.round((pointA.y + pointB.y) / 2),
  };
}
