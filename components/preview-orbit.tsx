"use client";

import Image from "next/image";
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { orbitCell, type Orbit, type OrbitAtlas } from "@/lib/orbit-atlas";
import styles from "@/styles/preview-orbit.module.css";

export type { Orbit } from "@/lib/orbit-atlas";
export const frontOrbit: Orbit = { yaw: 0, pitch: 0 };
const step = 5;
const degreesPerPixel = .65;

export function OrbitFrame({ atlas, orbit, children, alt }: {
  atlas?: OrbitAtlas;
  orbit: Orbit;
  children: ReactNode;
  alt: string;
}) {
  const [loaded, setLoaded] = useState("");
  if (!atlas) return children;
  const { column, row } = orbitCell(atlas, orbit);
  const ready = loaded === atlas.image;
  return <>
    {ready ? null : children}
    <div className={styles.sprite} data-orbit-cell={`${column},${row}`} style={{
      "--frame-ratio": atlas.width / atlas.height,
      visibility: ready ? "visible" : "hidden",
    } as CSSProperties}>
      <Image
        src={atlas.image} alt={alt} width={atlas.width * atlas.columns} height={atlas.height * atlas.pitches.length}
        unoptimized loading="eager" onLoad={() => setLoaded(atlas.image)}
        style={{
          width: `${atlas.columns * 100}%`, height: `${atlas.pitches.length * 100}%`,
          transform: `translate3d(${-100 * column / atlas.columns}%, ${-100 * row / atlas.pitches.length}%, 0)`,
        }}
      />
    </div>
  </>;
}

function rotate(start: Orbit, yaw: number, pitch: number): Orbit {
  const horizontal = Math.round((start.yaw + yaw) / step) * step;
  const vertical = Math.round((start.pitch + pitch) / step) * step;
  return {
    yaw: ((horizontal + 180) % 360 + 360) % 360 - 180,
    pitch: Math.max(-50, Math.min(50, vertical)),
  };
}

const keyMoves: Record<string, [number, number]> = {
  ArrowLeft: [-15, 0],
  ArrowRight: [15, 0],
  ArrowUp: [0, 10],
  ArrowDown: [0, -10],
};

export function PreviewOrbit({ children, className, orbit, onRotate, onTap, busy = false, disabled = false }: {
  children: ReactNode;
  className: string;
  orbit: Orbit;
  onRotate: (angle: Orbit) => void;
  onTap?: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  const drag = useRef<{ pointer: number; x: number; y: number; start: Orbit; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

  function move(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointer !== event.pointerId) return;
    const x = event.clientX - current.x;
    const y = event.clientY - current.y;
    if (!current.moved && Math.hypot(x, y) < 4) return;
    current.moved = true;
    const angle = rotate(current.start, x * degreesPerPixel, -y * degreesPerPixel);
    if (angle.yaw !== orbit.yaw || angle.pitch !== orbit.pitch) onRotate(angle);
  }

  function end(pointer: number) {
    if (drag.current?.pointer !== pointer) return;
    drag.current = null;
    setDragging(false);
  }

  return (
    <div
      className={`${className} ${styles.orbit}`}
      data-dragging={dragging}
      role="group"
      aria-label="Rotate player preview"
      aria-busy={busy}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onDragStart={event => event.preventDefault()}
      onPointerDown={event => {
        if (disabled || drag.current || event.button !== 0 || (event.target as Element).closest("button, a")) return;
        event.currentTarget.focus({ preventScroll: true });
        event.currentTarget.setPointerCapture(event.pointerId);
        drag.current = { pointer: event.pointerId, x: event.clientX, y: event.clientY, start: orbit, moved: false };
        setDragging(true);
      }}
      onPointerMove={move}
      onPointerUp={event => {
        if (drag.current?.pointer !== event.pointerId) return;
        const tapped = !drag.current.moved;
        end(event.pointerId);
        if (tapped) onTap?.();
      }}
      onPointerCancel={event => end(event.pointerId)}
      onLostPointerCapture={event => end(event.pointerId)}
      onKeyDown={event => {
        if (disabled || event.target !== event.currentTarget) return;
        if (event.key === "Home") {
          event.preventDefault();
          onRotate(frontOrbit);
          return;
        }
        const delta = keyMoves[event.key];
        if (!delta) return;
        event.preventDefault();
        onRotate(rotate(orbit, ...delta));
      }}
    >
      {children}
    </div>
  );
}
