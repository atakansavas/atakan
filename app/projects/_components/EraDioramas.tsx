"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ERAS, ERA_ORDER } from "../_lib/data";
import type { Era } from "../_lib/data";
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
        // tents + lone tree silhouette
        return [
          { x: -10, w: 4, h: 3, color: dim },
          { x: -5, w: 5, h: 4, color: dim },
          { x: 1, w: 3, h: 6, color: dim },
          { x: 6, w: 4, h: 3, color: dim },
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
 * Survival-mode youth: tent, campfire, first chunky PC, kerosene lamp,
 * notebook + stack of programming books, lonely pine tree. Warm orange-
 * red firelight, the sense of a kid teaching himself code by torchlight.
 * ========================================================================= */
function GenesisDiorama() {
  const accent = ERAS.genesis.accent; // #ff7a59
  // Campfire flicker — each flame cube has its own slightly different rate
  const flameRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lampRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const screenRef = useRef<THREE.MeshStandardMaterial | null>(null);
  useFrame(() => {
    const t = performance.now() * 0.001;
    flameRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity =
        1.2 + Math.sin(t * (5 + i) + i * 0.7) * 0.4 + Math.sin(t * 13 + i) * 0.2;
    });
    if (lampRef.current) {
      lampRef.current.emissiveIntensity =
        1.1 + Math.sin(t * 3.4) * 0.18 + Math.sin(t * 9) * 0.06;
    }
    if (screenRef.current) {
      // green CRT phosphor wobble
      screenRef.current.emissiveIntensity =
        0.55 + Math.sin(t * 6) * 0.06 + Math.sin(t * 17) * 0.03;
    }
  });

  return (
    <group>
      {/* Earthy ground — alternating dirt + dry grass */}
      <CheckerFloor size={14} cellSize={1} y={-0.5} colorA="#3a2a1d" colorB="#2a2014" />
      {/* Patchy "grass" tufts */}
      {Array.from({ length: 14 }).map((_, i) => {
        const x = (Math.sin(i * 7.3) * 0.5 + 0.5) * 12 - 6;
        const z = (Math.cos(i * 2.1) * 0.5 + 0.5) * 12 - 6;
        return (
          <mesh key={i} position={[x, -0.15, z]}>
            <boxGeometry args={[0.3, 0.2, 0.3]} />
            <meshLambertMaterial color={i % 2 === 0 ? "#2f4a1d" : "#3a5a25"} />
          </mesh>
        );
      })}

      {/* Tent — triangular prism made of slabs */}
      <group position={[-4.5, 0, -1]}>
        <mesh castShadow>
          <boxGeometry args={[2.6, 0.4, 2.4]} />
          <meshLambertMaterial color="#5a3525" />
        </mesh>
        {/* tent fabric — two leaning slabs forming a peak */}
        <mesh position={[-0.7, 1.1, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[2.0, 0.18, 2.4]} />
          <meshLambertMaterial color="#7a3520" />
        </mesh>
        <mesh position={[0.7, 1.1, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
          <boxGeometry args={[2.0, 0.18, 2.4]} />
          <meshLambertMaterial color="#5e2a18" />
        </mesh>
        {/* warm tent interior glow */}
        <pointLight position={[0, 0.7, 0]} intensity={0.4} distance={4} color="#ffae6a" />
      </group>

      {/* Campfire — stones + flames */}
      <group position={[-1.2, -0.3, 1.6]}>
        {/* stone ring */}
        {Array.from({ length: 6 }).map((_, i) => {
          const a = (i / 6) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.55, 0.15, Math.sin(a) * 0.55]}
              castShadow
            >
              <boxGeometry args={[0.32, 0.3, 0.32]} />
              <meshLambertMaterial color="#3a3a3a" />
            </mesh>
          );
        })}
        {/* flame cubes */}
        {Array.from({ length: 4 }).map((_, i) => {
          const a = (i / 4) * Math.PI * 2;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(a) * 0.18,
                0.45 + Math.sin(i * 1.7) * 0.15,
                Math.sin(a) * 0.18,
              ]}
            >
              <boxGeometry args={[0.32, 0.45, 0.32]} />
              <meshStandardMaterial
                ref={(el) => {
                  flameRefs.current[i] = el;
                }}
                color="#ff8a3a"
                emissive="#ff5a1a"
                emissiveIntensity={1.5}
                toneMapped={false}
              />
            </mesh>
          );
        })}
        {/* campfire light */}
        <pointLight
          position={[0, 0.6, 0]}
          intensity={1.6}
          distance={9}
          color={accent}
        />
      </group>

      {/* Workbench (small wooden table) */}
      <mesh position={[1.5, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.3, 2.2]} />
        <meshLambertMaterial color="#5a3a1f" />
      </mesh>
      {([
        [0.2, 0.55, 0.9],
        [2.8, 0.55, 0.9],
        [0.2, 0.55, -0.9],
        [2.8, 0.55, -0.9],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.25, 1.1, 0.25]} />
          <meshLambertMaterial color="#3f2812" />
        </mesh>
      ))}

      {/* Chunky beige PC tower (90s/2000s) */}
      <mesh position={[1.2, 1.95, -0.3]} castShadow>
        <boxGeometry args={[0.9, 1.2, 1.4]} />
        <meshLambertMaterial color="#d8d0b0" />
      </mesh>
      {/* floppy slot */}
      <mesh position={[1.2, 2.2, 0.41]}>
        <boxGeometry args={[0.45, 0.08, 0.04]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* CD slot */}
      <mesh position={[1.2, 1.9, 0.41]}>
        <boxGeometry args={[0.6, 0.05, 0.04]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* power LED */}
      <mesh position={[1.5, 1.65, 0.41]}>
        <boxGeometry args={[0.06, 0.06, 0.04]} />
        <meshStandardMaterial color="#000" emissive="#22ff66" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>

      {/* CRT monitor (green phosphor) */}
      <mesh position={[2.5, 2.3, 0]} castShadow>
        <boxGeometry args={[1.6, 1.4, 1.2]} />
        <meshLambertMaterial color="#cfc8a8" />
      </mesh>
      <mesh position={[2.5, 2.3, 0.61]}>
        <boxGeometry args={[1.2, 1.0, 0.04]} />
        <meshStandardMaterial
          ref={screenRef}
          color="#0d2010"
          emissive="#3aff7a"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Phosphor scanlines (cosmetic) */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[2.5, 1.95 + i * 0.16, 0.625]}>
          <boxGeometry args={[1.05, 0.02, 0.01]} />
          <meshStandardMaterial color="#62ffaa" emissive="#62ffaa" emissiveIntensity={0.4} toneMapped={false} transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Stack of HTML/programming books */}
      <group position={[2.7, 1.5, -0.7]}>
        <mesh castShadow>
          <boxGeometry args={[0.7, 0.16, 0.5]} />
          <meshLambertMaterial color="#a23a2a" />
        </mesh>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.7, 0.16, 0.5]} />
          <meshLambertMaterial color="#3a4a8a" />
        </mesh>
        <mesh position={[0, 0.36, 0]} castShadow>
          <boxGeometry args={[0.7, 0.16, 0.5]} />
          <meshLambertMaterial color="#2a8a4a" />
        </mesh>
      </group>

      {/* Notebook + pencil */}
      <mesh position={[0.6, 1.39, 0.4]} rotation={[0, -0.2, 0]} castShadow>
        <boxGeometry args={[0.6, 0.04, 0.8]} />
        <meshLambertMaterial color="#e0d8b0" />
      </mesh>
      <mesh position={[0.95, 1.41, 0.45]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.4, 0.04, 0.04]} />
        <meshLambertMaterial color="#ffa64a" />
      </mesh>

      {/* Kerosene lamp on the floor */}
      <group position={[-2.2, 0, 1.8]}>
        <mesh position={[0, 0.4, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.22, 0.8, 8]} />
          <meshLambertMaterial color="#3a2a1a" />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.3, 8]} />
          <meshStandardMaterial
            ref={lampRef}
            color="#1a1a1a"
            emissive="#ffaf3a"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 1.18, 0]}>
          <cylinderGeometry args={[0.16, 0.18, 0.18, 8]} />
          <meshLambertMaterial color="#3a2a1a" />
        </mesh>
        <pointLight position={[0, 1.1, 0]} intensity={0.5} distance={4} color="#ffaf3a" />
      </group>

      {/* Lonely pine tree (single voxel tree) */}
      <group position={[5.5, 0, -2.2]}>
        <mesh position={[0, 0.8, 0]} castShadow>
          <boxGeometry args={[0.4, 1.6, 0.4]} />
          <meshLambertMaterial color="#3a2515" />
        </mesh>
        <mesh position={[0, 2.4, 0]} castShadow>
          <boxGeometry args={[1.6, 1.0, 1.6]} />
          <meshLambertMaterial color="#1f3f23" />
        </mesh>
        <mesh position={[0, 3.4, 0]} castShadow>
          <boxGeometry args={[1.2, 0.8, 1.2]} />
          <meshLambertMaterial color="#2a4f2e" />
        </mesh>
        <mesh position={[0, 4.1, 0]} castShadow>
          <boxGeometry args={[0.8, 0.6, 0.8]} />
          <meshLambertMaterial color="#34603a" />
        </mesh>
      </group>

      {/* Tiny wooden chair */}
      <mesh position={[0.2, 0.9, 1.6]} castShadow>
        <boxGeometry args={[0.7, 0.18, 0.7]} />
        <meshLambertMaterial color="#5a3a22" />
      </mesh>
      <mesh position={[0.2, 1.45, 1.95]} castShadow>
        <boxGeometry args={[0.7, 1.0, 0.12]} />
        <meshLambertMaterial color="#5a3a22" />
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
