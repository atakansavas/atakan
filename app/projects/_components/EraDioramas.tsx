"use client";

import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { ERAS, ERA_ORDER } from "../_lib/data";
import type { Era } from "../_lib/data";
import { useLightbox } from "../_lib/lightbox";
import type { ScrollState } from "../_lib/scroll";

/* =========================================================================
 * Era dioramas — pixel-art style 3D islands, one per era.
 *
 * Each era gets its own little voxel scene placed at a fixed X along a row.
 * The camera snaps from one diorama to the next as `scrollRef.activeEra`
 * changes. Within an era we keep the camera mostly still — the era's stop
 * is a destination, not a flyby.
 *
 * Atölye is the prototype (full diorama); the other four are placeholder
 * pylons in their accent colour so navigation works while we build them.
 * ========================================================================= */

const ERA_SPACING_X = 80;

function eraIndex(era: Era): number {
  const i = ERA_ORDER.indexOf(era);
  return i < 0 ? 0 : i;
}

function eraOriginX(era: Era): number {
  return eraIndex(era) * ERA_SPACING_X;
}

type Props = {
  scrollRef: React.MutableRefObject<ScrollState>;
};

export function EraDioramas({ scrollRef }: Props) {
  // Optional gentle bob for the active diorama (subtle "alive" feeling).
  const groupRefs = useRef<(THREE.Group | null)[]>([]);

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    const activeId = scrollRef.current.activeEra as Era;
    ERA_ORDER.forEach((id, i) => {
      const g = groupRefs.current[i];
      if (!g) return;
      const isActive = id === activeId;
      // Active diorama floats; idle ones rest flat.
      const targetY = isActive ? Math.sin(t * 1.1 + i) * 0.18 : 0;
      const damp = 1 - Math.exp(-delta * 4);
      g.position.y += (targetY - g.position.y) * damp;
      // Slight tilt toward the camera when active.
      const targetTilt = isActive ? Math.sin(t * 0.6) * 0.025 : 0;
      g.rotation.z += (targetTilt - g.rotation.z) * damp;
    });
  });

  return (
    <group>
      {/* Deep multi-layer parallax starfield, sits behind everything */}
      <Starfield />

      {/* Sea/world plane that fades into the fog far below the dioramas */}
      <WorldFloor />

      {/* Connecting path: a faint trail of pier blocks linking each island */}
      <ConnectingPath />

      {ERA_ORDER.map((id, i) => {
        const x = eraOriginX(id);
        return (
          <group
            key={id}
            ref={(el) => {
              groupRefs.current[i] = el;
            }}
            position={[x, 0, 0]}
          >
            {/* Distant pixel silhouette behind this era's diorama */}
            <EraHorizon eraId={id} />
            {id === "genesis" ? (
              <GenesisDiorama />
            ) : id === "agency" ? (
              <AtelierDiorama />
            ) : id === "enterprise" ? (
              <EnterpriseDiorama />
            ) : id === "drift" ? (
              <DriftDiorama />
            ) : (
              <AgenticDiorama />
            )}
          </group>
        );
      })}

      {/* Per-active-era ambient particles (dust motes, sparks, neon ash, …) */}
      <EraAmbience scrollRef={scrollRef} />

      {/* Era-tinted directional rim light that follows the active diorama */}
      <EraTintLight scrollRef={scrollRef} />
    </group>
  );
}

/* =========================================================================
 * EraTargetTracker — drives the OrbitControls' `target` to the active
 * diorama's centre. Because OrbitControls keeps the camera at a constant
 * relative offset to its target, simply moving the target slides the
 * camera between islands while preserving any rotation the user has set.
 *
 * On era change we also gently nudge the camera position so the user
 * actually feels like they travelled — a pure target-only move would feel
 * static if they were facing dead-on. We add a tiny "arrival pulse" too.
 * ========================================================================= */
type TrackerProps = Props & {
  controlsRef: React.RefObject<{
    target: THREE.Vector3;
    update: () => void;
    object: THREE.Camera;
  } | null>;
};
export function EraTargetTracker({ scrollRef, controlsRef }: TrackerProps) {
  const prevEraIdx = useRef(-1);
  const arrivalAt = useRef(0);
  const cameraOffsetSnapshot = useRef<THREE.Vector3 | null>(null);

  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;
    const s = scrollRef.current;
    const era = s.activeEra as Era;
    const eraIdx = eraIndex(era);
    const eraInfo = ERAS[era];
    const innerT =
      (s.activeYear - eraInfo.range[0]) /
      Math.max(1, eraInfo.range[1] - eraInfo.range[0]);
    const baseX = eraIdx * ERA_SPACING_X;
    const driftX = (innerT - 0.5) * 3;
    const now = performance.now();

    if (eraIdx !== prevEraIdx.current) {
      prevEraIdx.current = eraIdx;
      arrivalAt.current = now;
      // Snapshot the camera-relative-to-target offset so we can preserve
      // it through the transition. (User's drag is preserved naturally
      // by OrbitControls — we only ride the target.)
      cameraOffsetSnapshot.current = ctrl.object.position
        .clone()
        .sub(ctrl.target);
    }
    const sinceArrive = (now - arrivalAt.current) / 1000;
    const arriveK = Math.max(0, 1 - sinceArrive / 0.7);
    const arriveBob = Math.sin(sinceArrive * 12) * arriveK * arriveK * 0.35;
    // Continuous gentle breathing — the world has a heartbeat.
    const breathe =
      Math.sin(now * 0.0008) * 0.12 + Math.sin(now * 0.0017) * 0.06;

    // Lerp orbit target toward the active diorama centre.
    const tx = baseX + driftX;
    const ty = 3 + breathe * 0.4 + arriveBob * 0.3;
    const tz = 0;
    const dist = Math.abs(ctrl.target.x - tx);
    const damping = dist > 25 ? 2.4 : 3.6;
    const damp = 1 - Math.exp(-delta * damping);
    ctrl.target.x += (tx - ctrl.target.x) * damp;
    ctrl.target.y += (ty - ctrl.target.y) * damp;
    ctrl.target.z += (tz - ctrl.target.z) * damp;

    // Slide the camera along with the target by the snapshotted offset so
    // the user keeps roughly the same view of the scene during inter-era
    // travel. (Without this, OrbitControls already moves camera with
    // target, so this is a small refinement during the arrival window.)
    if (cameraOffsetSnapshot.current && sinceArrive < 1) {
      const desired = ctrl.target.clone().add(cameraOffsetSnapshot.current);
      // Add the arrival bob upward.
      desired.y += arriveBob;
      ctrl.object.position.lerp(desired, damp * 0.9);
    }

    ctrl.update();
  });

  return null;
}

/* =========================================================================
 * Starfield — three layers of low-poly point sprites at increasing depth
 * that drift at parallax speeds. Pixel-perfect via square sprites + a
 * small render size so they read as actual pixels.
 * ========================================================================= */
function Starfield() {
  const layers = useMemo(() => {
    const cfg: { count: number; spread: number; z: number; size: number; opacity: number; speed: number; tint: string }[] = [
      { count: 220, spread: 380, z: -120, size: 0.55, opacity: 0.55, speed: 0.6, tint: "#9fb3ff" },
      { count: 160, spread: 480, z: -200, size: 0.85, opacity: 0.75, speed: 0.3, tint: "#ffffff" },
      { count: 90, spread: 600, z: -310, size: 1.4, opacity: 0.95, speed: 0.12, tint: "#ffe6c2" },
    ];
    return cfg.map((c) => {
      const positions = new Float32Array(c.count * 3);
      for (let i = 0; i < c.count; i++) {
        positions[i * 3 + 0] = (Math.random() - 0.5) * c.spread + 160; // centre on midpoint of journey
        positions[i * 3 + 1] = Math.random() * 100 - 8;
        positions[i * 3 + 2] = c.z + (Math.random() - 0.5) * 30;
      }
      const geom = new THREE.BufferGeometry();
      geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      return { geom, ...c };
    });
  }, []);

  const groupRefs = useRef<(THREE.Object3D | null)[]>([]);

  useFrame((_, delta) => {
    layers.forEach((l, i) => {
      const p = groupRefs.current[i];
      if (!p) return;
      // Slow vertical drift so deep layers feel almost still.
      p.position.y -= delta * l.speed * 0.35;
      if (p.position.y < -10) p.position.y = 10;
    });
  });

  return (
    <group>
      {layers.map((l, i) => (
        <points
          key={i}
          ref={(el) => {
            groupRefs.current[i] = el;
          }}
          frustumCulled={false}
        >
          <primitive object={l.geom} attach="geometry" />
          <pointsMaterial
            size={l.size}
            color={l.tint}
            transparent
            opacity={l.opacity}
            sizeAttenuation={false}
            depthWrite={false}
          />
        </points>
      ))}
    </group>
  );
}

/* =========================================================================
 * WorldFloor — a vast plane far below the diorama islands that catches the
 * fog and gives the eye a "ground beneath the world". A subtle scrolling
 * grid pattern hints at infinite distance without overpowering the scene.
 * ========================================================================= */
function WorldFloor() {
  // Build a fading radial grid via a small canvas texture (cheap, crisp).
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 256;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#080a14";
    ctx.fillRect(0, 0, size, size);
    ctx.strokeStyle = "rgba(120,140,200,0.2)";
    ctx.lineWidth = 1;
    const step = 16;
    for (let i = 0; i <= size; i += step) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(40, 40);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }, []);

  return (
    <mesh position={[160, -8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1200, 600]} />
      <meshStandardMaterial
        map={texture ?? undefined}
        color="#0a0e1c"
        transparent
        opacity={0.85}
      />
    </mesh>
  );
}

/* =========================================================================
 * ConnectingPath — a row of small pier blocks running between the diorama
 * islands so the user feels like the journey IS a path, not a teleport.
 * ========================================================================= */
