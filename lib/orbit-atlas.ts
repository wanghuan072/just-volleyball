export type Orbit = { yaw: number; pitch: number };
export type OrbitAtlas = { image: string; columns: number; pitches: number[]; width: number; height: number };

export const defaultOrbitAtlas: OrbitAtlas = {
  image: "/images/locker/default-orbit-hd.webp",
  columns: 24,
  pitches: [-50, -35, -20, 0, 20, 35, 50],
  width: 480,
  height: 624,
};

export function orbitCell(atlas: OrbitAtlas, orbit: Orbit) {
  const column = ((Math.round(orbit.yaw * atlas.columns / 360) % atlas.columns) + atlas.columns) % atlas.columns;
  const row = atlas.pitches.reduce((best, pitch, index) =>
    Math.abs(orbit.pitch - pitch) < Math.abs(orbit.pitch - atlas.pitches[best]) ? index : best, 0);
  return { column, row };
}
