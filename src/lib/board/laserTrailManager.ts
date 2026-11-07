export interface LaserPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface ActiveLaserPoint {
  x: number;
  y: number;
  opacity: number;
}

/**
 * Laser Pointer Trail Manager
 * Models a glowing laser trail with strictly enforced 1.5-second (1500 ms) linear decay.
 * R5-BOARD-03 compliance:
 * - Age <= 1500 ms: opacity = 1 - (age / 1500)
 * - Age > 1500 ms: expired and discarded
 */
export class LaserPointerTrail {
  private points: LaserPoint[] = [];
  public readonly lifetimeMs: number = 1500; // 1.5 seconds

  public addPoint(x: number, y: number, now: number = Date.now()): void {
    this.points.push({ x, y, timestamp: now });
  }

  public getActivePoints(now: number = Date.now()): ActiveLaserPoint[] {
    // Filter out points older than 1500 ms
    this.points = this.points.filter((p) => now - p.timestamp <= this.lifetimeMs);
    return this.points.map((p) => {
      const age = now - p.timestamp;
      const opacity = Math.max(0, 1 - age / this.lifetimeMs);
      return { x: p.x, y: p.y, opacity };
    });
  }

  public clear(): void {
    this.points = [];
  }

  public getRawPoints(): LaserPoint[] {
    return this.points;
  }
}