function ConnectingPath() {
  const blocks = useMemo(() => {
    const out: { pos: [number, number, number]; size: [number, number, number] }[] = [];
    // Span from before first era to after last era.
    const startX = -10;
    const endX = (ERA_ORDER.length - 1) * ERA_SPACING_X + 10;
    for (let x = startX; x < endX; x += 4) {
      const drop = Math.sin(x * 0.07) * 0.15;
      out.push({
        pos: [x, -1.5 + drop, 0],
        size: [3.4, 0.6, 4],
      });
    }
    return out;
  }, []);

  return (
    <group>
      {blocks.map((b, i) => (
        <mesh key={i} position={b.pos} receiveShadow>
          <boxGeometry args={b.size} />
          <meshLambertMaterial color={i % 2 === 0 ? "#1a1d2a" : "#15182a"} />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================================
 * EraHorizon — a flat pixel-art silhouette plane behind each era diorama.
 * Each era gets a distinct shape that reads as that era's "skyline" — CRT
 * roof for atelier, server racks for enterprise, mountains for drift, etc.
 * ========================================================================= */
function EraHorizon({ eraId }: { eraId: Era }) {
  const era = ERAS[eraId];
  // A few simple silhouette stamps per era; all in pixel-art voxel style.
  const stamps = useMemo(() => {
    type Stamp = { x: number; w: number; h: number; color: string };
    const palette = era.accent;
    const dim = "#1a1d2a";
    switch (eraId) {
      case "genesis":
        // Distant neighborhood — rooflines + a couple of mosques/treetops.
        // Warmer dusk silhouette to match the peach sky behind the shop.
        return [
          { x: -14, w: 5, h: 4, color: "#3a2a24" },
          { x: -9, w: 4, h: 5, color: "#3a2a24" },
          { x: -5, w: 6, h: 6, color: "#3a2a24" },
          { x: -3.5, w: 0.8, h: 8.5, color: "#3a2a24" }, // minaret hint
          { x: 0, w: 5, h: 4.5, color: "#3a2a24" },
          { x: 5, w: 6, h: 5.5, color: "#3a2a24" },
          { x: 11, w: 5, h: 4, color: "#3a2a24" },
          { x: 14, w: 3, h: 3, color: "#3a2a24" },
        ] as Stamp[];
      case "agency":
        // workshop block + chimney
        return [
          { x: -12, w: 6, h: 4, color: dim },
          { x: -5, w: 8, h: 6, color: dim },
          { x: -2, w: 1, h: 9, color: dim }, // chimney
          { x: 4, w: 6, h: 5, color: dim },
          { x: 11, w: 3, h: 3, color: palette },
        ] as Stamp[];
      case "enterprise":
        // skyline silhouette — taller blocks
        return [
          { x: -14, w: 3, h: 8, color: dim },
          { x: -10, w: 4, h: 12, color: dim },
          { x: -5, w: 5, h: 10, color: dim },
          { x: 1, w: 4, h: 14, color: dim },
          { x: 6, w: 6, h: 9, color: dim },
          { x: 13, w: 3, h: 11, color: dim },
        ] as Stamp[];
      case "drift":
        // mountains + sea horizon
        return [
          { x: -16, w: 8, h: 6, color: dim },
          { x: -8, w: 10, h: 9, color: dim },
          { x: 2, w: 9, h: 7, color: dim },
          { x: 12, w: 6, h: 5, color: dim },
        ] as Stamp[];
      case "agentic":
        // angular cyber towers
        return [
          { x: -12, w: 2, h: 10, color: dim },
          { x: -8, w: 4, h: 13, color: dim },
          { x: -2, w: 3, h: 16, color: dim },
          { x: 3, w: 5, h: 11, color: dim },
          { x: 10, w: 2, h: 14, color: dim },
          { x: 13, w: 3, h: 9, color: dim },
        ] as Stamp[];
    }
  }, [eraId, era.accent]);

  return (
    <group position={[0, 0, -22]}>
      {stamps.map((s, i) => (
        <mesh key={i} position={[s.x, s.h / 2 - 0.5, 0]}>
          <boxGeometry args={[s.w, s.h, 0.6]} />
          <meshLambertMaterial color={s.color} />
        </mesh>
      ))}
      {/* Far-distant glow strip behind silhouette in era accent */}
      <mesh position={[0, 4, -1]}>
        <planeGeometry args={[80, 12]} />
        <meshBasicMaterial color={era.accent} transparent opacity={0.07} />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * EraAmbience — small particle field that follows the active diorama.
 * Each era has its own particle palette and drift behaviour.
 * ========================================================================= */
function EraAmbience({ scrollRef }: Props) {
  const groupRef = useRef<THREE.Group | null>(null);
  const particleRef = useRef<THREE.Points | null>(null);

  // 80 particles, repositioned each frame with a per-particle drift seed.
  const { positions, seeds } = useMemo(() => {
    const count = 80;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = Math.random() * 12;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seeds[i * 3 + 0] = Math.random() * 1000;
      seeds[i * 3 + 1] = 0.4 + Math.random() * 1.2;
      seeds[i * 3 + 2] = (Math.random() - 0.5) * 2;
    }
    return { positions, seeds };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  const colorRef = useRef(new THREE.Color("#7d8cff"));
  const targetColor = useRef(new THREE.Color("#7d8cff"));

  useFrame((_, delta) => {
    const t = performance.now() * 0.001;
    const s = scrollRef.current;
    const era = ERAS[s.activeEra as Era];
    targetColor.current.set(era.accent);
    colorRef.current.lerp(targetColor.current, 1 - Math.exp(-delta * 2.5));

    if (groupRef.current) {
      const eraIdx = eraIndex(s.activeEra as Era);
      const baseX = eraIdx * ERA_SPACING_X;
      // Glide ambience with the camera target.
      const damp = 1 - Math.exp(-delta * 3);
      groupRef.current.position.x +=
        (baseX - groupRef.current.position.x) * damp;
    }

    if (particleRef.current) {
      const arr = (particleRef.current.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute).array as Float32Array;
      for (let i = 0; i < arr.length / 3; i++) {
        const seedX = seeds[i * 3];
        const speedY = seeds[i * 3 + 1];
        const drift = seeds[i * 3 + 2];
        arr[i * 3 + 1] += delta * speedY * 0.55;
        arr[i * 3 + 0] += Math.sin(t * 0.4 + seedX) * delta * drift * 0.25;
        if (arr[i * 3 + 1] > 14) {
          arr[i * 3 + 1] = -1;
          arr[i * 3 + 0] = (Math.random() - 0.5) * 20;
        }
      }
      (particleRef.current.geometry.getAttribute(
        "position",
      ) as THREE.BufferAttribute).needsUpdate = true;

      const mat = particleRef.current
        .material as THREE.PointsMaterial;
      mat.color.copy(colorRef.current);
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={particleRef} frustumCulled={false}>
        <primitive object={geometry} attach="geometry" />
        <pointsMaterial
          size={0.45}
          color="#7d8cff"
          transparent
          opacity={0.7}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
    </group>
  );
}

/* =========================================================================
 * EraTintLight — a directional rim light that follows the active diorama
 * and slowly tints from era to era. Gives every era its own "weather".
 * ========================================================================= */
function EraTintLight({ scrollRef }: Props) {
  const lightRef = useRef<THREE.DirectionalLight | null>(null);
  const colorRef = useRef(new THREE.Color("#7d8cff"));
  const targetColor = useRef(new THREE.Color("#7d8cff"));

  useEffect(() => {
    const light = lightRef.current;
    if (!light) return;
    light.target.position.set(0, 2, 0);
    light.target.updateMatrixWorld();
  }, []);

  useFrame((_, delta) => {
    const s = scrollRef.current;
    const era = ERAS[s.activeEra as Era];
    targetColor.current.set(era.accent);
    colorRef.current.lerp(targetColor.current, 1 - Math.exp(-delta * 2.5));
    if (lightRef.current) {
      lightRef.current.color.copy(colorRef.current);
      const eraIdx = eraIndex(s.activeEra as Era);
      const baseX = eraIdx * ERA_SPACING_X;
      const damp = 1 - Math.exp(-delta * 3);
      lightRef.current.position.x +=
        (baseX - 12 - lightRef.current.position.x) * damp;
      lightRef.current.target.position.x +=
        (baseX - lightRef.current.target.position.x) * damp;
      lightRef.current.target.updateMatrixWorld();
    }
  });

  return (
    <directionalLight
      ref={lightRef}
      position={[-12, 14, 8]}
      intensity={0.55}
      color="#7d8cff"
    />
  );
}

/* =========================================================================
 * Atölye (Atelier) diorama — first prototype.
 * CRT desk in a small workshop room, neon agency sign overhead.
 * Built entirely from box primitives so it stays in the pixel-art family.
 * ========================================================================= */
function AtelierDiorama() {
  const accent = ERAS.agency.accent; // #7d8cff
  const screenRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Screen flicker — subtle CRT tone variation
  useFrame(() => {
    if (!screenRef.current) return;
    const t = performance.now() * 0.001;
    screenRef.current.emissiveIntensity =
      0.85 + Math.sin(t * 7.2) * 0.05 + Math.sin(t * 3.4) * 0.04;
  });

  return (
    <group>
      {/* ---------- ground tile ---------- */}
      <CheckerFloor size={14} cellSize={1} y={-0.5} colorA="#2a2018" colorB="#221912" />

      {/* ---------- back wall slab ---------- */}
      <mesh position={[0, 4, -5]} receiveShadow>
        <boxGeometry args={[14, 9, 0.6]} />
        <meshLambertMaterial color="#1d1812" />
      </mesh>

      {/* ---------- neon sign on the wall ---------- */}
      <NeonSign
        position={[-3.6, 6.2, -4.6]}
        text="XEUS"
        accent={accent}
        bgColor="#13111a"
      />
      <NeonSign
        position={[3.4, 5.5, -4.6]}
        text="IMPRODE"
        accent="#27e0c2"
        bgColor="#13111a"
      />

      {/* ---------- desk ---------- */}
      {/* top */}
      <mesh position={[0, 1.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 0.35, 3]} />
        <meshLambertMaterial color="#7a4a2b" />
      </mesh>
      {/* edge highlight to sell pixel art */}
      <mesh position={[0, 1.74, 0]}>
        <boxGeometry args={[7.02, 0.04, 3.02]} />
        <meshLambertMaterial color="#a06a40" />
      </mesh>
      {/* legs */}
      {([
        [-3.2, 0.7, 1.2],
        [3.2, 0.7, 1.2],
        [-3.2, 0.7, -1.2],
        [3.2, 0.7, -1.2],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.35, 1.4, 0.35]} />
          <meshLambertMaterial color="#4f311b" />
        </mesh>
      ))}

      {/* ---------- CRT monitor ---------- */}
      {/* back/body */}
      <mesh position={[-1, 2.85, -0.8]} castShadow>
        <boxGeometry args={[2.6, 2.2, 1.9]} />
        <meshLambertMaterial color="#d6cfb3" />
      </mesh>
      {/* bezel front */}
      <mesh position={[-1, 2.85, 0.16]}>
        <boxGeometry args={[2.4, 2.0, 0.06]} />
        <meshLambertMaterial color="#c1b78f" />
      </mesh>
      {/* glowing screen */}
      <mesh position={[-1, 2.85, 0.21]}>
        <boxGeometry args={[1.95, 1.55, 0.04]} />
        <meshStandardMaterial
          ref={screenRef}
          color="#1f3658"
          emissive={accent}
          emissiveIntensity={0.85}
          toneMapped={false}
        />
      </mesh>
      {/* power LED */}
      <mesh position={[-1.92, 1.95, 0.2]}>
        <boxGeometry args={[0.1, 0.1, 0.06]} />
        <meshStandardMaterial color="#000" emissive="#ff5a3c" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      {/* ---------- keyboard ---------- */}
      <mesh position={[-1, 1.82, 1.05]} castShadow>
        <boxGeometry args={[2.6, 0.15, 0.85]} />
        <meshLambertMaterial color="#e6dec3" />
      </mesh>
      {/* row of pixel keys (cosmetic) */}
      {Array.from({ length: 12 }).map((_, k) => (
        <mesh key={k} position={[-2.1 + k * 0.2, 1.93, 0.85]} castShadow>
          <boxGeometry args={[0.15, 0.08, 0.15]} />
          <meshLambertMaterial color="#bdb597" />
        </mesh>
      ))}

      {/* ---------- coffee mug ---------- */}
      <mesh position={[2.2, 1.95, 0.6]} castShadow>
        <cylinderGeometry args={[0.22, 0.2, 0.42, 8]} />
        <meshLambertMaterial color="#9b3a2a" />
      </mesh>
      {/* mug handle */}
      <mesh position={[2.45, 1.95, 0.6]} castShadow>
        <torusGeometry args={[0.12, 0.04, 6, 10]} />
        <meshLambertMaterial color="#9b3a2a" />
      </mesh>
      {/* steam — three thin chunks */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[2.2 + Math.sin(i * 1.4) * 0.1, 2.45 + i * 0.18, 0.6]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial
            color="#fff"
            emissive="#fff"
            emissiveIntensity={0.5}
            transparent
            opacity={0.55 - i * 0.13}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ---------- floppy stack ---------- */}
      {[0, 1, 2].map((i) => (
        <mesh
          key={i}
          position={[2.4, 1.78 + i * 0.06, -0.7]}
          rotation={[0, 0.2, 0]}
          castShadow
        >
          <boxGeometry args={[0.7, 0.05, 0.7]} />
          <meshLambertMaterial color={["#1d1d27", "#2a2532", "#1f1f2a"][i]} />
        </mesh>
      ))}

      {/* ---------- floor lamp glow ---------- */}
      <mesh position={[5, 0.5, 2.4]}>
        <boxGeometry args={[0.3, 1, 0.3]} />
        <meshLambertMaterial color="#222" />
      </mesh>
      <mesh position={[5, 1.4, 2.4]}>
        <boxGeometry args={[0.7, 0.5, 0.7]} />
        <meshStandardMaterial
          color="#ffe7a0"
          emissive="#ffb648"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[5, 1.6, 2.4]} intensity={1.0} distance={9} color="#ffb648" />

      {/* ---------- chair stub behind the desk ---------- */}
      <mesh position={[-1, 1.0, 2.2]} castShadow>
        <boxGeometry args={[1.6, 0.2, 1.4]} />
        <meshLambertMaterial color="#3b3b48" />
      </mesh>
      <mesh position={[-1, 1.95, 2.7]} castShadow>
        <boxGeometry args={[1.6, 1.7, 0.2]} />
        <meshLambertMaterial color="#3b3b48" />
      </mesh>

      {/* ---------- side accent block (stack of CRT box) ---------- */}
      <mesh position={[-5.2, 1.4, -1.5]} castShadow>
        <boxGeometry args={[1.6, 1.6, 1.6]} />
        <meshLambertMaterial color="#1c1c25" />
      </mesh>
      <mesh position={[-5.2, 2.6, -1.5]} castShadow>
        <boxGeometry args={[1.4, 1, 1.4]} />
        <meshLambertMaterial color="#3a3a55" />
      </mesh>
      <mesh position={[-5.2, 3.25, -1.4]}>
        <boxGeometry args={[0.3, 0.3, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* ---------- screen-light cast onto the desk (subtle) ---------- */}
      <pointLight
        position={[-1, 2.7, 1.2]}
        intensity={0.55}
        distance={7}
        color={accent}
      />
    </group>
  );
}

/* =========================================================================
 * NeonSign — pixel-style label with emissive frame
 * ========================================================================= */
function NeonSign({
  position,
  text,
  accent,
  bgColor,
}: {
  position: [number, number, number];
  text: string;
  accent: string;
  bgColor: string;
}) {
  const w = Math.max(2.2, text.length * 0.45 + 0.6);
  return (
    <group position={position}>
      {/* backplate */}
      <mesh>
        <boxGeometry args={[w, 0.85, 0.15]} />
        <meshLambertMaterial color={bgColor} />
      </mesh>
      {/* glow border */}
      <mesh position={[0, 0, 0.085]}>
        <boxGeometry args={[w - 0.15, 0.7, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={0.65}
          toneMapped={false}
        />
      </mesh>
      {/* text-ish bar (we don't render real text in 3D; the bar reads as
       *  a pixel-art neon glyph, the actual era name lives in the overlay). */}
      <mesh position={[0, 0, 0.14]}>
        <boxGeometry args={[w - 0.55, 0.34, 0.05]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * Checker floor — gives that pixel-art tile feel without textures.
 * ========================================================================= */
function CheckerFloor({
  size,
  cellSize,
  y,
  colorA,
  colorB,
}: {
  size: number;
  cellSize: number;
  y: number;
  colorA: string;
  colorB: string;
}) {
  const tiles = useMemo(() => {
    const out: { key: string; pos: [number, number, number]; color: string }[] = [];
    const half = size / 2;
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const isA = (i + j) % 2 === 0;
        out.push({
          key: `${i}-${j}`,
          pos: [
            -half + i * cellSize + cellSize / 2,
            y,
            -half + j * cellSize + cellSize / 2,
          ],
          color: isA ? colorA : colorB,
        });
      }
    }
    return out;
  }, [size, cellSize, y, colorA, colorB]);

  return (
    <group>
      {tiles.map((t) => (
        <mesh key={t.key} position={t.pos} receiveShadow>
          <boxGeometry args={[cellSize, 0.6, cellSize]} />
          <meshLambertMaterial color={t.color} />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================================
 * GenesisDiorama — Doğuş era (2005-2014).
 * A small Turkish neighborhood street at golden hour. The middle storefront
 * is "Savaş Elektronik" — a computer repair shop — flanked by a bakkal and
 * a kuaför, with a 2-floor apartment block above. Trees line the sidewalk,
 * a vintage sedan is parked on the asphalt, a street lamp warms the corner.
 * Two real photos (cocuk.JPG, old.JPG) live inside the world: one in the
 * shop window display, one as a framed photo above on the apartment wall.
 * ========================================================================= */
function GenesisDiorama() {
  const accent = ERAS.genesis.accent; // #ff7a59
  const screenRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const signRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const lampGlowRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;
    if (screenRef.current) {
      // green CRT phosphor wobble
      screenRef.current.emissiveIntensity =
        0.65 + Math.sin(t * 6) * 0.06 + Math.sin(t * 17) * 0.03;
    }
    if (signRef.current) {
      // neon shop sign with a subtle flicker — sometimes the bulb dips
      const dip = Math.sin(t * 11) > 0.93 ? -0.45 : 0;
      signRef.current.emissiveIntensity = 1.55 + Math.sin(t * 2.4) * 0.1 + dip;
    }
    if (lampGlowRef.current) {
      lampGlowRef.current.emissiveIntensity =
        1.2 + Math.sin(t * 2.6) * 0.08;
    }
  });

  return (
    <group>
      {/* Warm peach sky behind the diorama, cuts the global navy backdrop.
       *  Lighting stays driven by the global rig in Scene.tsx — adding local
       *  hemisphere/directional lights would leak into other dioramas. */}
      <GenesisSky />

      {/* A small skyline of background buildings sitting between the
       *  apartment block and the far horizon, so the city reads as
       *  inhabited rather than a single facade. */}
      <BackgroundCity />

      {/* Asphalt street + sidewalks + curb + lane stripes */}
      <GenesisStreet />

      {/* Storefront row + 2-floor apartment block above */}
      <NeighborShopFront
        x={-7.2}
        accent="#3a8c3a"
        sign="BAKKAL"
        awningColor="#3a8c3a"
        wallColor="#c9a87a"
      />
      <NeighborShopFront
        x={7.2}
        accent="#c8588f"
        sign="KUAFÖR"
        awningColor="#c8588f"
        wallColor="#cfb898"
      />
      <Suspense fallback={null}>
        <SavasElektronikFront
          screenRef={screenRef}
          signRef={signRef}
          accent={accent}
        />
      </Suspense>
      <ApartmentBlock />

      {/* Sidewalk life — trees, lamp, bench, parked car */}
      <DeciduousTree position={[-9.6, 0, 1.1]} variant={0} />
      <DeciduousTree position={[-3.2, 0, 1.6]} variant={1} />
      <DeciduousTree position={[3.2, 0, 1.6]} variant={2} />
      <DeciduousTree position={[9.6, 0, 1.1]} variant={0} />

      <StreetLamp position={[-5.2, 0, 1.2]} bulbRef={lampGlowRef} />
      <StreetLamp position={[5.2, 0, 1.2]} />

      <Bench position={[-2.6, 0, 2.2]} />

      <Bicycle position={[3.4, 0, 1.0]} rotationY={-0.18} />

      {/* Background hint: a couple of voxel pedestrians */}
      <Pedestrian position={[-1.4, 0, 2.6]} top="#2a4d8a" bottom="#1a1f2e" />
      <Pedestrian position={[1.6, 0, 2.0]} top="#a23a3a" bottom="#3a2a18" />

      {/* Hero asset 1 — "the kid" photo, front and centre on a chunky
       *  wooden easel propped on the sidewalk. Tilted slightly toward the
       *  camera and given a soft accent glow so it reads as the focal
       *  artefact in the diorama. Click → lightbox. */}
      <Suspense fallback={null}>
        <PhotoEasel
          position={[-3.5, 0, 2.6]}
          rotationY={0.32}
          src="/assets/cocuk-tex.jpg"
          width={1.7}
          height={1.7}
          caption={{
            tr: "Atakan, ~2005 — ilk kod gününden",
            en: "Atakan, ~2005 — from the first-code days",
          }}
        />
      </Suspense>

      {/* Hero asset 2 — "old times" photo as a large mural / poster on the
       *  apartment side wall, hanging like a faded ad. Click → lightbox. */}
      <Suspense fallback={null}>
        <FramedPhoto
          position={[3.6, 4.3, -0.55]}
          src="/assets/old-tex.jpg"
          width={3.2}
          height={2.3}
          frameColor="#5a3a22"
          matColor="#e6d6b0"
          glow
          caption={{
            tr: "O zamanların ekipmanı — Savaş Elektronik arşivi",
            en: "Old-times gear — Savaş Elektronik archive",
          }}
        />
      </Suspense>
    </group>
  );
}

function PhotoEasel({
  position,
  rotationY = 0,
  src,
  width,
  height,
  caption,
}: {
  position: [number, number, number];
  rotationY?: number;
  src: string;
  width: number;
  height: number;
  caption?: { tr: string; en: string };
}) {
  // Sidewalk easel — three timber legs in an A-frame supporting the framed
  // photo. Sits at child-eye height so the cocuk photo lands at a friendly,
  // discoverable spot for visitors of the era.
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Two front legs */}
      <mesh position={[-0.45, 1.0, 0.05]} rotation={[0, 0, 0.06]} castShadow>
        <boxGeometry args={[0.12, 2.0, 0.12]} />
        <meshLambertMaterial color="#5a3a1f" />
      </mesh>
      <mesh position={[0.45, 1.0, 0.05]} rotation={[0, 0, -0.06]} castShadow>
        <boxGeometry args={[0.12, 2.0, 0.12]} />
        <meshLambertMaterial color="#5a3a1f" />
      </mesh>
      {/* Back leg (kickstand) */}
      <mesh position={[0, 1.0, -0.4]} rotation={[-0.18, 0, 0]} castShadow>
        <boxGeometry args={[0.12, 2.0, 0.12]} />
        <meshLambertMaterial color="#5a3a1f" />
      </mesh>
      {/* Crossbar shelf */}
      <mesh position={[0, 0.8, 0.05]} castShadow>
        <boxGeometry args={[1.2, 0.1, 0.16]} />
        <meshLambertMaterial color="#7a4a24" />
      </mesh>
      {/* Photo */}
      <FramedPhoto
        position={[0, 1.6, 0.12]}
        src={src}
        width={width}
        height={height}
        frameColor="#3a2418"
        matColor="#f0e6c8"
        glow
        caption={caption}
      />
      {/* "TIKLA" pixel hint flag perched above the easel */}
      <mesh position={[0, 2.95, 0.15]}>
        <boxGeometry args={[1.0, 0.34, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive="#ff7a59"
          emissiveIntensity={0.9}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph
        position={[0, 2.95, 0.18]}
        text="TIKLA"
        color="#fff5e6"
        scale={0.04}
      />
    </group>
  );
}

/* ----- Genesis world helpers --------------------------------------------- */

function GenesisSky() {
  // Big peach-orange backdrop plane that overrides the global navy. Slightly
  // tilted and stretched so it covers the camera's field of view at this era.
  return (
    <group position={[0, 5, -16]}>
      {/* upper warm sky */}
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[60, 14]} />
        <meshBasicMaterial color="#f4b27a" toneMapped={false} />
      </mesh>
      {/* horizon glow */}
      <mesh position={[0, -2, 0.05]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial color="#ffd49a" toneMapped={false} />
      </mesh>
      {/* lower haze */}
      <mesh position={[0, -6, 0.1]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial color="#d68a64" toneMapped={false} />
      </mesh>
      {/* low sun disc — sits just above the horizon, accents the era hue */}
      <mesh position={[8, -1, 0.06]}>
        <circleGeometry args={[1.6, 24]} />
        <meshBasicMaterial color="#ffe6b8" toneMapped={false} />
      </mesh>
    </group>
  );
}

/* Background city — a chunky voxel skyline that sits between the apartment
 * block (z = -1.6) and the warm sky backdrop (z = -16). Two parallel rows
 * give a sense of depth: a near row of mid-height apartments and a far row
 * with more variety (taller block, water tank, minaret, factory chimney).
 */
function BackgroundCity() {
  // Hand-tuned silhouette so it reads as a cluster of buildings rather than
  // a procedural noise. Each item is one box mesh; scattered colours within
  // a warm dusk palette so the city blends with the sky.
  type Block = {
    x: number;
    z: number;
    w: number;
    h: number;
    d: number;
    color: string;
    roof?: string;
  };
  const blocks: Block[] = [
    // Near row — sits just behind the apartment block (z ~ -4..-5)
    { x: -12, z: -5, w: 4.4, h: 5.5, d: 3, color: "#a07a5a", roof: "#5a3a22" },
    { x: -7.5, z: -5.2, w: 3.6, h: 7, d: 3, color: "#b08866", roof: "#5a3a22" },
    { x: 8.5, z: -5, w: 4.2, h: 6.4, d: 3, color: "#8a6a4a", roof: "#5a3a22" },
    { x: 13.2, z: -5.2, w: 3.8, h: 5.8, d: 3, color: "#9a785a", roof: "#5a3a22" },
    // Far row — taller cluster + a couple of distinctive shapes (z ~ -9..-11)
    { x: -14, z: -10, w: 5, h: 8, d: 3.4, color: "#7a5a40" },
    { x: -8.6, z: -10.5, w: 3.4, h: 11, d: 3.4, color: "#8a6a4a" },
    { x: -4, z: -10.2, w: 4.6, h: 6.5, d: 3.4, color: "#7a5a40" },
    { x: 1.5, z: -10.5, w: 5.2, h: 9, d: 3.4, color: "#8a6a4a" },
    { x: 6.6, z: -10.3, w: 3.6, h: 7, d: 3.4, color: "#7a5a40" },
    { x: 11.4, z: -10.6, w: 5.4, h: 10, d: 3.4, color: "#8a6a4a" },
    { x: 16, z: -10.2, w: 3.6, h: 6, d: 3.4, color: "#7a5a40" },
  ];
  return (
    <group>
      {blocks.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshLambertMaterial color={b.color} />
          </mesh>
          {b.roof && (
            <mesh position={[0, b.h + 0.18, 0]}>
              <boxGeometry args={[b.w + 0.2, 0.36, b.d + 0.2]} />
              <meshLambertMaterial color={b.roof} />
            </mesh>
          )}
          {/* Window grid — tiny emissive dots so distant buildings look
           *  inhabited at golden hour. Sparse so we don't add too many
           *  draw calls per building. */}
          {Array.from({ length: Math.min(3, Math.floor(b.h / 2)) }).map((_, r) => (
            <group key={r}>
              {Array.from({ length: 2 }).map((_, c) => (
                <mesh
                  key={c}
                  position={[
                    -b.w / 4 + c * (b.w / 2),
                    1.0 + r * 1.7,
                    b.d / 2 + 0.02,
                  ]}
                >
                  <boxGeometry args={[b.w * 0.18, 0.6, 0.04]} />
                  <meshStandardMaterial
                    color="#1a1a1e"
                    emissive={(r + c + i) % 3 === 0 ? "#ffd28a" : "#9a8a6a"}
                    emissiveIntensity={(r + c + i) % 3 === 0 ? 0.7 : 0.25}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* Distinctive landmarks — minaret, water tower, factory chimney */}
      {/* Minaret (slim spire with a small balcony) */}
      <group position={[-1, 0, -10.8]}>
        <mesh position={[0, 5.5, 0]} castShadow>
          <boxGeometry args={[1.2, 11, 1.2]} />
          <meshLambertMaterial color="#9a785a" />
        </mesh>
        <mesh position={[0, 8.5, 0]}>
          <boxGeometry args={[1.6, 0.4, 1.6]} />
          <meshLambertMaterial color="#5a3a22" />
        </mesh>
        <mesh position={[0, 11.6, 0]} castShadow>
          <coneGeometry args={[0.7, 1.4, 8]} />
          <meshLambertMaterial color="#3a2a18" />
        </mesh>
      </group>
      {/* Water tower */}
      <group position={[18, 0, -10]}>
        {[-0.6, 0.6].map((x, i) => (
          <mesh key={i} position={[x, 3, 0]} castShadow>
            <boxGeometry args={[0.18, 6, 0.18]} />
            <meshLambertMaterial color="#4a4030" />
          </mesh>
        ))}
        <mesh position={[0, 6.3, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 1.2, 8]} />
          <meshLambertMaterial color="#7a8a6a" />
        </mesh>
        <mesh position={[0, 7.0, 0]}>
          <coneGeometry args={[0.92, 0.5, 8]} />
          <meshLambertMaterial color="#3a3a30" />
        </mesh>
      </group>
      {/* Factory chimney */}
      <group position={[-18, 0, -9.5]}>
        <mesh position={[0, 4.5, 0]} castShadow>
          <boxGeometry args={[0.8, 9, 0.8]} />
          <meshLambertMaterial color="#5a4030" />
        </mesh>
        <mesh position={[0, 9.2, 0]}>
          <boxGeometry args={[1.0, 0.3, 1.0]} />
          <meshLambertMaterial color="#2a1a10" />
        </mesh>
      </group>
    </group>
  );
}

function GenesisStreet() {
  // Asphalt road runs across the diorama in front of the shop row.
  // Sidewalk sits between the road and the storefronts. Kept as a few big
  // boxes (instead of a checker grid) so the draw-call cost stays low — the
  // diorama already has a lot of small meshes for the buildings.
  return (
    <group>
      {/* Asphalt */}
      <mesh position={[0, -0.45, 3.5]} receiveShadow>
        <boxGeometry args={[26, 0.1, 4]} />
        <meshLambertMaterial color="#3a3a40" />
      </mesh>
      {/* Lane stripes — dashed centerline */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-9 + i * 3, -0.39, 3.5]}>
          <boxGeometry args={[1.4, 0.02, 0.18]} />
          <meshBasicMaterial color="#e6c66a" toneMapped={false} />
        </mesh>
      ))}
      {/* Curb — slight raise between asphalt and sidewalk */}
      <mesh position={[0, -0.32, 1.3]}>
        <boxGeometry args={[26, 0.36, 0.2]} />
        <meshLambertMaterial color="#a8a89a" />
      </mesh>
      {/* Sidewalk — single slab in warm sand, with a darker inset stripe to
       *  hint at tile seams without exploding the mesh count. */}
      <mesh position={[0, -0.45, 0.4]} receiveShadow>
        <boxGeometry args={[26, 0.1, 1.6]} />
        <meshLambertMaterial color="#c4b596" />
      </mesh>
      {Array.from({ length: 13 }).map((_, i) => (
        <mesh key={i} position={[-12 + i * 2, -0.39, 0.4]}>
          <boxGeometry args={[0.06, 0.02, 1.5]} />
          <meshLambertMaterial color="#8a7a5e" />
        </mesh>
      ))}
    </group>
  );
}

function ApartmentBlock() {
  // Two-floor apartment block sitting on top of the shop row. We render a
  // light cream wall with rows of windows + a flat roof. The shopfronts
  // below are rendered as separate components.
  const wallColor = "#cdb898";
  const trim = "#7a5a3a";
  return (
    <group position={[0, 4.4, -1.6]}>
      {/* Big wall block (z=-1.6, behind sidewalk) */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[20, 4.2, 1.6]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      {/* Floor divider band */}
      <mesh position={[0, 0, 0.81]}>
        <boxGeometry args={[20, 0.18, 0.05]} />
        <meshLambertMaterial color={trim} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 2.25, 0]} castShadow>
        <boxGeometry args={[20.5, 0.3, 1.8]} />
        <meshLambertMaterial color="#5a3a2a" />
      </mesh>
      {/* Cornice */}
      <mesh position={[0, 2.05, 0.82]}>
        <boxGeometry args={[20.4, 0.2, 0.08]} />
        <meshLambertMaterial color={trim} />
      </mesh>
      {/* Windows — two floors, six bays, with the middle bay swapped for
       *  framed photo (old.JPG) on the lower floor. */}
      {Array.from({ length: 6 }).map((_, i) => {
        const x = -8.5 + i * 3.4;
        return (
          <group key={i}>
            {/* Lower floor window */}
            {i !== 3 && (
              <ApartmentWindow position={[x, -0.9, 0.81]} />
            )}
            {/* Upper floor window */}
            <ApartmentWindow position={[x, 1.1, 0.81]} />
          </group>
        );
      })}
      {/* Tiny rooftop AC units */}
      <mesh position={[-6, 2.55, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshLambertMaterial color="#9a9a96" />
      </mesh>
      <mesh position={[6, 2.55, 0]} castShadow>
        <boxGeometry args={[1.2, 0.4, 0.6]} />
        <meshLambertMaterial color="#9a9a96" />
      </mesh>
    </group>
  );
}

function ApartmentWindow({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* frame */}
      <mesh>
        <boxGeometry args={[1.5, 1.6, 0.04]} />
        <meshLambertMaterial color="#5a3a2a" />
      </mesh>
      {/* glass */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[1.3, 1.4, 0.02]} />
        <meshStandardMaterial
          color="#bdd4e6"
          emissive="#ffd49a"
          emissiveIntensity={0.45}
          toneMapped={false}
        />
      </mesh>
      {/* mullions */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[1.3, 0.06, 0.02]} />
        <meshLambertMaterial color="#5a3a2a" />
      </mesh>
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[0.06, 1.4, 0.02]} />
        <meshLambertMaterial color="#5a3a2a" />
      </mesh>
    </group>
  );
}

function NeighborShopFront({
  x,
  sign,
  accent,
  awningColor,
  wallColor,
}: {
  x: number;
  sign: string;
  accent: string;
  awningColor: string;
  wallColor: string;
}) {
  // A simple neighbor storefront. Glassy door, glowing sign, awning.
  return (
    <group position={[x, 0, -1.2]}>
      {/* shop wall */}
      <mesh position={[0, 1.25, 0]} castShadow>
        <boxGeometry args={[5.6, 2.5, 0.4]} />
        <meshLambertMaterial color={wallColor} />
      </mesh>
      {/* big window */}
      <mesh position={[-1.2, 1.4, 0.21]}>
        <boxGeometry args={[2.6, 1.6, 0.05]} />
        <meshStandardMaterial
          color="#a9c4d6"
          emissive="#ffe2b6"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      {/* door */}
      <mesh position={[1.6, 1.1, 0.21]}>
        <boxGeometry args={[1.2, 2.0, 0.05]} />
        <meshLambertMaterial color="#3a2a1a" />
      </mesh>
      <mesh position={[1.6, 1.4, 0.24]}>
        <boxGeometry args={[1.0, 1.2, 0.02]} />
        <meshStandardMaterial
          color="#9ab6c6"
          emissive="#ffe2b6"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      {/* awning (striped) */}
      <mesh position={[0, 2.7, 0.5]} castShadow>
        <boxGeometry args={[5.4, 0.18, 1.2]} />
        <meshLambertMaterial color={awningColor} />
      </mesh>
      <mesh position={[0, 2.55, 1.0]}>
        <boxGeometry args={[5.4, 0.16, 0.04]} />
        <meshLambertMaterial color="#f2eadf" />
      </mesh>
      {/* sign plaque + neon strip stand-in for the sign text. We encode the
       *  shop type via colour rather than rendering real text — keeps the
       *  GPU shader budget tight (Three's TextGeometry pipeline gets
       *  expensive across 5 dioramas). */}
      <mesh position={[0, 2.95, 0.22]}>
        <boxGeometry args={[3.4, 0.5, 0.06]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 2.95, 0.27]}>
        <boxGeometry args={[2.8, 0.28, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph
        position={[0, 2.95, 0.31]}
        text={sign}
        color="#fff5e6"
        scale={0.06}
      />
    </group>
  );
}

/* Pixel-glyph mini font — renders short uppercase strings as tiny voxel
 * blocks. Keeps the diorama text-readable without pulling a TTF/SDF
 * pipeline into the canvas (which has been the cause of GPU shader
 * pressure when dropped onto multiple eras). Only covers the characters
 * we actually use on signs and posters. */
type Glyph = ReadonlyArray<readonly [number, number]>;
const GLYPHS: Record<string, Glyph> = {
  // 3 cols × 5 rows pixel font
  A: [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[0,3],[2,3],[0,4],[2,4]],
  B: [[0,0],[1,0],[0,1],[2,1],[0,2],[1,2],[0,3],[2,3],[0,4],[1,4]],
  C: [[1,0],[2,0],[0,1],[0,2],[0,3],[1,4],[2,4]],
  D: [[0,0],[1,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[0,4],[1,4]],
  E: [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[0,3],[0,4],[1,4],[2,4]],
  F: [[0,0],[1,0],[2,0],[0,1],[0,2],[1,2],[0,3],[0,4]],
  G: [[1,0],[2,0],[0,1],[0,2],[2,2],[0,3],[2,3],[1,4],[2,4]],
  H: [[0,0],[2,0],[0,1],[2,1],[0,2],[1,2],[2,2],[0,3],[2,3],[0,4],[2,4]],
  // dotless capital I (used for SAVAŞ ELEKTRONIK fallback when needed) and
  // standard I both render as the same vertical bar — Turkish typography
  // distinguishes them with the dotted İ below.
  I: [[1,0],[1,1],[1,2],[1,3],[1,4]],
  J: [[2,0],[2,1],[2,2],[0,3],[2,3],[1,4]],
  K: [[0,0],[2,0],[0,1],[1,1],[0,2],[0,3],[1,3],[0,4],[2,4]],
  L: [[0,0],[0,1],[0,2],[0,3],[0,4],[1,4],[2,4]],
  M: [[0,0],[2,0],[0,1],[1,1],[2,1],[0,2],[2,2],[0,3],[2,3],[0,4],[2,4]],
  N: [[0,0],[2,0],[0,1],[1,1],[2,1],[0,2],[2,2],[0,3],[1,3],[2,3],[0,4],[2,4]],
  O: [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[0,4],[1,4],[2,4]],
  P: [[0,0],[1,0],[0,1],[2,1],[0,2],[1,2],[0,3],[0,4]],
  R: [[0,0],[1,0],[0,1],[2,1],[0,2],[1,2],[0,3],[1,3],[0,4],[2,4]],
  S: [[1,0],[2,0],[0,1],[1,2],[2,3],[0,4],[1,4]],
  T: [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[1,4]],
  U: [[0,0],[2,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[1,4],[2,4],[0,4]],
  V: [[0,0],[2,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[1,4]],
  Y: [[0,0],[2,0],[0,1],[2,1],[1,2],[1,3],[1,4]],
  Z: [[0,0],[1,0],[2,0],[2,1],[1,2],[0,3],[0,4],[1,4],[2,4]],
  Ş: [[1,0],[2,0],[0,1],[1,2],[2,3],[0,4],[1,4],[1,5]],
  Ç: [[1,0],[2,0],[0,1],[0,2],[0,3],[1,4],[2,4],[1,5]],
  Ö: [[0,0],[1,0],[2,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[0,4],[1,4],[2,4],[1,-1]],
  Ü: [[0,0],[2,0],[0,1],[2,1],[0,2],[2,2],[0,3],[2,3],[1,4],[2,4],[0,4],[1,-1]],
  İ: [[0,0],[1,0],[2,0],[1,1],[1,2],[1,3],[0,4],[1,4],[2,4],[1,-1]],
  " ": [],
  "·": [[1,2]],
};

function SignGlyph({
  position,
  text,
  color,
  scale = 0.06,
}: {
  position: [number, number, number];
  text: string;
  color: string;
  scale?: number;
}) {
  // Build voxel pixels for each char and lay them along X. Each char is 3
  // cols + 1 col gap = 4 cols wide, 5 rows tall (plus dot row above for
  // diacritics).
  const pixels = useMemo(() => {
    const out: { x: number; y: number; key: string }[] = [];
    const chars = text.toUpperCase().split("");
    const charW = 4; // 3 + 1 gap
    const totalW = charW * chars.length - 1;
    chars.forEach((ch, ci) => {
      const g = GLYPHS[ch];
      if (!g) return;
      g.forEach(([cx, cy]) => {
        out.push({
          x: ci * charW + cx - totalW / 2,
          // invert y so row 0 sits at top
          y: 4 - cy,
          key: `${ci}-${cx}-${cy}`,
        });
      });
    });
    return out;
  }, [text]);
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {pixels.map((p) => (
        <mesh key={p.key} position={[p.x, p.y, 0]}>
          <boxGeometry args={[1, 1, 0.6]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.7}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

type SavasElektronikProps = {
  screenRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  signRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  accent: string;
};

function SavasElektronikFront({
  screenRef,
  signRef,
  accent,
}: SavasElektronikProps) {
  // Center storefront. Wider than neighbors, with a backlit sign reading
  // "SAVAŞ ELEKTRONİK", a window display showing a CRT + beige tower being
  // repaired, a framed photo (cocuk.JPG) propped in the window, and a
  // sub-header reading "Bilgisayar Tamir" so the function reads at a glance.
  return (
    <group position={[0, 0, -1.2]}>
      {/* Storefront wall — slightly recessed to stand out */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[7.6, 2.6, 0.4]} />
        <meshLambertMaterial color="#e8d8b8" />
      </mesh>
      {/* Tile band along the bottom */}
      <mesh position={[0, 0.18, 0.21]}>
        <boxGeometry args={[7.6, 0.36, 0.02]} />
        <meshLambertMaterial color="#3a2a1a" />
      </mesh>
      {/* Big window — curved frame */}
      <mesh position={[-1.5, 1.45, 0.21]} castShadow>
        <boxGeometry args={[3.8, 2.0, 0.06]} />
        <meshLambertMaterial color="#3a2a1a" />
      </mesh>
      {/* Inner glass */}
      <mesh position={[-1.5, 1.45, 0.24]}>
        <boxGeometry args={[3.5, 1.75, 0.02]} />
        <meshStandardMaterial
          color="#b3c8d4"
          emissive="#fff0c8"
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>

      {/* Window display: CRT + beige tower + keyboard sitting on a counter,
       *  visible through the glass. Pushed slightly forward so it reads. */}
      <group position={[-1.5, 0.7, 0.5]}>
        {/* Counter */}
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[3.2, 0.16, 0.9]} />
          <meshLambertMaterial color="#5a3a1f" />
        </mesh>
        {/* Beige tower */}
        <mesh position={[-1.0, 0.95, -0.05]} castShadow>
          <boxGeometry args={[0.7, 1.0, 0.7]} />
          <meshLambertMaterial color="#d8d0b0" />
        </mesh>
        <mesh position={[-1.0, 1.15, 0.36]}>
          <boxGeometry args={[0.36, 0.06, 0.02]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-1.0, 0.95, 0.36]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-0.83, 0.78, 0.36]}>
          <boxGeometry args={[0.05, 0.05, 0.02]} />
          <meshStandardMaterial
            color="#000"
            emissive="#22ff66"
            emissiveIntensity={2.0}
            toneMapped={false}
          />
        </mesh>
        {/* CRT monitor */}
        <mesh position={[0.3, 0.95, 0]} castShadow>
          <boxGeometry args={[1.3, 1.1, 1.0]} />
          <meshLambertMaterial color="#cfc8a8" />
        </mesh>
        <mesh position={[0.3, 0.95, 0.51]}>
          <boxGeometry args={[1.0, 0.82, 0.02]} />
          <meshStandardMaterial
            ref={screenRef}
            color="#0d2010"
            emissive="#3aff7a"
            emissiveIntensity={0.65}
            toneMapped={false}
          />
        </mesh>
        {/* phosphor scanlines */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0.3, 0.65 + i * 0.16, 0.525]}>
            <boxGeometry args={[0.95, 0.02, 0.01]} />
            <meshStandardMaterial
              color="#62ffaa"
              emissive="#62ffaa"
              emissiveIntensity={0.4}
              toneMapped={false}
              transparent
              opacity={0.4}
            />
          </mesh>
        ))}
        {/* keyboard */}
        <mesh position={[1.05, 0.5, 0.15]} rotation={[-0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.7, 0.06, 0.34]} />
          <meshLambertMaterial color="#cfc8a8" />
        </mesh>
        {/* a small stack of "fixed" devices */}
        <mesh position={[1.3, 0.5, -0.25]} castShadow>
          <boxGeometry args={[0.55, 0.16, 0.4]} />
          <meshLambertMaterial color="#7a8a9a" />
        </mesh>
        <mesh position={[1.3, 0.66, -0.25]} castShadow>
          <boxGeometry args={[0.5, 0.14, 0.36]} />
          <meshLambertMaterial color="#404048" />
        </mesh>
      </group>

      {/* Door */}
      <mesh position={[2.4, 1.2, 0.21]}>
        <boxGeometry args={[1.4, 2.2, 0.06]} />
        <meshLambertMaterial color="#3a2a1a" />
      </mesh>
      <mesh position={[2.4, 1.55, 0.25]}>
        <boxGeometry args={[1.1, 1.4, 0.02]} />
        <meshStandardMaterial
          color="#aac1d2"
          emissive="#fff0c8"
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>
      {/* door handle */}
      <mesh position={[3.0, 1.2, 0.27]}>
        <boxGeometry args={[0.06, 0.18, 0.06]} />
        <meshStandardMaterial color="#caa84a" emissive="#caa84a" emissiveIntensity={0.3} />
      </mesh>
      {/* AÇIK door plaque */}
      <mesh position={[2.4, 2.05, 0.27]}>
        <boxGeometry args={[0.5, 0.18, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" emissive={accent} emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      <SignGlyph position={[2.4, 2.05, 0.3]} text="AÇIK" color="#fff" scale={0.025} />

      {/* Backlit awning */}
      <mesh position={[0, 2.85, 0.6]} castShadow>
        <boxGeometry args={[7.4, 0.22, 1.4]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      {/* Sign backplate — single wide strip so the shop name reads on one line */}
      <mesh position={[0, 3.25, 0.4]} castShadow>
        <boxGeometry args={[7.2, 0.6, 0.18]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Sign neon glow strip behind text */}
      <mesh position={[0, 3.25, 0.51]}>
        <boxGeometry args={[6.9, 0.42, 0.04]} />
        <meshStandardMaterial
          ref={signRef}
          color="#000"
          emissive={accent}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      {/* Sign text — Savaş Elektronik on a single line */}
      <SignGlyph
        position={[0, 3.27, 0.56]}
        text="SAVAŞ ELEKTRONİK"
        color="#fff5e6"
        scale={0.05}
      />
      {/* Sub-header — Bilgisayar Tamir */}
      <SignGlyph
        position={[0, 2.55, 0.32]}
        text="BILGISAYAR TAMIR"
        color="#3a2418"
        scale={0.038}
      />

      {/* A small sandwich-board on the sidewalk in front of the door */}
      <group position={[2.4, 0, 1.6]} rotation={[0, -0.25, 0]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.9, 1.1, 0.06]} />
          <meshLambertMaterial color="#f0e6c8" />
        </mesh>
        <SignGlyph position={[0, 0.85, 0.04]} text="FORMAT" color="#3a2418" scale={0.035} />
        <SignGlyph position={[0, 0.55, 0.04]} text="VIRUS" color="#3a2418" scale={0.035} />
        <SignGlyph position={[0, 0.25, 0.04]} text="DONANIM" color="#3a2418" scale={0.035} />
      </group>

      {/* Warm window-glow point light to make the storefront pop */}
      <pointLight position={[-1.4, 1.4, 0.6]} intensity={0.9} distance={6} color="#ffd49a" />
      <pointLight position={[0, 3.2, 0.6]} intensity={0.7} distance={5} color={accent} />
    </group>
  );
}

function FramedPhoto({
  position,
  src,
  width,
  height,
  rotationY = 0,
  caption,
  frameColor = "#3a2418",
  matColor = "#f0e6c8",
  glow = false,
}: {
  position: [number, number, number];
  src: string;
  width: number;
  height: number;
  rotationY?: number;
  caption?: { tr: string; en: string };
  frameColor?: string;
  matColor?: string;
  glow?: boolean;
}) {
  const tex = useTexture(src);
  const { open } = useLightbox();
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    // Skip mipmaps — these are small framed photos shown at fixed size, so
    // we avoid the GPU memory overhead. Linear filter keeps them readable.
    tex.generateMipmaps = false;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
  }, [tex]);
  // Toggle the canvas cursor when hovering over a clickable photo so users
  // know it's interactive without us drawing extra UI.
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);
  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    open({ src, caption });
  };
  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={hovered ? 1.04 : 1}
      onClick={handleClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* frame */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.18, height + 0.18, 0.08]} />
        <meshLambertMaterial color={frameColor} />
      </mesh>
      {/* matte */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[width + 0.06, height + 0.06, 0.02]} />
        <meshLambertMaterial color={matColor} />
      </mesh>
      {/* photo */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
      {/* hover glow ring + always-on accent if glow=true */}
      {(hovered || glow) && (
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[width + 0.5, height + 0.5]} />
          <meshBasicMaterial
            color={hovered ? "#ffd49a" : "#ff7a59"}
            transparent
            opacity={hovered ? 0.55 : 0.25}
            toneMapped={false}
          />
        </mesh>
      )}
    </group>
  );
}

function DeciduousTree({
  position,
  variant,
}: {
  position: [number, number, number];
  variant: 0 | 1 | 2;
}) {
  // Three voxel tree silhouettes — slight palette shift per variant so the
  // street row doesn't look copy-pasted. Trunk + 3 chunky leaf stacks.
  const palettes: { trunk: string; a: string; b: string; c: string }[] = [
    { trunk: "#4a3018", a: "#3a6a2e", b: "#4a8038", c: "#5a9a44" },
    { trunk: "#3a2510", a: "#2a5024", b: "#3a6e30", c: "#4a883c" },
    { trunk: "#523524", a: "#458a3a", b: "#56a345", c: "#6cba50" },
  ];
  const p = palettes[variant];
  return (
    <group position={position}>
      {/* trunk */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.36, 1.4, 0.36]} />
        <meshLambertMaterial color={p.trunk} />
      </mesh>
      {/* canopy stack */}
      <mesh position={[0, 1.9, 0]} castShadow>
        <boxGeometry args={[1.7, 0.9, 1.7]} />
        <meshLambertMaterial color={p.a} />
      </mesh>
      <mesh position={[0.2, 2.6, -0.1]} castShadow>
        <boxGeometry args={[1.4, 0.8, 1.4]} />
        <meshLambertMaterial color={p.b} />
      </mesh>
      <mesh position={[-0.1, 3.2, 0.1]} castShadow>
        <boxGeometry args={[1.0, 0.7, 1.0]} />
        <meshLambertMaterial color={p.c} />
      </mesh>
      {/* base ring of soil */}
      <mesh position={[0, -0.36, 0]}>
        <boxGeometry args={[0.9, 0.1, 0.9]} />
        <meshLambertMaterial color="#4a3220" />
      </mesh>
    </group>
  );
}

function StreetLamp({
  position,
  bulbRef,
}: {
  position: [number, number, number];
  bulbRef?: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
  return (
    <group position={position}>
      {/* base */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <boxGeometry args={[0.3, 0.2, 0.3]} />
        <meshLambertMaterial color="#2a2a2e" />
      </mesh>
      {/* pole */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <boxGeometry args={[0.12, 3.2, 0.12]} />
        <meshLambertMaterial color="#2a2a2e" />
      </mesh>
      {/* arm */}
      <mesh position={[0.35, 3.25, 0]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.12]} />
        <meshLambertMaterial color="#2a2a2e" />
      </mesh>
      {/* head shade */}
      <mesh position={[0.7, 3.1, 0]} castShadow>
        <boxGeometry args={[0.42, 0.18, 0.42]} />
        <meshLambertMaterial color="#1a1a1e" />
      </mesh>
      {/* bulb */}
      <mesh position={[0.7, 2.93, 0]}>
        <boxGeometry args={[0.32, 0.16, 0.32]} />
        <meshStandardMaterial
          ref={bulbRef}
          color="#1a1a1a"
          emissive="#ffd28a"
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      {/* warm pool of light */}
      <pointLight
        position={[0.7, 2.85, 0]}
        intensity={0.7}
        distance={6}
        color="#ffd28a"
      />
    </group>
  );
}

function Bench({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* legs */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 0]} castShadow>
          <boxGeometry args={[0.14, 0.6, 0.5]} />
          <meshLambertMaterial color="#2a2a2e" />
        </mesh>
      ))}
      {/* seat */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <boxGeometry args={[1.7, 0.1, 0.5]} />
        <meshLambertMaterial color="#7a4a24" />
      </mesh>
      {/* back */}
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <boxGeometry args={[1.7, 0.7, 0.08]} />
        <meshLambertMaterial color="#7a4a24" />
      </mesh>
    </group>
  );
}

/* Voxel city bicycle leaning by the shop door — stand-in for the car the
 * shop's owner used to keep parked there. Two ring-style wheels (made
 * from radially-arranged thin boxes), a chunky frame, saddle and
 * handlebars. Slight tilt so it reads as parked rather than mid-ride.
 */
function Bicycle({
  position,
  rotationY = 0,
}: {
  position: [number, number, number];
  rotationY?: number;
}) {
  // Each wheel: 12 small slats around a center to fake a tire — cheap and
  // crisp at this scale, matches the diorama's voxel look.
  const wheelSlats = useMemo(() => {
    const out: { x: number; y: number; rot: number }[] = [];
    const segs = 12;
    for (let i = 0; i < segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      out.push({ x: Math.cos(a) * 0.32, y: Math.sin(a) * 0.32, rot: a });
    }
    return out;
  }, []);
  return (
    <group position={position} rotation={[0, rotationY, 0.06]}>
      {/* Front wheel (leaning end) */}
      <group position={[0.55, 0.36, 0]}>
        {wheelSlats.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, 0]} rotation={[0, 0, s.rot]}>
            <boxGeometry args={[0.12, 0.06, 0.06]} />
            <meshLambertMaterial color="#1a1a1a" />
          </mesh>
        ))}
        {/* hub */}
        <mesh>
          <boxGeometry args={[0.14, 0.14, 0.1]} />
          <meshLambertMaterial color="#3a3a3a" />
        </mesh>
      </group>
      {/* Rear wheel */}
      <group position={[-0.55, 0.36, 0]}>
        {wheelSlats.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, 0]} rotation={[0, 0, s.rot]}>
            <boxGeometry args={[0.12, 0.06, 0.06]} />
            <meshLambertMaterial color="#1a1a1a" />
          </mesh>
        ))}
        <mesh>
          <boxGeometry args={[0.14, 0.14, 0.1]} />
          <meshLambertMaterial color="#3a3a3a" />
        </mesh>
      </group>

      {/* Frame — top tube + down tube + seat tube */}
      <mesh position={[0, 0.66, 0]} rotation={[0, 0, -0.06]} castShadow>
        <boxGeometry args={[1.0, 0.08, 0.08]} />
        <meshLambertMaterial color="#3a6c8a" />
      </mesh>
      <mesh position={[0.05, 0.5, 0]} rotation={[0, 0, 0.55]} castShadow>
        <boxGeometry args={[0.78, 0.08, 0.08]} />
        <meshLambertMaterial color="#3a6c8a" />
      </mesh>
      <mesh position={[-0.34, 0.55, 0]} rotation={[0, 0, -0.4]} castShadow>
        <boxGeometry args={[0.6, 0.08, 0.08]} />
        <meshLambertMaterial color="#3a6c8a" />
      </mesh>

      {/* Pedals + crank */}
      <mesh position={[0, 0.34, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.32]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0.16, 0.3, 0.18]}>
        <boxGeometry args={[0.18, 0.05, 0.06]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>

      {/* Seat post + saddle */}
      <mesh position={[-0.42, 0.78, 0]} castShadow>
        <boxGeometry args={[0.07, 0.34, 0.07]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[-0.42, 0.99, 0]} castShadow>
        <boxGeometry args={[0.32, 0.08, 0.16]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>

      {/* Handlebar stem + bars */}
      <mesh position={[0.45, 0.82, 0]} castShadow>
        <boxGeometry args={[0.07, 0.32, 0.07]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0.45, 0.98, 0]} castShadow>
        <boxGeometry args={[0.1, 0.06, 0.5]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      {/* Grips */}
      <mesh position={[0.45, 0.98, 0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.12]} />
        <meshLambertMaterial color="#7a4a24" />
      </mesh>
      <mesh position={[0.45, 0.98, -0.25]}>
        <boxGeometry args={[0.1, 0.08, 0.12]} />
        <meshLambertMaterial color="#7a4a24" />
      </mesh>

      {/* Front basket — a small shop courier touch */}
      <mesh position={[0.7, 0.92, 0]} castShadow>
        <boxGeometry args={[0.36, 0.26, 0.34]} />
        <meshLambertMaterial color="#a87a44" />
      </mesh>
      <mesh position={[0.7, 0.93, 0]}>
        <boxGeometry args={[0.32, 0.22, 0.3]} />
        <meshLambertMaterial color="#3a2a18" />
      </mesh>
    </group>
  );
}

function Pedestrian({
  position,
  top,
  bottom,
}: {
  position: [number, number, number];
  top: string;
  bottom: string;
}) {
  return (
    <group position={position}>
      {/* legs */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.32, 0.9, 0.28]} />
        <meshLambertMaterial color={bottom} />
      </mesh>
      {/* torso */}
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[0.45, 0.6, 0.32]} />
        <meshLambertMaterial color={top} />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.65, 0]} castShadow>
        <boxGeometry args={[0.32, 0.32, 0.32]} />
        <meshLambertMaterial color="#d8b48a" />
      </mesh>
      {/* hair cap */}
      <mesh position={[0, 1.83, 0]}>
        <boxGeometry args={[0.34, 0.08, 0.34]} />
        <meshLambertMaterial color="#2a1a10" />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * EnterpriseDiorama — Kurumsal era (2018-2022).
 * Corporate command center: triple-monitor desk, server rack with blinking
 * LED columns, whiteboard with microservices diagram, plant, thermos.
 * Cool blue-purple glow, all-business.
 * ========================================================================= */
function EnterpriseDiorama() {
  const accent = ERAS.enterprise.accent; // #a78bfa
  const ledRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const screenRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  useFrame(() => {
    const t = performance.now() * 0.001;
    ledRefs.current.forEach((m, i) => {
      if (!m) return;
      // each LED row blinks with its own offset, simulating a server alive
      m.emissiveIntensity =
        Math.sin(t * 4 + i * 0.7) > 0.6 ? 2.4 : 0.2;
    });
    screenRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 0.7 + Math.sin(t * 1.2 + i * 1.4) * 0.12;
    });
  });

  return (
    <group>
      {/* Polished concrete floor — cool grey checker */}
      <CheckerFloor size={14} cellSize={1} y={-0.5} colorA="#1d1f2a" colorB="#171924" />
      {/* Fine grid lines on top via thin emissive ribs every 3 tiles */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh key={i} position={[-6 + i * 3, -0.18, 0]}>
          <boxGeometry args={[0.04, 0.02, 14]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.25} toneMapped={false} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* L-shaped desk */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 0.2, 2.6]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      <mesh position={[3.6, 1.25, -1.7]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.2, 2]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      {/* desk edge accent */}
      <mesh position={[0, 1.36, 1.3]}>
        <boxGeometry args={[7, 0.04, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* legs */}
      {([
        [-3.3, 0.6, 1.2],
        [3.3, 0.6, 1.2],
        [-3.3, 0.6, -1.2],
        [3.3, 0.6, -1.2],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.2, 1.2, 0.2]} />
          <meshLambertMaterial color="#1a1d28" />
        </mesh>
      ))}

      {/* Three monitors */}
      {[-2.4, 0, 2.4].map((mx, i) => (
        <group key={i} position={[mx, 2.6, -0.5]} rotation={[0, mx * 0.15, 0]}>
          {/* bezel */}
          <mesh castShadow>
            <boxGeometry args={[2.0, 1.3, 0.18]} />
            <meshLambertMaterial color="#0a0b14" />
          </mesh>
          {/* screen */}
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[1.85, 1.15, 0.04]} />
            <meshStandardMaterial
              ref={(el) => {
                screenRefs.current[i] = el;
              }}
              color="#0a1a2a"
              emissive={accent}
              emissiveIntensity={0.7}
              toneMapped={false}
            />
          </mesh>
          {/* code lines on screen */}
          {Array.from({ length: 5 }).map((_, j) => (
            <mesh
              key={j}
              position={[
                -0.6 + (j % 3) * 0.4,
                0.4 - j * 0.2,
                0.13,
              ]}
            >
              <boxGeometry args={[0.5 + (j * 0.13) % 0.7, 0.06, 0.01]} />
              <meshStandardMaterial color="#000" emissive="#fff" emissiveIntensity={1.3} toneMapped={false} transparent opacity={0.85} />
            </mesh>
          ))}
          {/* monitor stand */}
          <mesh position={[0, -0.9, 0]}>
            <boxGeometry args={[0.4, 0.5, 0.18]} />
            <meshLambertMaterial color="#1a1a25" />
          </mesh>
          <mesh position={[0, -1.2, 0]}>
            <boxGeometry args={[0.9, 0.08, 0.5]} />
            <meshLambertMaterial color="#1a1a25" />
          </mesh>
        </group>
      ))}

      {/* Mechanical keyboard (RGB underglow) */}
      <mesh position={[0, 1.48, 0.7]} castShadow>
        <boxGeometry args={[2.2, 0.16, 0.85]} />
        <meshLambertMaterial color="#15171f" />
      </mesh>
      {Array.from({ length: 14 }).map((_, k) => (
        <mesh key={k} position={[-1 + k * 0.16, 1.6, 0.55]}>
          <boxGeometry args={[0.12, 0.06, 0.12]} />
          <meshLambertMaterial color="#23262d" />
        </mesh>
      ))}
      {/* RGB strip under keyboard */}
      <mesh position={[0, 1.42, 0.7]}>
        <boxGeometry args={[2.18, 0.02, 0.83]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>

      {/* Office chair */}
      <group position={[0, 0, 2.2]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[1.4, 0.18, 1.2]} />
          <meshLambertMaterial color="#15171f" />
        </mesh>
        <mesh position={[0, 1.85, 0.5]} castShadow>
          <boxGeometry args={[1.4, 1.6, 0.18]} />
          <meshLambertMaterial color="#1a1c26" />
        </mesh>
        {/* chair base */}
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>

      {/* Server rack — full height, blinking LED columns */}
      <group position={[-5.5, 0, -1.5]}>
        <mesh position={[0, 2.5, 0]} castShadow>
          <boxGeometry args={[1.8, 5.2, 1.2]} />
          <meshLambertMaterial color="#0a0b13" />
        </mesh>
        {/* rack rails */}
        {Array.from({ length: 8 }).map((_, row) => {
          // each row has a row of 6 small LEDs
          return (
            <group key={row} position={[0, 0.6 + row * 0.55, 0.62]}>
              <mesh>
                <boxGeometry args={[1.6, 0.36, 0.04]} />
                <meshLambertMaterial color="#15161e" />
              </mesh>
              {Array.from({ length: 6 }).map((_, col) => (
                <mesh key={col} position={[-0.55 + col * 0.22, 0, 0.02]}>
                  <boxGeometry args={[0.06, 0.06, 0.02]} />
                  <meshStandardMaterial
                    ref={(el) => {
                      ledRefs.current[row * 6 + col] = el;
                    }}
                    color="#000"
                    emissive={col % 3 === 0 ? "#22ff66" : col % 3 === 1 ? accent : "#ff5a3c"}
                    emissiveIntensity={2}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          );
        })}
        {/* faint vent slots */}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh key={i} position={[0, 5 - i * 0.1, -0.62]}>
            <boxGeometry args={[1.2, 0.02, 0.02]} />
            <meshLambertMaterial color="#1a1c26" />
          </mesh>
        ))}
      </group>

      {/* Whiteboard with microservices diagram boxes */}
      <group position={[5.4, 3, -2]} rotation={[0, -0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[3.2, 2.2, 0.12]} />
          <meshLambertMaterial color="#e8e8ea" />
        </mesh>
        {/* diagram boxes */}
        {([
          [-0.9, 0.4, 0.07, "#7a8aff"],
          [0.0, 0.4, 0.07, "#ff7a59"],
          [0.9, 0.4, 0.07, "#22aa88"],
          [-0.5, -0.3, 0.07, "#7a8aff"],
          [0.6, -0.3, 0.07, "#ff7a59"],
        ] as [number, number, number, string][]).map((d, i) => (
          <mesh key={i} position={[d[0], d[1], d[2]]}>
            <boxGeometry args={[0.5, 0.32, 0.04]} />
            <meshLambertMaterial color={d[3]} />
          </mesh>
        ))}
        {/* connecting "arrows" — thin bars */}
        {([
          [-0.45, 0.4, 0.07, 0.36],
          [0.45, 0.4, 0.07, 0.36],
          [-0.5, 0.05, 0.07, 0.7],
        ] as [number, number, number, number][]).map((d, i) => (
          <mesh key={i} position={[d[0], d[1], d[2]]}>
            <boxGeometry args={[d[3], 0.04, 0.02]} />
            <meshLambertMaterial color="#5a5d6e" />
          </mesh>
        ))}
      </group>

      {/* Coffee thermos */}
      <mesh position={[2, 1.62, 0.6]} castShadow>
        <cylinderGeometry args={[0.18, 0.16, 0.6, 8]} />
        <meshLambertMaterial color="#252830" />
      </mesh>
      <mesh position={[2, 1.93, 0.6]}>
        <cylinderGeometry args={[0.16, 0.18, 0.05, 8]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      {/* Office plant — wide pot + leaf cubes */}
      <group position={[5, 0.5, 1.4]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.6, 0.7]} />
          <meshLambertMaterial color="#3a2a1a" />
        </mesh>
        {[[0.0, 1.2, 0.0], [-0.25, 1.05, 0.2], [0.25, 1.0, -0.2], [0.0, 1.5, 0.15]].map((p, i) => (
          <mesh key={i} position={[p[0], p[1], p[2]]} rotation={[0, i * 0.7, 0.1 * (i % 2 === 0 ? 1 : -1)]} castShadow>
            <boxGeometry args={[0.45, 0.5, 0.45]} />
            <meshLambertMaterial color={["#2a6a4a", "#3a8a5a", "#1a5a3a"][i % 3]} />
          </mesh>
        ))}
      </group>

      {/* Glass partition silhouette behind */}
      <mesh position={[0, 4.5, -3.5]}>
        <boxGeometry args={[10, 4, 0.1]} />
        <meshStandardMaterial color="#0a0e1a" emissive={accent} emissiveIntensity={0.05} toneMapped={false} transparent opacity={0.45} />
      </mesh>

      {/* Cool overhead light */}
      <pointLight position={[0, 6, 2]} intensity={0.7} distance={14} color={accent} />
    </group>
  );
}

/* =========================================================================
 * DriftDiorama — Geçiş era (2022-2025).
 * Caravan + beach + bonfire + Web3 coin floating + palm + hammock under
 * a star-bright sky. Warm sunset palette.
 * ========================================================================= */
function DriftDiorama() {
  const accent = ERAS.drift.accent; // #f472b6
  const fireRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const coinRef = useRef<THREE.Group | null>(null);
  const lapScreenRef = useRef<THREE.MeshStandardMaterial | null>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;
    fireRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 1.2 + Math.sin(t * 6 + i) * 0.4;
    });
    if (coinRef.current) {
      coinRef.current.rotation.y = t * 1.4;
      coinRef.current.position.y = 4.2 + Math.sin(t * 1.2) * 0.18;
    }
    if (lapScreenRef.current) {
      lapScreenRef.current.emissiveIntensity =
        0.8 + Math.sin(t * 3) * 0.08;
    }
  });

  return (
    <group>
      {/* Sandy beach floor — warm yellow + dark patches */}
      <CheckerFloor size={14} cellSize={1} y={-0.5} colorA="#b89870" colorB="#a08458" />
      {/* Wave line at far edge (ocean ribbon) */}
      <mesh position={[0, -0.35, -5.5]}>
        <boxGeometry args={[14, 0.08, 1.5]} />
        <meshStandardMaterial color="#1a4a6a" emissive="#3a8aaa" emissiveIntensity={0.25} toneMapped={false} transparent opacity={0.75} />
      </mesh>
      <mesh position={[0, -0.45, -6.4]}>
        <boxGeometry args={[14, 0.08, 1.4]} />
        <meshStandardMaterial color="#0e3550" emissive="#246680" emissiveIntensity={0.18} toneMapped={false} transparent opacity={0.7} />
      </mesh>

      {/* Caravan / campervan — boxy with curved-feel rounded windows */}
      <group position={[-3.2, 0, -0.2]}>
        {/* body */}
        <mesh position={[0, 1.5, 0]} castShadow>
          <boxGeometry args={[4.2, 2.4, 2.2]} />
          <meshLambertMaterial color="#e6dcc6" />
        </mesh>
        {/* lower stripe */}
        <mesh position={[0, 0.8, 0]}>
          <boxGeometry args={[4.22, 0.5, 2.22]} />
          <meshLambertMaterial color="#9a3a4a" />
        </mesh>
        {/* roof curve */}
        <mesh position={[0, 2.85, 0]}>
          <boxGeometry args={[4, 0.4, 2]} />
          <meshLambertMaterial color="#dccfb4" />
        </mesh>
        {/* windows */}
        <mesh position={[-1.1, 1.7, 1.115]}>
          <boxGeometry args={[1.2, 0.9, 0.04]} />
          <meshStandardMaterial color="#0e2030" emissive="#ffb070" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <mesh position={[1.1, 1.7, 1.115]}>
          <boxGeometry args={[1.2, 0.9, 0.04]} />
          <meshStandardMaterial color="#0e2030" emissive="#ffb070" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        {/* door handle */}
        <mesh position={[1.7, 1.5, 1.13]}>
          <boxGeometry args={[0.1, 0.18, 0.05]} />
          <meshLambertMaterial color="#2a2520" />
        </mesh>
        {/* wheels */}
        <mesh position={[-1.4, 0.4, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 8]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[1.4, 0.4, 1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 8]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[-1.4, 0.4, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 8]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[1.4, 0.4, -1.0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.4, 8]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
        {/* surfboard leaning on side */}
        <mesh position={[-2.3, 1.2, 0.8]} rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.3, 2.4, 0.7]} />
          <meshLambertMaterial color="#f9e8c4" />
        </mesh>
        <mesh position={[-2.3, 1.2, 0.8]} rotation={[0, 0, 0.3]}>
          <boxGeometry args={[0.31, 2.4, 0.1]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
        </mesh>
      </group>

      {/* Foldable beach table + laptop */}
      <group position={[0.3, 0, 1]}>
        <mesh position={[0, 0.7, 0]} castShadow>
          <boxGeometry args={[1.3, 0.1, 0.85]} />
          <meshLambertMaterial color="#3a2a1a" />
        </mesh>
        {/* legs */}
        {([
          [-0.5, 0.35, 0.3],
          [0.5, 0.35, 0.3],
          [-0.5, 0.35, -0.3],
          [0.5, 0.35, -0.3],
        ] as [number, number, number][]).map((p, i) => (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.06, 0.7, 0.06]} />
            <meshLambertMaterial color="#1f1a14" />
          </mesh>
        ))}
        {/* laptop base */}
        <mesh position={[0, 0.78, 0]} castShadow>
          <boxGeometry args={[0.85, 0.04, 0.5]} />
          <meshLambertMaterial color="#a0a8b0" />
        </mesh>
        {/* laptop screen */}
        <mesh position={[0, 1.05, -0.25]} rotation={[Math.PI / 8, 0, 0]} castShadow>
          <boxGeometry args={[0.85, 0.55, 0.04]} />
          <meshLambertMaterial color="#1a1a22" />
        </mesh>
        <mesh position={[0, 1.05, -0.215]} rotation={[Math.PI / 8, 0, 0]}>
          <boxGeometry args={[0.78, 0.48, 0.02]} />
          <meshStandardMaterial
            ref={lapScreenRef}
            color="#00131e"
            emissive={accent}
            emissiveIntensity={0.85}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Bonfire — closer fire pit */}
      <group position={[2.6, -0.3, 1.6]}>
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.55, 0.15, Math.sin(a) * 0.55]}
              castShadow
            >
              <boxGeometry args={[0.32, 0.3, 0.32]} />
              <meshLambertMaterial color="#5a4a3a" />
            </mesh>
          );
        })}
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={i}
            position={[
              Math.sin(i * 1.7) * 0.2,
              0.45 + Math.cos(i * 1.3) * 0.18,
              Math.cos(i * 1.7) * 0.2,
            ]}
          >
            <boxGeometry args={[0.32, 0.5, 0.32]} />
            <meshStandardMaterial
              ref={(el) => {
                fireRefs.current[i] = el;
              }}
              color="#ff8a3a"
              emissive="#ffa050"
              emissiveIntensity={1.5}
              toneMapped={false}
            />
          </mesh>
        ))}
        <pointLight position={[0, 0.6, 0]} intensity={1.6} distance={9} color="#ff8a3a" />
      </group>

      {/* Palm tree (voxel) */}
      <group position={[5, 0, 0.5]}>
        {Array.from({ length: 5 }).map((_, i) => (
          <mesh
            key={i}
            position={[Math.sin(i * 0.4) * 0.2, 0.4 + i * 0.6, Math.cos(i * 0.4) * 0.1]}
            castShadow
          >
            <boxGeometry args={[0.32, 0.6, 0.32]} />
            <meshLambertMaterial color="#3a2818" />
          </mesh>
        ))}
        {/* fronds */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.9, 3.6 - i * 0.05, Math.sin(a) * 0.9]}
              rotation={[0, a, -0.4]}
              castShadow
            >
              <boxGeometry args={[1.4, 0.18, 0.4]} />
              <meshLambertMaterial color={i % 2 === 0 ? "#2a6a3a" : "#1f5a2a"} />
            </mesh>
          );
        })}
        {/* coconuts */}
        <mesh position={[0.2, 3.5, 0.2]} castShadow>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshLambertMaterial color="#2a1a10" />
        </mesh>
        <mesh position={[-0.2, 3.55, -0.1]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshLambertMaterial color="#2a1a10" />
        </mesh>
      </group>

      {/* Hammock between two posts */}
      <group position={[2, 0, -1.8]}>
        <mesh position={[-1.5, 1.4, 0]}>
          <boxGeometry args={[0.18, 2.6, 0.18]} />
          <meshLambertMaterial color="#2a1a10" />
        </mesh>
        <mesh position={[1.5, 1.4, 0]}>
          <boxGeometry args={[0.18, 2.6, 0.18]} />
          <meshLambertMaterial color="#2a1a10" />
        </mesh>
        {/* sag-shaped hammock — three slabs */}
        <mesh position={[0, 1.6, 0]}>
          <boxGeometry args={[2.8, 0.1, 0.7]} />
          <meshLambertMaterial color="#c44a5a" />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[2.4, 0.08, 0.5]} />
          <meshLambertMaterial color="#a23a4a" />
        </mesh>
      </group>

      {/* Web3 coin floating above */}
      <group ref={coinRef} position={[0.5, 4.2, -1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.55, 0.55, 0.18, 16]} />
          <meshStandardMaterial color="#ffd24a" emissive="#ffb24a" emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
        {/* "₿" / coin face — three little bars */}
        <mesh position={[0, 0, 0.1]}>
          <boxGeometry args={[0.1, 0.4, 0.04]} />
          <meshStandardMaterial color="#000" emissive="#ff7a3a" emissiveIntensity={1} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.12, 0.1]}>
          <boxGeometry args={[0.32, 0.08, 0.04]} />
          <meshStandardMaterial color="#000" emissive="#ff7a3a" emissiveIntensity={1} toneMapped={false} />
        </mesh>
        <mesh position={[0, -0.12, 0.1]}>
          <boxGeometry args={[0.32, 0.08, 0.04]} />
          <meshStandardMaterial color="#000" emissive="#ff7a3a" emissiveIntensity={1} toneMapped={false} />
        </mesh>
      </group>

      {/* Driftwood */}
      <mesh position={[-0.5, -0.2, 2.5]} rotation={[0, 0.4, 0.1]}>
        <boxGeometry args={[1.6, 0.25, 0.25]} />
        <meshLambertMaterial color="#5a4a3a" />
      </mesh>

      {/* Sunset glow on the horizon */}
      <pointLight position={[0, 1.5, -5]} intensity={0.8} distance={20} color="#ff8a4a" />
    </group>
  );
}

/* =========================================================================
 * AgenticDiorama — Agentic era (2025-2026).
 * Cyberpunk AI lab: hover-floating holo monitors, neon grid floor,
 * data globe, AI agent figure, mesai console with glowing edges.
 * ========================================================================= */
function AgenticDiorama() {
  const accent = ERAS.agentic.accent; // #60a5fa
  const holoRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const agentRef = useRef<THREE.Group | null>(null);
  const dataPillarRefs = useRef<(THREE.Mesh | null)[]>([]);

  useFrame(() => {
    const t = performance.now() * 0.001;
    holoRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 0.85 + Math.sin(t * 2 + i * 0.9) * 0.18;
      m.opacity = 0.78 + Math.sin(t * 1.4 + i * 0.7) * 0.12;
    });
    if (sphereRef.current) {
      sphereRef.current.rotation.y = t * 0.4;
      sphereRef.current.rotation.x = Math.sin(t * 0.3) * 0.2;
      sphereRef.current.position.y = 4.2 + Math.sin(t * 0.9) * 0.2;
    }
    if (agentRef.current) {
      agentRef.current.position.y = 1.2 + Math.sin(t * 1.6) * 0.05;
    }
    dataPillarRefs.current.forEach((m, i) => {
      if (!m) return;
      m.scale.y = 1 + Math.sin(t * 2 + i * 1.2) * 0.3;
    });
  });

  return (
    <group>
      {/* Dark glossy floor with neon grid lines */}
      <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#06080f" />
      </mesh>
      {/* neon grid stripes — long thin emissive bars */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`x${i}`} position={[-6 + i * 2, -0.48, 0]}>
          <boxGeometry args={[0.06, 0.02, 14]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`z${i}`} position={[0, -0.48, -6 + i * 2]}>
          <boxGeometry args={[14, 0.02, 0.06]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}

      {/* Central console — angular pedestal */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[3, 1.6, 2]} />
        <meshLambertMaterial color="#0d111c" />
      </mesh>
      {/* console glow strips */}
      {[1.61, 0.01, -1.61].map((x, i) => (
        <mesh key={i} position={[x, 0.3, 1.005]}>
          <boxGeometry args={[0.06, 1.4, 0.04]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.6} toneMapped={false} />
        </mesh>
      ))}
      {/* top trim */}
      <mesh position={[0, 1.62, 0]}>
        <boxGeometry args={[3.05, 0.04, 2.05]} />
        <meshStandardMaterial color="#ec5aa6" emissive="#ec5aa6" emissiveIntensity={1.4} toneMapped={false} />
      </mesh>

      {/* Three floating holographic monitors arc above the console */}
      {[-2, 0, 2].map((mx, i) => (
        <group key={i} position={[mx, 3.2, 0]} rotation={[0, mx * -0.18, 0.05]}>
          <mesh>
            <boxGeometry args={[1.6, 1.2, 0.04]} />
            <meshStandardMaterial
              ref={(el) => {
                holoRefs.current[i] = el;
              }}
              color="#000"
              emissive={i === 1 ? "#ec5aa6" : accent}
              emissiveIntensity={0.85}
              toneMapped={false}
              transparent
              opacity={0.78}
              depthWrite={false}
            />
          </mesh>
          {/* holo bezel ribbon */}
          <mesh position={[0, 0, 0.04]}>
            <boxGeometry args={[1.65, 1.25, 0.01]} />
            <meshStandardMaterial color={i === 1 ? "#ec5aa6" : accent} emissive={i === 1 ? "#ec5aa6" : accent} emissiveIntensity={1.4} toneMapped={false} transparent opacity={0.8} />
          </mesh>
          {/* fake content bars */}
          {Array.from({ length: 4 }).map((_, j) => (
            <mesh key={j} position={[-0.55 + (j % 2) * 0.6, 0.32 - j * 0.18, 0.06]}>
              <boxGeometry args={[0.5, 0.08, 0.01]} />
              <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.2} toneMapped={false} transparent opacity={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* AI agent figure — minimal voxel humanoid */}
      <group ref={agentRef} position={[1.5, 0, 1.6]}>
        {/* legs */}
        <mesh position={[-0.18, 0.45, 0]} castShadow>
          <boxGeometry args={[0.22, 0.9, 0.22]} />
          <meshLambertMaterial color="#1a2236" />
        </mesh>
        <mesh position={[0.18, 0.45, 0]} castShadow>
          <boxGeometry args={[0.22, 0.9, 0.22]} />
          <meshLambertMaterial color="#1a2236" />
        </mesh>
        {/* torso */}
        <mesh position={[0, 1.3, 0]} castShadow>
          <boxGeometry args={[0.6, 0.8, 0.4]} />
          <meshLambertMaterial color="#222a3e" />
        </mesh>
        {/* core glow */}
        <mesh position={[0, 1.3, 0.21]}>
          <boxGeometry args={[0.32, 0.32, 0.04]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        {/* arms */}
        <mesh position={[-0.42, 1.3, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshLambertMaterial color="#1a2236" />
        </mesh>
        <mesh position={[0.42, 1.3, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.18]} />
          <meshLambertMaterial color="#1a2236" />
        </mesh>
        {/* head */}
        <mesh position={[0, 1.95, 0]} castShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
          <meshLambertMaterial color="#10141f" />
        </mesh>
        {/* glowing visor (eye strip) */}
        <mesh position={[0, 1.97, 0.255]}>
          <boxGeometry args={[0.36, 0.1, 0.02]} />
          <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={2.2} toneMapped={false} />
        </mesh>
      </group>

      {/* Floating wireframe data globe */}
      <mesh ref={sphereRef} position={[0, 4.2, -2]}>
        <icosahedronGeometry args={[0.85, 1]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={0.6}
          toneMapped={false}
          wireframe
        />
      </mesh>

      {/* Four data pillars at the corners — pulsing emissive bars */}
      {([
        [-5, 0, -3],
        [5, 0, -3],
        [-5, 0, 3],
        [5, 0, 3],
      ] as [number, number, number][]).map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            dataPillarRefs.current[i] = el;
          }}
          position={[p[0], p[1] + 1.5, p[2]]}
          castShadow
        >
          <boxGeometry args={[0.4, 3, 0.4]} />
          <meshStandardMaterial color="#0a0e1a" emissive={i % 2 === 0 ? accent : "#ec5aa6"} emissiveIntensity={0.9} toneMapped={false} />
        </mesh>
      ))}

      {/* Neon "MESAI" sign overhead */}
      <NeonSign position={[-3.4, 5.2, -2.4]} text="MESAI" accent="#ec5aa6" bgColor="#0a0e1a" />
      <NeonSign position={[3.2, 4.8, -2.4]} text="KHORA" accent={accent} bgColor="#0a0e1a" />

      {/* Floating data cubes — small chunks orbiting console */}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i / 6) * Math.PI * 2;
        const r = 3.5;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * r, 2 + Math.sin(i) * 0.3, Math.sin(a) * r]}
          >
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial color={i % 2 === 0 ? accent : "#ec5aa6"} emissive={i % 2 === 0 ? accent : "#ec5aa6"} emissiveIntensity={1.6} toneMapped={false} />
          </mesh>
        );
      })}

      {/* Cyberpunk magenta rim light */}
      <pointLight position={[3, 4, 3]} intensity={0.8} distance={16} color="#ec5aa6" />
      <pointLight position={[-3, 4, 3]} intensity={0.6} distance={14} color={accent} />
    </group>
  );
}
