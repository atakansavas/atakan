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
        // Far Istanbul ridgeline silhouette across the strait — chunky
        // buildings + minaret + tower. Dim navy so they sink behind the
        // mid-distance buildings rendered inside the diorama itself.
        return [
          { x: -16, w: 4, h: 4, color: "#101428" },
          { x: -11, w: 5, h: 6, color: "#101428" },
          { x: -7, w: 3, h: 8, color: "#101428" },
          { x: -3, w: 4, h: 5, color: "#101428" },
          { x: 0.5, w: 0.6, h: 9, color: "#101428" }, // minaret
          { x: 3, w: 5, h: 6, color: "#101428" },
          { x: 8, w: 3, h: 9, color: "#101428" },
          { x: 12, w: 5, h: 5, color: "#101428" },
          { x: 16, w: 4, h: 4, color: "#101428" },
          { x: 0, w: 0.5, h: 1.6, color: palette }, // tiny accent dot for life
        ] as Stamp[];
      case "enterprise":
        // Corporate-district skyline — tall glass towers + one blinking
        // antenna so the office reads as part of a wider business strip.
        return [
          { x: -16, w: 3, h: 9, color: "#101428" },
          { x: -12, w: 4, h: 13, color: "#101428" },
          { x: -8, w: 3, h: 10, color: "#101428" },
          { x: -3, w: 5, h: 15, color: "#101428" },
          { x: 2, w: 4, h: 12, color: "#101428" },
          { x: 7, w: 6, h: 17, color: "#101428" },
          { x: 14, w: 3, h: 11, color: "#101428" },
          // small accent dot (city light) on top of the tallest tower
          { x: 7, w: 0.4, h: 0.4, color: palette },
        ] as Stamp[];
      case "drift":
        // Distant tropical ridge — tall jungle peaks fading into the sunset.
        // The diorama itself already paints a vivid foreground, so the
        // horizon stays low and dim so it reads as backdrop only.
        return [
          { x: -18, w: 8, h: 6, color: "#2a1428" },
          { x: -10, w: 9, h: 10, color: "#2a1428" },
          { x: -1, w: 11, h: 8, color: "#2a1428" },
          { x: 10, w: 8, h: 7, color: "#2a1428" },
          { x: 17, w: 5, h: 4, color: "#2a1428" },
          // small accent dot in palette (Drift hot pink)
          { x: -4, w: 0.5, h: 1.6, color: palette },
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
 * Atölye (Atelier) era — İstanbul iki yakası + Boğaz.
 *
 * Concept: the three agencies Atakan worked at sat on opposite shores of
 * the Bosphorus. The right shore holds SSCTur + XeusMedia (commercial,
 * crowded, AXIS-less). The left shore holds Improde and AXIS AVM (more
 * corporate). A dark-green '96 Renault R19 loops between them via the
 * Bosphorus Bridge. Two ferries glide in opposite directions; sailboats
 * dot the horizon; seagulls track the bridge lights; the water carries
 * a soft, animated reflection of the bridge's red towers.
 *
 * All clickable photo/posters use the same FramedPhoto helper as Genesis,
 * which routes clicks to the global lightbox.
 * ========================================================================= */
function AtelierDiorama() {
  const accent = ERAS.agency.accent; // #7d8cff cool-blue
  // Animated material refs for night flickers
  const cgScreenRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const mapScreenRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const avmLogoRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const bridgeLightRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  // Animated group refs for moving entities
  const carRef = useRef<THREE.Group | null>(null);
  const ferry1Ref = useRef<THREE.Group | null>(null);
  const ferry2Ref = useRef<THREE.Group | null>(null);
  const sailboatRefs = useRef<(THREE.Group | null)[]>([]);
  const seagullRefs = useRef<(THREE.Group | null)[]>([]);

  // R19 path waypoints — sağ yakadan girip, sağ yol boyu ilerler, köprüye
  // çıkar, köprüyü geçer, sol yakaya iner, sol yol boyu döner, U-turn, geri
  // dönüş aynı yolu izler. Tek loop ~28sn.
  const carPath = useMemo<{
    x: number;
    y: number;
    z: number;
    rotY: number;
  }[]>(
    () => [
      // Start: right shore, near SSCTur (z= +3 cadde başı)
      { x: 5.0, y: 0.0, z: 3.5, rotY: Math.PI }, // facing -Z
      { x: 5.0, y: 0.0, z: 0.5, rotY: Math.PI },
      { x: 5.0, y: 0.0, z: -1.0, rotY: Math.PI }, // approaching bridge
      // Bridge entrance on right side (x=3, deck height y=4.2)
      { x: 3.2, y: 0.6, z: -1.2, rotY: Math.PI * 0.75 }, // ramp up
      { x: 3.0, y: 4.2, z: -1.2, rotY: Math.PI * 0.5 }, // turn west onto bridge
      // Across the bridge
      { x: 0, y: 4.2, z: -1.2, rotY: Math.PI * 0.5 },
      { x: -3.0, y: 4.2, z: -1.2, rotY: Math.PI * 0.5 }, // bridge end
      { x: -3.2, y: 0.6, z: -1.2, rotY: Math.PI * 0.25 }, // ramp down
      // Left shore drive — past Improde (z down toward camera)
      { x: -5.0, y: 0.0, z: -1.0, rotY: 0 }, // facing +Z
      { x: -5.0, y: 0.0, z: 1.5, rotY: 0 },
      { x: -5.0, y: 0.0, z: 3.5, rotY: 0 },
      // U-turn loop end — slight pause at end of left road; rotY swings
      { x: -5.0, y: 0.0, z: 3.8, rotY: Math.PI }, // turn around
      // Return path: left shore back toward bridge
      { x: -5.0, y: 0.0, z: -1.0, rotY: Math.PI },
      { x: -3.2, y: 0.6, z: -1.2, rotY: Math.PI * 1.25 },
      { x: -3.0, y: 4.2, z: -1.2, rotY: Math.PI * 1.5 },
      // Cross back over bridge eastbound
      { x: 0, y: 4.2, z: -1.2, rotY: Math.PI * 1.5 },
      { x: 3.0, y: 4.2, z: -1.2, rotY: Math.PI * 1.5 },
      { x: 3.2, y: 0.6, z: -1.2, rotY: Math.PI * 1.75 },
      // Right shore back to start
      { x: 5.0, y: 0.0, z: -1.0, rotY: 0 },
      { x: 5.0, y: 0.0, z: 3.5, rotY: 0 },
    ],
    [],
  );

  useFrame(() => {
    const t = performance.now() * 0.001;
    // CG (XeusMedia) — green-ish phosphor with periodic refresh
    if (cgScreenRef.current) {
      cgScreenRef.current.emissiveIntensity =
        0.7 + Math.sin(t * 5) * 0.1 + (Math.sin(t * 23) > 0.92 ? -0.3 : 0);
    }
    // Improde 3D map — slow scanning pulse
    if (mapScreenRef.current) {
      mapScreenRef.current.emissiveIntensity = 0.65 + Math.sin(t * 1.6) * 0.18;
    }
    // AXIS logo gentle breathing
    if (avmLogoRef.current) {
      avmLogoRef.current.emissiveIntensity = 1.3 + Math.sin(t * 1.1) * 0.12;
    }
    // Bridge tower aircraft-warning lights flicker
    bridgeLightRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = (Math.sin(t * 2.4 + i * 1.7) > 0 ? 2.4 : 0.6);
    });

    // R19 — sample the polyline path at a loop fraction
    if (carRef.current) {
      const period = 28; // seconds full loop
      const f = ((t % period) / period) * carPath.length;
      const i0 = Math.floor(f) % carPath.length;
      const i1 = (i0 + 1) % carPath.length;
      const lerp = f - Math.floor(f);
      const p0 = carPath[i0];
      const p1 = carPath[i1];
      carRef.current.position.set(
        p0.x + (p1.x - p0.x) * lerp,
        p0.y + (p1.y - p0.y) * lerp,
        p0.z + (p1.z - p0.z) * lerp,
      );
      // Shortest-angle interpolation for rotation
      let dr = p1.rotY - p0.rotY;
      if (dr > Math.PI) dr -= Math.PI * 2;
      if (dr < -Math.PI) dr += Math.PI * 2;
      carRef.current.rotation.y = p0.rotY + dr * lerp;
    }

    // Ferries — opposite directions through the strait
    if (ferry1Ref.current) {
      const span = 14;
      const z = ((t * 0.35) % span) - span / 2 + 3;
      ferry1Ref.current.position.set(-0.6, -0.2, z);
      ferry1Ref.current.rotation.y = Math.PI; // bow toward +Z (toward camera)
      ferry1Ref.current.position.y = -0.2 + Math.sin(t * 1.2) * 0.04; // bob
    }
    if (ferry2Ref.current) {
      const span = 14;
      const z = -(((t * 0.28) % span) - span / 2) - 1;
      ferry2Ref.current.position.set(0.7, -0.2, z);
      ferry2Ref.current.rotation.y = 0; // bow toward -Z
      ferry2Ref.current.position.y = -0.2 + Math.sin(t * 1.4 + 1.1) * 0.04;
    }

    // Sailboats — slow lateral drift
    sailboatRefs.current.forEach((g, i) => {
      if (!g) return;
      const speed = 0.08 + i * 0.02;
      const span = 12;
      const z = ((t * speed + i * 4) % span) - span / 2;
      g.position.z = z;
      g.position.y = -0.18 + Math.sin(t * 0.9 + i * 1.3) * 0.05;
    });

    // Seagulls — drift in a flat ring above the bridge
    seagullRefs.current.forEach((g, i) => {
      if (!g) return;
      const speed = 0.4 + i * 0.07;
      const phase = i * 0.9;
      const r = 4.5 + (i % 2) * 0.6;
      g.position.set(
        Math.cos(t * speed + phase) * r,
        5.2 + Math.sin(t * 1.6 + phase) * 0.25,
        Math.sin(t * speed + phase) * 1.6 - 1.0,
      );
      g.rotation.y = -t * speed - phase + Math.PI / 2;
      // wing flap (scale Y)
      const flap = 1 + Math.sin(t * 12 + phase) * 0.25;
      g.scale.set(1, flap, 1);
    });
  });

  return (
    <group>
      {/* Night sky tint behind the diorama — bluish-violet to support neon */}
      <AtelierSky />

      {/* Background skyline silhouette */}
      <AtelierBackgroundSkyline />

      {/* Distant city lights across the Bosphorus on the far shore */}

      {/* ---- Bosphorus water surface (animated ripples via emissive bars) ---- */}
      <BosphorusWater />

      {/* ---- Right shore ground + road ---- */}
      <Shore side="right" />

      {/* ---- Left shore ground + road ---- */}
      <Shore side="left" />

      {/* ---- Bosphorus Bridge ---- */}
      <BosphorusBridge bridgeLightRefs={bridgeLightRefs} />

      {/* ---- Buildings: right shore (SSCTur + XeusMedia) ---- */}
      <Suspense fallback={null}>
        <SSCTurShop position={[5.6, 0, 3.2]} />
      </Suspense>
      <Suspense fallback={null}>
        <XeusMediaShop position={[7.0, 0, -2.0]} cgScreenRef={cgScreenRef} />
      </Suspense>
      {/* Right-shore small stand: freelance portfolio (under SSCTur era) */}
      <ProjectStand
        position={[4.4, 0, 1.4]}
        accent="#ffcd5c"
        label="PORTFOLYO"
      />
      {/* Right-shore small stand: Playout Web Client (XeusMedia) */}
      <ProjectStand
        position={[5.6, 0, -3.6]}
        accent="#62ffaa"
        label="PLAYOUT"
      />

      {/* ---- Buildings: left shore (Improde + AXIS AVM + BiSesVar stand) ---- */}
      <Suspense fallback={null}>
        <ImprodeShop position={[-5.6, 0, 3.2]} mapScreenRef={mapScreenRef} />
      </Suspense>
      <AxisAVM position={[-7.4, 0, -2.5]} logoRef={avmLogoRef} accent={accent} />
      <ProjectStand
        position={[-4.4, 0, 1.4]}
        accent="#ff6aa9"
        label="BISESVAR"
      />

      {/* ---- Water life: ferries, sailboats, seagulls ---- */}
      <group ref={ferry1Ref}>
        <Ferry name="ŞEHIR HATLARI" />
      </group>
      <group ref={ferry2Ref}>
        <Ferry name="DENIZ" />
      </group>

      {[0, 1, 2].map((i) => (
        <group
          key={i}
          ref={(el) => {
            sailboatRefs.current[i] = el;
          }}
          position={[i === 1 ? -1.3 : 1.4, 0, 0]}
        >
          <Sailboat scale={0.9 - i * 0.1} />
        </group>
      ))}

      {Array.from({ length: 5 }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            seagullRefs.current[i] = el;
          }}
        >
          <Seagull />
        </group>
      ))}

      {/* ---- Renault R19 ---- */}
      <group ref={carRef}>
        <Renault19 />
      </group>

      {/* ---- Helpful per-era accent lights ---- */}
      <pointLight position={[0, 5.2, 0]} intensity={0.6} distance={10} color={accent} />
      <pointLight position={[6, 2.5, 1]} intensity={0.5} distance={8} color="#ffcd5c" />
      <pointLight position={[-6, 2.5, 1]} intensity={0.5} distance={8} color={accent} />
    </group>
  );
}

/* =====================================================================
 * Atelier helpers — sky, water, shore, bridge, buildings, ferry, sailboat,
 * seagull, R19. Kept inside this file so the diorama is self-contained.
 * ===================================================================== */

function AtelierSky() {
  // Deep blue-violet wash + neon-ish horizon strip so the night reads warm
  // enough to make the bridge red towers and shop neons pop.
  return (
    <group position={[0, 5, -16]}>
      <mesh position={[0, 4, 0]}>
        <planeGeometry args={[60, 14]} />
        <meshBasicMaterial color="#0a0e2a" toneMapped={false} />
      </mesh>
      <mesh position={[0, -2, 0.05]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial color="#1a2050" toneMapped={false} />
      </mesh>
      <mesh position={[0, -6, 0.1]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial color="#0e1230" toneMapped={false} />
      </mesh>
      {/* A faint crescent moon */}
      <mesh position={[-9, 6, 0.05]}>
        <circleGeometry args={[0.7, 18]} />
        <meshBasicMaterial color="#f4e6c4" toneMapped={false} />
      </mesh>
      <mesh position={[-8.65, 6.15, 0.06]}>
        <circleGeometry args={[0.65, 18]} />
        <meshBasicMaterial color="#0a0e2a" toneMapped={false} />
      </mesh>
    </group>
  );
}

function AtelierBackgroundSkyline() {
  // Far rows of voxel buildings on both shores. Lit windows form a tiny
  // night skyline reminiscent of Istanbul's silhouette across the strait.
  type B = {
    x: number;
    z: number;
    w: number;
    h: number;
    d: number;
    color: string;
  };
  const right: B[] = [
    { x: 10, z: -7, w: 3, h: 8, d: 3, color: "#1a1a2a" },
    { x: 13, z: -7, w: 2.4, h: 11, d: 3, color: "#1f1f30" },
    { x: 15.5, z: -6.5, w: 2.6, h: 7, d: 3, color: "#1a1a2a" },
  ];
  const left: B[] = [
    { x: -10, z: -7, w: 2.6, h: 9, d: 3, color: "#1a1a2a" },
    { x: -13, z: -7, w: 3.2, h: 12, d: 3, color: "#1f1f30" },
    { x: -16, z: -6.5, w: 2.4, h: 7, d: 3, color: "#1a1a2a" },
  ];
  return (
    <group>
      {[...right, ...left].map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshLambertMaterial color={b.color} />
          </mesh>
          {/* lit windows grid */}
          {Array.from({ length: Math.min(4, Math.floor(b.h / 2)) }).map((_, r) => (
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
                    color="#0a0a14"
                    emissive={(r + c + i) % 3 === 0 ? "#ffd28a" : "#7d8cff"}
                    emissiveIntensity={(r + c + i) % 3 === 0 ? 0.85 : 0.35}
                    toneMapped={false}
                  />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}
      {/* A radio tower on a far hill, right side, to break the skyline */}
      <group position={[17, 0, -7]}>
        <mesh position={[0, 5, 0]} castShadow>
          <boxGeometry args={[0.3, 10, 0.3]} />
          <meshLambertMaterial color="#2a2a3a" />
        </mesh>
        <mesh position={[0, 10.3, 0]}>
          <boxGeometry args={[0.18, 0.5, 0.18]} />
          <meshStandardMaterial
            color="#000"
            emissive="#ff3a3a"
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function BosphorusWater() {
  // Long water plane runs in Z direction between the two shores. We layer
  // a couple of slightly different-shade strips + thin emissive bars that
  // imitate wave crests catching bridge light.
  const wavePositions = useMemo(() => {
    const out: { x: number; z: number; w: number; rot: number }[] = [];
    for (let i = 0; i < 22; i++) {
      out.push({
        x: -1.8 + Math.random() * 3.6,
        z: -6 + i * 0.6 + Math.random() * 0.4,
        w: 0.4 + Math.random() * 0.6,
        rot: (Math.random() - 0.5) * 0.4,
      });
    }
    return out;
  }, []);
  return (
    <group>
      {/* base water */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[5.4, 0.05, 14]} />
        <meshLambertMaterial color="#0a1838" />
      </mesh>
      {/* darker centre channel */}
      <mesh position={[0, -0.495, 0]}>
        <boxGeometry args={[3.6, 0.03, 14]} />
        <meshLambertMaterial color="#06122a" />
      </mesh>
      {/* shimmering wave crests catching tower light */}
      {wavePositions.map((w, i) => (
        <mesh key={i} position={[w.x, -0.46, w.z]} rotation={[0, w.rot, 0]}>
          <boxGeometry args={[w.w, 0.02, 0.08]} />
          <meshStandardMaterial
            color="#3a4060"
            emissive="#7da0ff"
            emissiveIntensity={i % 3 === 0 ? 0.6 : 0.25}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* bridge tower reflection — two soft red strips directly below towers */}
      <mesh position={[0, -0.47, -1.2]}>
        <boxGeometry args={[0.4, 0.02, 2.4]} />
        <meshStandardMaterial
          color="#1a0a0e"
          emissive="#ff3030"
          emissiveIntensity={0.35}
          toneMapped={false}
          transparent
          opacity={0.6}
        />
      </mesh>
    </group>
  );
}

function Shore({ side }: { side: "left" | "right" }) {
  // Each shore is a chunky waterfront slab with a road running in Z and a
  // pavement edge.
  const sign = side === "left" ? -1 : 1;
  return (
    <group position={[sign * 5, 0, 0]}>
      {/* Asphalt road strip running in Z */}
      <mesh position={[0, -0.45, 0]} receiveShadow>
        <boxGeometry args={[2.4, 0.1, 12]} />
        <meshLambertMaterial color="#2a2a32" />
      </mesh>
      {/* Lane stripes */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[0, -0.39, -5 + i * 1.4]}>
          <boxGeometry args={[0.16, 0.02, 0.7]} />
          <meshBasicMaterial color="#e6c66a" toneMapped={false} />
        </mesh>
      ))}
      {/* Inner pavement (away from the water) */}
      <mesh position={[sign * 1.8, -0.42, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.14, 12]} />
        <meshLambertMaterial color="#5a5a64" />
      </mesh>
      {/* Outer pavement (toward the water) */}
      <mesh position={[sign * -1.4, -0.42, 0]} receiveShadow>
        <boxGeometry args={[0.6, 0.14, 12]} />
        <meshLambertMaterial color="#5a5a64" />
      </mesh>
      {/* Sea wall — small kerb facing the water */}
      <mesh position={[sign * -1.75, -0.3, 0]}>
        <boxGeometry args={[0.18, 0.4, 12]} />
        <meshLambertMaterial color="#3a3a44" />
      </mesh>
      {/* Sodium-vapor street lamps along the road */}
      {[-4, 0, 4].map((z, i) => (
        <ShoreLamp key={i} position={[sign * 1.0, 0, z]} />
      ))}
    </group>
  );
}

function ShoreLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.12, 3.2, 0.12]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0, 3.18, 0]}>
        <boxGeometry args={[0.36, 0.16, 0.36]} />
        <meshStandardMaterial
          color="#1a1a1a"
          emissive="#ffae5a"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[0, 3.1, 0]} intensity={0.45} distance={4} color="#ffae5a" />
    </group>
  );
}

type BridgeRefs = {
  bridgeLightRefs: React.MutableRefObject<(THREE.MeshStandardMaterial | null)[]>;
};

function BosphorusBridge({ bridgeLightRefs }: BridgeRefs) {
  // Two red towers + horizontal deck + cable fans + aircraft-warning
  // lights blinking at the tower tops.
  const towerColor = "#a32525"; // classic Bosphorus tower red
  return (
    <group>
      {/* Deck (the road across) */}
      <mesh position={[0, 4.2, -1.2]} castShadow>
        <boxGeometry args={[7.0, 0.18, 1.2]} />
        <meshLambertMaterial color="#1a1a22" />
      </mesh>
      {/* Deck under-trusses */}
      <mesh position={[0, 4.05, -1.2]}>
        <boxGeometry args={[7.2, 0.1, 0.04]} />
        <meshLambertMaterial color="#2a2a36" />
      </mesh>
      {/* Approach ramps */}
      <mesh
        position={[3.4, 2.4, -1.2]}
        rotation={[0, 0, Math.atan2(4.2 - 0, 0.8) - Math.PI / 2]}
      >
        <boxGeometry args={[2.6, 0.16, 1.2]} />
        <meshLambertMaterial color="#1a1a22" />
      </mesh>
      <mesh
        position={[-3.4, 2.4, -1.2]}
        rotation={[0, 0, -(Math.atan2(4.2 - 0, 0.8) - Math.PI / 2)]}
      >
        <boxGeometry args={[2.6, 0.16, 1.2]} />
        <meshLambertMaterial color="#1a1a22" />
      </mesh>

      {/* Towers */}
      {[-3, 3].map((x, i) => (
        <group key={i} position={[x, 0, -1.2]}>
          {/* base piers */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <boxGeometry args={[0.7, 1, 0.7]} />
            <meshLambertMaterial color="#3a1818" />
          </mesh>
          {/* main vertical legs (two parallel) */}
          {[-0.35, 0.35].map((dx, j) => (
            <mesh key={j} position={[dx, 4.0, 0]} castShadow>
              <boxGeometry args={[0.4, 7.6, 0.4]} />
              <meshLambertMaterial color={towerColor} />
            </mesh>
          ))}
          {/* Cross beams */}
          <mesh position={[0, 4.2, 0]}>
            <boxGeometry args={[0.9, 0.22, 0.5]} />
            <meshLambertMaterial color={towerColor} />
          </mesh>
          <mesh position={[0, 6.4, 0]}>
            <boxGeometry args={[0.9, 0.22, 0.5]} />
            <meshLambertMaterial color={towerColor} />
          </mesh>
          <mesh position={[0, 7.6, 0]}>
            <boxGeometry args={[0.9, 0.22, 0.5]} />
            <meshLambertMaterial color={towerColor} />
          </mesh>
          {/* Tower top caps */}
          <mesh position={[0, 7.9, 0]}>
            <boxGeometry args={[1.0, 0.16, 0.6]} />
            <meshLambertMaterial color="#4a1818" />
          </mesh>
          {/* Aircraft-warning red blinker */}
          <mesh position={[0, 8.05, 0]}>
            <boxGeometry args={[0.18, 0.18, 0.18]} />
            <meshStandardMaterial
              ref={(el) => {
                bridgeLightRefs.current[i] = el;
              }}
              color="#1a0606"
              emissive="#ff2a2a"
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          {/* tower point light helps water reflection sell */}
          <pointLight position={[0, 6, 0.5]} intensity={0.7} distance={10} color="#ff5a4a" />
        </group>
      ))}

      {/* Suspension cables — thin diagonal slats fanning from tower tops to
       *  the deck. Approximated as a few slanted thin boxes per side. */}
      {[-3, 3].map((tx, i) =>
        Array.from({ length: 8 }).map((_, j) => {
          const dir = tx < 0 ? 1 : -1;
          const t = (j + 1) / 9;
          // X at deck side
          const dx = tx + dir * t * 3;
          const dy = 4.3;
          const ty = 7.4;
          // mid-point + rotation
          const cx = (tx + dx) / 2;
          const cy = (ty + dy) / 2;
          const len = Math.sqrt((dx - tx) ** 2 + (dy - ty) ** 2);
          const rot = Math.atan2(dy - ty, dx - tx);
          return (
            <mesh
              key={`${i}-${j}`}
              position={[cx, cy, -1.2]}
              rotation={[0, 0, rot]}
            >
              <boxGeometry args={[len, 0.04, 0.04]} />
              <meshStandardMaterial
                color="#2a2030"
                emissive="#ffae8a"
                emissiveIntensity={0.25}
                toneMapped={false}
              />
            </mesh>
          );
        }),
      )}
      {/* Main suspension cable arc — simulated with 6 box segments */}
      {Array.from({ length: 12 }).map((_, i) => {
        const x = -3 + (i + 1) * (6 / 13);
        const local = (x + 3) / 6; // 0..1
        const sag = Math.sin(local * Math.PI) * 1.6; // arch
        const y = 7.4 - 0.8 + sag;
        return (
          <mesh key={i} position={[x, y, -1.2]}>
            <boxGeometry args={[0.55, 0.07, 0.07]} />
            <meshLambertMaterial color="#3a3340" />
          </mesh>
        );
      })}
    </group>
  );
}

function SSCTurShop({ position }: { position: [number, number, number] }) {
  // Small ground-floor office. Vitrine carries an actual photo from the
  // SSCTur days — click → lightbox. Sign kept to a single line so the
  // window/photo carry the visual weight.
  return (
    <group position={position}>
      {/* Building shell */}
      <mesh position={[0, 1.3, -1.1]} castShadow>
        <boxGeometry args={[3.2, 2.6, 2.2]} />
        <meshLambertMaterial color="#b8a484" />
      </mesh>
      {/* Roof slab */}
      <mesh position={[0, 2.7, -1.1]}>
        <boxGeometry args={[3.4, 0.18, 2.3]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      {/* Window — backlit dim so the framed photo sitting in front pops */}
      <mesh position={[-0.7, 1.5, 0.01]}>
        <boxGeometry args={[1.6, 1.6, 0.06]} />
        <meshStandardMaterial
          color="#0a1430"
          emissive="#3a8cff"
          emissiveIntensity={0.25}
          toneMapped={false}
        />
      </mesh>
      {/* Real photo on an in-window display, clickable */}
      <FramedPhoto
        position={[-0.7, 1.5, 0.18]}
        src="/assets/ssctur-tex.jpg"
        width={1.3}
        height={1.3}
        frameColor="#3a2418"
        matColor="#e6d6b0"
        glow
        caption={{
          tr: "SSCTur · 2014-2015 · ilk iş, alobilethatti.com",
          en: "SSCTur · 2014-2015 · first job, alobilethatti.com",
        }}
      />
      {/* Door */}
      <mesh position={[1.0, 1.1, 0.01]}>
        <boxGeometry args={[0.7, 2.0, 0.06]} />
        <meshLambertMaterial color="#2a1810" />
      </mesh>
      <mesh position={[1.0, 1.45, 0.04]}>
        <boxGeometry args={[0.55, 1.0, 0.02]} />
        <meshStandardMaterial color="#1a3050" emissive="#3a8cff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      {/* Single-line sign */}
      <mesh position={[0, 2.4, 0.02]}>
        <boxGeometry args={[3.0, 0.5, 0.06]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 2.4, 0.06]}>
        <boxGeometry args={[2.7, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive="#62ffaa"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[0, 2.4, 0.1]} text="SSCTUR" color="#0a1a14" scale={0.058} />
    </group>
  );
}

function XeusMediaShop({
  position,
  cgScreenRef,
}: {
  position: [number, number, number];
  cgScreenRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
  // Bigger building (2 floors). Vitrininde Character Generator ekranı
  // — flagship project, large clickable lightbox image stand inside.
  return (
    <group position={position}>
      {/* Two-floor building */}
      <mesh position={[0, 2.3, -1.1]} castShadow>
        <boxGeometry args={[4.0, 4.6, 2.2]} />
        <meshLambertMaterial color="#3a3550" />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 4.7, -1.1]}>
        <boxGeometry args={[4.2, 0.2, 2.3]} />
        <meshLambertMaterial color="#1a1822" />
      </mesh>
      {/* Floor divider */}
      <mesh position={[0, 2.4, 0.02]}>
        <boxGeometry args={[4.0, 0.12, 0.03]} />
        <meshLambertMaterial color="#1a1822" />
      </mesh>
      {/* Upper-floor windows */}
      {[-1.0, 0.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 3.4, 0.02]}>
          <boxGeometry args={[0.7, 1.1, 0.06]} />
          <meshStandardMaterial
            color="#1a2a4a"
            emissive="#7d8cff"
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Ground floor — large vitrine acting as a backlit display case */}
      <mesh position={[-0.8, 1.35, 0.02]} castShadow>
        <boxGeometry args={[2.6, 2.0, 0.06]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
      {/* Backlit vitrine inner panel — gives the photo a warm glow halo */}
      <mesh position={[-0.8, 1.35, 0.07]}>
        <boxGeometry args={[2.4, 1.8, 0.04]} />
        <meshStandardMaterial
          ref={cgScreenRef}
          color="#0a1a14"
          emissive="#7d8cff"
          emissiveIntensity={0.55}
          toneMapped={false}
        />
      </mesh>
      {/* Real XeusMedia workspace photo inside the vitrine — clickable */}
      <FramedPhoto
        position={[-0.8, 1.35, 0.18]}
        src="/assets/xeusmedia-tex.jpg"
        width={2.0}
        height={1.5}
        frameColor="#1a1822"
        matColor="#cfcdc0"
        glow
        caption={{
          tr: "XeusMedia · 2015-2016 · ofis ve Character Generator",
          en: "XeusMedia · 2015-2016 · the office and Character Generator",
        }}
      />
      {/* Door on the right */}
      <mesh position={[1.4, 1.1, 0.02]}>
        <boxGeometry args={[0.7, 2.0, 0.06]} />
        <meshLambertMaterial color="#1a1822" />
      </mesh>
      <mesh position={[1.4, 1.45, 0.05]}>
        <boxGeometry args={[0.55, 1.0, 0.02]} />
        <meshStandardMaterial color="#1a3050" emissive="#7d8cff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      {/* Single-line neon sign */}
      <mesh position={[0, 4.45, 0.02]}>
        <boxGeometry args={[3.8, 0.5, 0.06]} />
        <meshLambertMaterial color="#0a0a12" />
      </mesh>
      <mesh position={[0, 4.45, 0.06]}>
        <boxGeometry args={[3.4, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive="#7d8cff"
          emissiveIntensity={1.7}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[0, 4.45, 0.1]} text="XEUSMEDIA" color="#fff5e6" scale={0.05} />
    </group>
  );
}

function ImprodeShop({
  position,
  mapScreenRef,
}: {
  position: [number, number, number];
  mapScreenRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
  // Two-floor building. Vitrininde 3D harita ekranı (Cesium-mock).
  return (
    <group position={position}>
      <mesh position={[0, 2.3, -1.1]} castShadow>
        <boxGeometry args={[4.0, 4.6, 2.2]} />
        <meshLambertMaterial color="#404858" />
      </mesh>
      <mesh position={[0, 4.7, -1.1]}>
        <boxGeometry args={[4.2, 0.2, 2.3]} />
        <meshLambertMaterial color="#1a1822" />
      </mesh>
      <mesh position={[0, 2.4, 0.02]}>
        <boxGeometry args={[4.0, 0.12, 0.03]} />
        <meshLambertMaterial color="#1a1822" />
      </mesh>
      {[-1.0, 0.0, 1.0].map((x, i) => (
        <mesh key={i} position={[x, 3.4, 0.02]}>
          <boxGeometry args={[0.7, 1.1, 0.06]} />
          <meshStandardMaterial
            color="#1a2a4a"
            emissive="#27e0c2"
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* Vitrine */}
      <mesh position={[-0.8, 1.35, 0.02]} castShadow>
        <boxGeometry args={[2.4, 2.0, 0.06]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
      {/* Map screen */}
      <mesh position={[-0.8, 1.35, 0.07]}>
        <boxGeometry args={[2.2, 1.8, 0.04]} />
        <meshStandardMaterial
          ref={mapScreenRef}
          color="#062420"
          emissive="#27e0c2"
          emissiveIntensity={0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Cesium-mock: a few terrain block silhouettes on the screen */}
      {([
        [-0.6, 0.05, 0.4, 0.3],
        [-0.2, 0.1, 0.45, 0.45],
        [0.2, 0.2, 0.55, 0.55],
        [0.5, 0.12, 0.5, 0.4],
        [-0.4, 0.45, 0.3, 0.25],
      ] as [number, number, number, number][]).map((b, i) => (
        <mesh
          key={i}
          position={[-0.8 + b[0], 0.95 + b[1], 0.09]}
        >
          <boxGeometry args={[b[2], b[3], 0.02]} />
          <meshStandardMaterial
            color="#0a3a30"
            emissive="#27e0c2"
            emissiveIntensity={1.1 - i * 0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
      {/* "3D" badge */}
      <SignGlyph position={[-0.45, 2.05, 0.1]} text="3D" color="#fff" scale={0.05} />
      {/* Door */}
      <mesh position={[1.2, 1.1, 0.02]}>
        <boxGeometry args={[0.8, 2.0, 0.06]} />
        <meshLambertMaterial color="#1a1822" />
      </mesh>
      <mesh position={[1.2, 1.45, 0.05]}>
        <boxGeometry args={[0.6, 1.0, 0.02]} />
        <meshStandardMaterial color="#1a3050" emissive="#27e0c2" emissiveIntensity={0.45} toneMapped={false} />
      </mesh>
      {/* Sign */}
      <mesh position={[0, 4.45, 0.02]}>
        <boxGeometry args={[3.8, 0.55, 0.06]} />
        <meshLambertMaterial color="#0a0a12" />
      </mesh>
      <mesh position={[0, 4.45, 0.06]}>
        <boxGeometry args={[3.3, 0.36, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive="#27e0c2"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[0, 4.45, 0.1]} text="IMPRODE" color="#fff5e6" scale={0.05} />
    </group>
  );
}

function AxisAVM({
  position,
  logoRef,
  accent,
}: {
  position: [number, number, number];
  logoRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  accent: string;
}) {
  // 4-floor mall with glass facade + giant AXIS logo on the roof.
  return (
    <group position={position}>
      {/* main block */}
      <mesh position={[0, 3.2, -1.4]} castShadow>
        <boxGeometry args={[5.0, 6.4, 3.0]} />
        <meshLambertMaterial color="#1a1f30" />
      </mesh>
      {/* glass facade strips */}
      {Array.from({ length: 4 }).map((_, r) => (
        <group key={r}>
          {Array.from({ length: 5 }).map((_, c) => (
            <mesh
              key={c}
              position={[
                -2 + c * 1,
                1.0 + r * 1.5,
                0.11,
              ]}
            >
              <boxGeometry args={[0.8, 1.1, 0.06]} />
              <meshStandardMaterial
                color="#1a2030"
                emissive={(r * 5 + c) % 4 === 0 ? "#7d8cff" : "#aab5e8"}
                emissiveIntensity={(r * 5 + c) % 4 === 0 ? 0.8 : 0.45}
                toneMapped={false}
              />
            </mesh>
          ))}
        </group>
      ))}
      {/* Vertical accent strip */}
      <mesh position={[1.9, 3.2, 0.13]}>
        <boxGeometry args={[0.18, 6.0, 0.04]} />
        <meshStandardMaterial
          color="#0a0a14"
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-1.9, 3.2, 0.13]}>
        <boxGeometry args={[0.18, 6.0, 0.04]} />
        <meshStandardMaterial
          color="#0a0a14"
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      {/* Roof + giant logo */}
      <mesh position={[0, 6.5, -1.4]}>
        <boxGeometry args={[5.2, 0.2, 3.1]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
      <mesh position={[0, 7.0, 0.05]}>
        <boxGeometry args={[3.2, 0.7, 0.16]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
      <mesh position={[0, 7.0, 0.14]}>
        <boxGeometry args={[2.6, 0.48, 0.04]} />
        <meshStandardMaterial
          ref={logoRef}
          color="#000"
          emissive="#ff7a59"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[0, 7.02, 0.2]} text="AXIS AVM" color="#fff5e6" scale={0.062} />
    </group>
  );
}

function ProjectStand({
  position,
  accent,
  label,
}: {
  position: [number, number, number];
  accent: string;
  label: string;
}) {
  // Sidewalk billboard: two-pole stand with a vertical board, neon-rimmed
  // sign with a single project tag. Single line keeps the street legible
  // when looked at from a distance.
  return (
    <group position={position}>
      {/* Two legs */}
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, 0.55, 0]} castShadow>
          <boxGeometry args={[0.1, 1.1, 0.1]} />
          <meshLambertMaterial color="#2a2a30" />
        </mesh>
      ))}
      {/* Board backplate */}
      <mesh position={[0, 1.5, 0]} castShadow>
        <boxGeometry args={[1.3, 0.7, 0.08]} />
        <meshLambertMaterial color="#0a0a12" />
      </mesh>
      {/* Neon strip background */}
      <mesh position={[0, 1.5, 0.045]}>
        <boxGeometry args={[1.15, 0.5, 0.03]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[0, 1.5, 0.08]} text={label} color="#fff5e6" scale={0.046} />
    </group>
  );
}

function Ferry({ name }: { name: string }) {
  // Voxel city ferry — broad hull, white superstructure, smoke stack with
  // emissive top, a row of yellow window dots.
  void name; // future hook: could render name on the side
  return (
    <group>
      {/* lower hull */}
      <mesh position={[0, 0.18, 0]} castShadow>
        <boxGeometry args={[0.9, 0.36, 2.2]} />
        <meshLambertMaterial color="#2a3040" />
      </mesh>
      {/* upper hull (white) */}
      <mesh position={[0, 0.48, 0.05]} castShadow>
        <boxGeometry args={[0.78, 0.28, 1.9]} />
        <meshLambertMaterial color="#e8e6dc" />
      </mesh>
      {/* cabin */}
      <mesh position={[0, 0.78, 0.15]} castShadow>
        <boxGeometry args={[0.62, 0.36, 1.2]} />
        <meshLambertMaterial color="#cfcdc0" />
      </mesh>
      {/* wheelhouse */}
      <mesh position={[0, 1.05, -0.45]}>
        <boxGeometry args={[0.5, 0.24, 0.4]} />
        <meshLambertMaterial color="#e8e6dc" />
      </mesh>
      {/* smoke stack */}
      <mesh position={[0, 1.2, -0.25]}>
        <boxGeometry args={[0.18, 0.4, 0.18]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0, 1.4, -0.25]}>
        <boxGeometry args={[0.22, 0.08, 0.22]} />
        <meshStandardMaterial color="#ff5a3a" emissive="#ff5a3a" emissiveIntensity={1.0} toneMapped={false} />
      </mesh>
      {/* row of windows */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[0.32, 0.78, -0.4 + i * 0.18]}>
          <boxGeometry args={[0.02, 0.18, 0.12]} />
          <meshStandardMaterial color="#000" emissive="#ffd86a" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-0.32, 0.78, -0.4 + i * 0.18]}>
          <boxGeometry args={[0.02, 0.18, 0.12]} />
          <meshStandardMaterial color="#000" emissive="#ffd86a" emissiveIntensity={1.3} toneMapped={false} />
        </mesh>
      ))}
      {/* mast light */}
      <mesh position={[0, 1.55, -0.25]}>
        <boxGeometry args={[0.05, 0.05, 0.05]} />
        <meshStandardMaterial color="#000" emissive="#ffffff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 1.55, -0.25]} intensity={0.5} distance={3} color="#fff5d0" />
    </group>
  );
}

function Sailboat({ scale = 1 }: { scale?: number }) {
  return (
    <group scale={[scale, scale, scale]}>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.18, 0.1, 0.55]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[0, 0.42, 0.12]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.02, 0.55, 0.36]} />
        <meshStandardMaterial color="#f8efd6" emissive="#fff5d8" emissiveIntensity={0.25} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Seagull() {
  return (
    <group>
      {/* body */}
      <mesh>
        <boxGeometry args={[0.16, 0.08, 0.18]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
      {/* wings — wider than body, scale Y is flapped externally */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.6, 0.04, 0.1]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function Renault19() {
  // Stocky '96 hatchback in dark green. Slight downward grille, two
  // round-ish headlights, simple boxy proportions.
  const body = "#1f3a2a"; // dark green
  return (
    <group>
      {/* lower body */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[1.4, 0.4, 0.6]} />
        <meshLambertMaterial color={body} />
      </mesh>
      {/* hood (short front) */}
      <mesh position={[0.5, 0.45, 0]} castShadow>
        <boxGeometry args={[0.42, 0.16, 0.55]} />
        <meshLambertMaterial color={body} />
      </mesh>
      {/* cabin */}
      <mesh position={[-0.1, 0.7, 0]} castShadow>
        <boxGeometry args={[0.85, 0.36, 0.55]} />
        <meshLambertMaterial color={body} />
      </mesh>
      {/* hatch back slope */}
      <mesh position={[-0.55, 0.55, 0]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.32, 0.32, 0.55]} />
        <meshLambertMaterial color={body} />
      </mesh>
      {/* Side windows */}
      <mesh position={[-0.1, 0.74, 0.28]}>
        <boxGeometry args={[0.7, 0.26, 0.02]} />
        <meshStandardMaterial color="#0a1018" emissive="#7d8cff" emissiveIntensity={0.18} toneMapped={false} />
      </mesh>
      <mesh position={[-0.1, 0.74, -0.28]}>
        <boxGeometry args={[0.7, 0.26, 0.02]} />
        <meshStandardMaterial color="#0a1018" emissive="#7d8cff" emissiveIntensity={0.18} toneMapped={false} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0.28, 0.74, 0]} rotation={[0, 0, -0.18]}>
        <boxGeometry args={[0.3, 0.3, 0.5]} />
        <meshStandardMaterial color="#0a1018" emissive="#aac4e6" emissiveIntensity={0.25} toneMapped={false} />
      </mesh>
      {/* Headlights */}
      <mesh position={[0.72, 0.4, 0.2]}>
        <boxGeometry args={[0.04, 0.1, 0.14]} />
        <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      <mesh position={[0.72, 0.4, -0.2]}>
        <boxGeometry args={[0.04, 0.1, 0.14]} />
        <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Grille */}
      <mesh position={[0.72, 0.28, 0]}>
        <boxGeometry args={[0.04, 0.08, 0.42]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-0.72, 0.4, 0.2]}>
        <boxGeometry args={[0.04, 0.12, 0.16]} />
        <meshStandardMaterial color="#9a1a1a" emissive="#ff3a3a" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <mesh position={[-0.72, 0.4, -0.2]}>
        <boxGeometry args={[0.04, 0.12, 0.16]} />
        <meshStandardMaterial color="#9a1a1a" emissive="#ff3a3a" emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      {/* Wheels */}
      {([
        [0.45, 0.0, 0.34],
        [-0.45, 0.0, 0.34],
        [0.45, 0.0, -0.34],
        [-0.45, 0.0, -0.34],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.26, 0.26, 0.14]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
      ))}
      {/* small Renault badge dot */}
      <mesh position={[0.74, 0.5, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.06]} />
        <meshStandardMaterial color="#caa84a" emissive="#caa84a" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {/* Headlight cones — two small accent point lights ahead of the car */}
      <pointLight position={[1.4, 0.5, 0]} intensity={0.6} distance={3.5} color="#fff5d0" />
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

/* Wall-mounted video screen — plays a short clip looped + muted on a 3D
 * panel using THREE.VideoTexture. Click opens the full clip in the
 * lightbox where it auto-plays with sound controls available.
 */
function VideoScreen({
  position,
  rotationY = 0,
  src,
  width,
  height,
  caption,
  frameColor = "#0a0b14",
  glow = false,
}: {
  position: [number, number, number];
  rotationY?: number;
  src: string;
  width: number;
  height: number;
  caption?: { tr: string; en: string };
  frameColor?: string;
  glow?: boolean;
}) {
  const { open } = useLightbox();
  const [hovered, setHovered] = useState(false);
  // Build one hidden HTMLVideoElement per mount and wrap it in a
  // THREE.VideoTexture. The video plays muted + looped on the GPU so the
  // diorama is always alive without forcing the user to interact first.
  const video = useMemo(() => {
    if (typeof document === "undefined") return null;
    const v = document.createElement("video");
    v.src = src;
    v.crossOrigin = "anonymous";
    v.loop = true;
    v.muted = true;
    v.playsInline = true;
    v.autoplay = true;
    // Hint to the browser this is a decorative element, not the focus
    v.preload = "auto";
    // Some browsers reject autoplay until play() is called explicitly
    v.play().catch(() => {});
    return v;
  }, [src]);
  const texture = useMemo(() => {
    if (!video) return null;
    const t = new THREE.VideoTexture(video);
    t.colorSpace = THREE.SRGBColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.generateMipmaps = false;
    return t;
  }, [video]);
  useEffect(() => {
    return () => {
      // Pause + detach the video on unmount so we don't leak playback.
      if (video) {
        video.pause();
        video.src = "";
        video.load();
      }
      texture?.dispose();
    };
  }, [video, texture]);
  useEffect(() => {
    if (!hovered) return;
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [hovered]);
  return (
    <group
      position={position}
      rotation={[0, rotationY, 0]}
      scale={hovered ? 1.03 : 1}
      onClick={(e) => {
        e.stopPropagation();
        open({ src, caption });
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    >
      {/* bezel */}
      <mesh castShadow>
        <boxGeometry args={[width + 0.18, height + 0.18, 0.1]} />
        <meshLambertMaterial color={frameColor} />
      </mesh>
      {/* dark backplate (so screen edges read crisp) */}
      <mesh position={[0, 0, 0.052]}>
        <boxGeometry args={[width + 0.04, height + 0.04, 0.02]} />
        <meshLambertMaterial color="#000" />
      </mesh>
      {/* live video plane */}
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[width, height]} />
        {texture ? (
          <meshBasicMaterial map={texture} toneMapped={false} />
        ) : (
          <meshBasicMaterial color="#1a1a1a" />
        )}
      </mesh>
      {/* small red "REC/LIVE" dot at top-right to suggest playback */}
      <mesh position={[width / 2 - 0.12, height / 2 - 0.12, 0.085]}>
        <boxGeometry args={[0.08, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#ff3a3a"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      {/* halo */}
      {(hovered || glow) && (
        <mesh position={[0, 0, -0.02]}>
          <planeGeometry args={[width + 0.6, height + 0.6]} />
          <meshBasicMaterial
            color={hovered ? "#ffd49a" : "#a78bfa"}
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
 *
 * Cross-section "dollhouse" of the Kariyer.net open office: a tiled floor
 * facing the camera, the back wall split into three vertical bands —
 * left = microservice diagram mural (4 cubes + Kafka message dot looping
 * between them); centre = full-height glass curtain that reveals a
 * Heybeliada-island silhouette in the distance (Stelyum paralel hayatı);
 * right = scrum kanban whiteboard with post-its drifting between TODO →
 * DOING → DONE columns. Atakan's triple-monitor desk sits dead-centre
 * (ATS dashboard with animated bars; Slack notifications with a counter
 * dot; code editor). A small mezzanine balcony juts off the back wall
 * on the right, where a tiny figure works on a laptop = 2020 COVID
 * pivotu. Cool purple lighting, all-business.
 * ========================================================================= */
function EnterpriseDiorama() {
  const accent = ERAS.enterprise.accent; // #a78bfa
  // Animation refs
  const kafkaDotRef = useRef<THREE.Group | null>(null);
  const stickyRefs = useRef<(THREE.Group | null)[]>([]);
  const barRefs = useRef<(THREE.Mesh | null)[]>([]);
  const slackDotRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const slackRowRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const screenRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const laptopRef = useRef<THREE.MeshStandardMaterial | null>(null);

  // Kafka dot path between the 4 microservice cubes (left wall, x: -5..-1.5)
  // Cubes laid out: top-left, top-right, bottom-left, bottom-right.
  const kafkaPath = useMemo(
    () => [
      { x: -4.4, y: 4.0, z: -4.7 },
      { x: -2.2, y: 4.0, z: -4.7 },
      { x: -2.2, y: 2.6, z: -4.7 },
      { x: -4.4, y: 2.6, z: -4.7 },
    ],
    [],
  );

  // Kanban post-it columns (right wall, x: 2..5). Three columns: TODO, DOING,
  // DONE. Each sticky animates a slow drift between columns.
  const kanbanColumns = useMemo(
    () => [
      { x: 2.5 }, // TODO
      { x: 3.5 }, // DOING
      { x: 4.5 }, // DONE
    ],
    [],
  );

  useFrame(() => {
    const t = performance.now() * 0.001;

    // Kafka dot — loop between the 4 cubes
    if (kafkaDotRef.current) {
      const period = 6;
      const f = ((t % period) / period) * kafkaPath.length;
      const i0 = Math.floor(f) % kafkaPath.length;
      const i1 = (i0 + 1) % kafkaPath.length;
      const lerp = f - Math.floor(f);
      const p0 = kafkaPath[i0];
      const p1 = kafkaPath[i1];
      kafkaDotRef.current.position.set(
        p0.x + (p1.x - p0.x) * lerp,
        p0.y + (p1.y - p0.y) * lerp,
        p0.z + (p1.z - p0.z) * lerp,
      );
    }

    // Sticky notes — slow column drift TODO → DOING → DONE → cycle
    stickyRefs.current.forEach((g, i) => {
      if (!g) return;
      const period = 18;
      const offset = i * (period / Math.max(1, stickyRefs.current.length));
      const phase = ((t + offset) % period) / period; // 0..1
      // Three-column drift: 0..0.33 = TODO; 0.33..0.66 = DOING; 0.66..1 = DONE
      let colIdx = 0;
      if (phase < 0.33) colIdx = 0;
      else if (phase < 0.66) colIdx = 1;
      else colIdx = 2;
      const targetX = kanbanColumns[colIdx].x;
      // Smooth lerp toward target
      g.position.x += (targetX - g.position.x) * 0.06;
      // Small bobbing
      g.position.y =
        2.6 + ((i * 0.35) % 1.4) + Math.sin(t * 1.6 + i) * 0.04;
    });

    // ATS dashboard bars — animate each bar's height/color
    barRefs.current.forEach((m, i) => {
      if (!m) return;
      const h = 0.25 + Math.abs(Math.sin(t * 0.8 + i * 0.7)) * 0.55;
      m.scale.y = h;
      m.position.y = 1.6 + (h * 0.4) / 2; // re-anchor so bar grows from baseline
    });

    // Slack notification counter dot pulse
    if (slackDotRef.current) {
      slackDotRef.current.emissiveIntensity =
        Math.sin(t * 4) > 0.5 ? 2.4 : 0.9;
    }
    // Slack rows — staggered fade-in/out to feel like incoming messages
    slackRowRefs.current.forEach((m, i) => {
      if (!m) return;
      const phase = (t * 0.6 + i * 0.5) % 4;
      m.emissiveIntensity = phase < 2.2 ? 0.85 : 0.25;
    });

    // Centre desk screen flicker
    screenRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 0.7 + Math.sin(t * 1.2 + i * 1.4) * 0.1;
    });
    // Laptop on balcony
    if (laptopRef.current) {
      laptopRef.current.emissiveIntensity = 0.9 + Math.sin(t * 3.4) * 0.12;
    }
  });

  return (
    <group>
      {/* ---- Floor: bigger polished tile + faint accent grid running deep ---- */}
      <CheckerFloor
        size={22}
        cellSize={1}
        y={-0.5}
        colorA="#1d1f2a"
        colorB="#171924"
      />
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-9 + i * 3, -0.18, 0]}>
          <boxGeometry args={[0.04, 0.02, 22]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={0.25}
            toneMapped={false}
            transparent
            opacity={0.4}
          />
        </mesh>
      ))}

      {/* ---- Ceiling: wider slab + four fluorescent strips so the bigger
       *      room still reads as interior. Pulled up to y=6.6 to make the
       *      space feel taller. */}
      <mesh position={[0, 6.6, -2.5]}>
        <boxGeometry args={[20, 0.2, 12]} />
        <meshLambertMaterial color="#181a24" />
      </mesh>
      {[-5, -1.6, 1.6, 5].map((x, i) => (
        <mesh key={i} position={[x, 6.45, -2.5]}>
          <boxGeometry args={[0.5, 0.08, 9]} />
          <meshStandardMaterial
            color="#0a0a14"
            emissive="#c4d4ff"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ---- Back wall pushed to z=-7, made wider so it spans the
       *      enlarged room. Bands are unchanged structurally but they
       *      now sit on a 20-unit canvas. */}
      <mesh position={[0, 3.2, -7]} receiveShadow>
        <boxGeometry args={[20, 6.6, 0.18]} />
        <meshLambertMaterial color="#1f2230" />
      </mesh>

      {/* ---- Side walls: short partials so we feel boxed-in but the
       *      camera still sees in. Glass-tinted, lit from below. */}
      {[-10, 10].map((x, i) => (
        <mesh key={i} position={[x, 3.2, -2.5]}>
          <boxGeometry args={[0.18, 6.6, 9]} />
          <meshLambertMaterial color="#1a1d28" />
        </mesh>
      ))}

      {/* ---- Background skyscrapers seen beyond the back wall (z<-7).
       *      Pushed deep so they read as distance through the glass. */}
      <EnterpriseDistantSkyline />

      {/* ---- Left band on back wall: Microservice diagram mural ---- */}
      <MicroserviceMural kafkaDotRef={kafkaDotRef} accent={accent} />

      {/* ---- Centre band: glass curtain wall + Heybeliada silhouette ---- */}
      <CentreGlassWall />
      <HeybeliadaDistant />

      {/* ---- Right band: Kanban whiteboard + drifting stickies ---- */}
      <KanbanBoard stickyRefs={stickyRefs} />

      {/* ---- Atakan's triple-monitor desk (centre foreground) ---- */}
      <AtakanDesk
        accent={accent}
        screenRefs={screenRefs}
        barRefs={barRefs}
        slackDotRef={slackDotRef}
        slackRowRefs={slackRowRefs}
      />

      {/* ---- COVID-pivot mezzanine balcony (back-right outside the glass)
       *      with a tiny figure + open laptop. */}
      <CovidBalcony laptopRef={laptopRef} />

      {/* ---- LEFT: glass-walled meeting room with a big wall TV that
       *      plays the Kariyer.net throwback clip. Click on the TV
       *      opens the clip full-screen in the lightbox. */}
      <Suspense fallback={null}>
        <MeetingRoom accent={accent} />
      </Suspense>

      {/* ---- RIGHT: lounge corner — sofa + "yoğun ofis" video screen
       *      mounted on the right side wall. Click → lightbox. */}
      <Suspense fallback={null}>
        <LoungeCorner accent={accent} />
      </Suspense>

      {/* ---- Trophy / memory wall: framed FIFA Kupa photo on a small
       *      pillar between the meeting room and the microservice
       *      mural. Click → lightbox. */}
      <Suspense fallback={null}>
        <TrophyDisplay />
      </Suspense>

      {/* ---- Small office life ---- */}
      <SideDesk position={[-5.4, 0, 2.0]} accent={accent} />
      <SideDesk position={[5.4, 0, 2.0]} accent={accent} />
      <OfficePlant position={[-7.5, 0, 3.2]} />
      <OfficePlant position={[7.5, 0, 3.2]} />
      <CoffeeCorner position={[-8.6, 0, 0.0]} accent={accent} />

      {/* ---- Overhead ambient + accent point lights spread across the
       *      bigger floor so no zone is left in shadow. */}
      <pointLight position={[0, 5.8, 1]} intensity={0.7} distance={18} color={accent} />
      <pointLight position={[-6, 4, -3]} intensity={0.45} distance={8} color="#c4d4ff" />
      <pointLight position={[6, 4, -3]} intensity={0.45} distance={8} color="#c4d4ff" />
      <pointLight position={[-8, 3, 1]} intensity={0.35} distance={6} color="#ffd49a" />
      <pointLight position={[8, 3, 1]} intensity={0.35} distance={6} color="#ffd49a" />
    </group>
  );
}

/* ----- Enterprise helpers -------------------------------------------- */

function MicroserviceMural({
  kafkaDotRef,
  accent,
}: {
  kafkaDotRef: React.MutableRefObject<THREE.Group | null>;
  accent: string;
}) {
  // 4 service cubes laid out 2×2 on the back wall. Arrows connect them
  // forming a Kafka-flavoured ring. A glowing dot loops around the ring
  // pretending to be a message in flight.
  const cubes: { x: number; y: number; color: string; label: string }[] = [
    { x: -4.4, y: 4.0, color: "#7d8cff", label: "ATS" },
    { x: -2.2, y: 4.0, color: "#ff7a59", label: "MSG" },
    { x: -2.2, y: 2.6, color: "#22aa88", label: "EVT" },
    { x: -4.4, y: 2.6, color: "#caa84a", label: "API" },
  ];
  return (
    <group>
      {/* Mural backplate */}
      <mesh position={[-3.3, 3.3, -4.92]}>
        <boxGeometry args={[3.6, 2.8, 0.04]} />
        <meshLambertMaterial color="#0a0c18" />
      </mesh>
      {/* Header strip */}
      <mesh position={[-3.3, 4.85, -4.9]}>
        <boxGeometry args={[3.4, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph
        position={[-3.3, 4.85, -4.86]}
        text="MICROSERVICES"
        color="#fff5e6"
        scale={0.04}
      />

      {/* Service cubes */}
      {cubes.map((c, i) => (
        <group key={i} position={[c.x, c.y, -4.85]}>
          <mesh>
            <boxGeometry args={[0.7, 0.7, 0.16]} />
            <meshLambertMaterial color="#15182a" />
          </mesh>
          <mesh position={[0, 0, 0.1]}>
            <boxGeometry args={[0.5, 0.5, 0.04]} />
            <meshStandardMaterial
              color="#000"
              emissive={c.color}
              emissiveIntensity={1.2}
              toneMapped={false}
            />
          </mesh>
          <SignGlyph
            position={[0, 0, 0.14]}
            text={c.label}
            color="#fff"
            scale={0.022}
          />
        </group>
      ))}

      {/* Connecting arrows — ring style */}
      {[
        { x: -3.3, y: 4.0, w: 1.6, h: 0.06 }, // top
        { x: -2.2, y: 3.3, w: 0.06, h: 1.0 }, // right
        { x: -3.3, y: 2.6, w: 1.6, h: 0.06 }, // bottom
        { x: -4.4, y: 3.3, w: 0.06, h: 1.0 }, // left
      ].map((b, i) => (
        <mesh key={i} position={[b.x, b.y, -4.83]}>
          <boxGeometry args={[b.w, b.h, 0.02]} />
          <meshStandardMaterial
            color="#1a1f30"
            emissive={accent}
            emissiveIntensity={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Kafka message dot — animated by useFrame in the parent */}
      <group ref={kafkaDotRef} position={[-4.4, 4.0, -4.7]}>
        <mesh>
          <boxGeometry args={[0.18, 0.18, 0.12]} />
          <meshStandardMaterial
            color="#000"
            emissive="#ffffff"
            emissiveIntensity={2.5}
            toneMapped={false}
          />
        </mesh>
        {/* halo */}
        <mesh>
          <boxGeometry args={[0.34, 0.34, 0.08]} />
          <meshBasicMaterial
            color={accent}
            transparent
            opacity={0.4}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function CentreGlassWall() {
  // Floor-to-ceiling glass curtain wall on the centre band of the back
  // wall. Slight emissive tint suggests city/water light beyond.
  return (
    <group position={[0, 3, -4.92]}>
      {/* Outer frame */}
      <mesh>
        <boxGeometry args={[3, 5.6, 0.04]} />
        <meshLambertMaterial color="#0a0c18" />
      </mesh>
      {/* Glass pane */}
      <mesh position={[0, 0, 0.03]}>
        <boxGeometry args={[2.8, 5.4, 0.02]} />
        <meshStandardMaterial
          color="#08122a"
          emissive="#3a8cff"
          emissiveIntensity={0.18}
          toneMapped={false}
          transparent
          opacity={0.85}
        />
      </mesh>
      {/* Vertical mullions */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.05]}>
          <boxGeometry args={[0.04, 5.4, 0.02]} />
          <meshLambertMaterial color="#1a1f30" />
        </mesh>
      ))}
    </group>
  );
}

function HeybeliadaDistant() {
  // Tiny silhouette of Heybeliada (Stelyum paralel hayatı) seen through
  // the centre glass wall. A few hill cubes + one little house with a
  // warm lit window perched on top of the rock + a thin water strip.
  return (
    <group position={[0, 1.5, -9]}>
      {/* Distant deep-blue sea strip */}
      <mesh position={[0, -0.4, 0]}>
        <planeGeometry args={[14, 1.2]} />
        <meshBasicMaterial color="#0a1428" toneMapped={false} />
      </mesh>
      {/* Two tiny lit moonlit wave crests on the sea */}
      <mesh position={[-1.8, -0.35, 0.01]}>
        <boxGeometry args={[1.2, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#1a2848"
          emissive="#a4b8e8"
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[1.5, -0.35, 0.01]}>
        <boxGeometry args={[0.9, 0.04, 0.04]} />
        <meshStandardMaterial
          color="#1a2848"
          emissive="#a4b8e8"
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* Heybeliada island mass — a low hill silhouette */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[2.4, 1.0, 0.4]} />
        <meshLambertMaterial color="#10142a" />
      </mesh>
      <mesh position={[-0.5, 0.6, 0]}>
        <boxGeometry args={[1.6, 0.7, 0.4]} />
        <meshLambertMaterial color="#10142a" />
      </mesh>
      <mesh position={[0.7, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.5, 0.4]} />
        <meshLambertMaterial color="#10142a" />
      </mesh>
      {/* Single tiny house on the hill */}
      <mesh position={[-0.5, 1.1, 0.05]}>
        <boxGeometry args={[0.32, 0.32, 0.18]} />
        <meshLambertMaterial color="#1a1d2a" />
      </mesh>
      {/* Pitched roof */}
      <mesh position={[-0.5, 1.32, 0.05]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.22, 0.22, 0.18]} />
        <meshLambertMaterial color="#2a1818" />
      </mesh>
      {/* Lit window */}
      <mesh position={[-0.5, 1.08, 0.16]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#ffd28a"
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
      {/* Soft sky strip behind */}
      <mesh position={[0, 1.4, -0.1]}>
        <planeGeometry args={[14, 4]} />
        <meshBasicMaterial color="#0c1130" toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.5, -0.09]}>
        <planeGeometry args={[14, 1.4]} />
        <meshBasicMaterial color="#1a2454" toneMapped={false} />
      </mesh>
    </group>
  );
}

function KanbanBoard({
  stickyRefs,
}: {
  stickyRefs: React.MutableRefObject<(THREE.Group | null)[]>;
}) {
  // Whiteboard with three column dividers and a handful of post-its that
  // drift across the board over time. Sits on the right band of the back
  // wall, lit cool.
  const COLS = [
    { x: 2.5, label: "TODO", color: "#ff6a8a" },
    { x: 3.5, label: "DOING", color: "#caa84a" },
    { x: 4.5, label: "DONE", color: "#62ffaa" },
  ];
  const STICKY_COUNT = 6;
  return (
    <group>
      {/* Whiteboard backplate */}
      <mesh position={[3.5, 3.4, -4.92]}>
        <boxGeometry args={[3.6, 2.8, 0.04]} />
        <meshLambertMaterial color="#e8e8ea" />
      </mesh>
      {/* Header strip */}
      <mesh position={[3.5, 4.85, -4.9]}>
        <boxGeometry args={[3.4, 0.32, 0.04]} />
        <meshStandardMaterial
          color="#000"
          emissive="#a78bfa"
          emissiveIntensity={1.3}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph
        position={[3.5, 4.85, -4.86]}
        text="SCRUM BOARD"
        color="#fff5e6"
        scale={0.04}
      />
      {/* Column dividers */}
      {COLS.map((c, i) =>
        i > 0 ? (
          <mesh key={i} position={[c.x - 0.5, 3.4, -4.89]}>
            <boxGeometry args={[0.04, 2.4, 0.02]} />
            <meshLambertMaterial color="#9a9ca6" />
          </mesh>
        ) : null,
      )}
      {/* Column headers */}
      {COLS.map((c, i) => (
        <group key={i}>
          <mesh position={[c.x, 4.45, -4.88]}>
            <boxGeometry args={[0.9, 0.2, 0.02]} />
            <meshStandardMaterial
              color="#000"
              emissive={c.color}
              emissiveIntensity={1.0}
              toneMapped={false}
            />
          </mesh>
          <SignGlyph
            position={[c.x, 4.45, -4.85]}
            text={c.label}
            color="#fff"
            scale={0.022}
          />
        </group>
      ))}

      {/* Post-it stickies (animated by useFrame) */}
      {Array.from({ length: STICKY_COUNT }).map((_, i) => (
        <group
          key={i}
          ref={(el) => {
            stickyRefs.current[i] = el;
          }}
          position={[2.5, 2.6 + ((i * 0.35) % 1.4), -4.86]}
        >
          <mesh>
            <boxGeometry args={[0.42, 0.28, 0.04]} />
            <meshLambertMaterial
              color={
                ["#ffd86a", "#ff9a6a", "#aaffba", "#9ad4ff", "#ffd86a", "#ff9a6a"][i % 6]
              }
            />
          </mesh>
          {/* tiny scribble bars on the post-it */}
          {[0.06, 0, -0.06].map((dy, j) => (
            <mesh key={j} position={[0, dy, 0.025]}>
              <boxGeometry args={[0.26, 0.02, 0.01]} />
              <meshLambertMaterial color="#3a2418" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function AtakanDesk({
  accent,
  screenRefs,
  barRefs,
  slackDotRef,
  slackRowRefs,
}: {
  accent: string;
  screenRefs: React.MutableRefObject<(THREE.MeshStandardMaterial | null)[]>;
  barRefs: React.MutableRefObject<(THREE.Mesh | null)[]>;
  slackDotRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
  slackRowRefs: React.MutableRefObject<(THREE.MeshStandardMaterial | null)[]>;
}) {
  return (
    <group position={[0, 0, 0.4]}>
      {/* Desk surface */}
      <mesh position={[0, 1.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 0.18, 2.4]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      {/* Edge accent */}
      <mesh position={[0, 1.36, 1.18]}>
        <boxGeometry args={[5, 0.04, 0.04]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.7}
          toneMapped={false}
        />
      </mesh>
      {/* Legs */}
      {([
        [-2.3, 0.6, 1.05],
        [2.3, 0.6, 1.05],
        [-2.3, 0.6, -1.05],
        [2.3, 0.6, -1.05],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.18, 1.2, 0.18]} />
          <meshLambertMaterial color="#1a1d28" />
        </mesh>
      ))}

      {/* LEFT monitor — ATS Dashboard with animated bars */}
      <group position={[-1.7, 2.45, -0.4]} rotation={[0, 0.18, 0]}>
        {/* bezel */}
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.05, 0.14]} />
          <meshLambertMaterial color="#0a0b14" />
        </mesh>
        {/* screen */}
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[1.48, 0.92, 0.04]} />
          <meshStandardMaterial
            ref={(el) => {
              screenRefs.current[0] = el;
            }}
            color="#0a1430"
            emissive={accent}
            emissiveIntensity={0.7}
            toneMapped={false}
          />
        </mesh>
        {/* Header */}
        <mesh position={[0, 0.38, 0.11]}>
          <boxGeometry args={[1.3, 0.08, 0.01]} />
          <meshStandardMaterial
            color="#000"
            emissive="#fff"
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
        {/* Animated bar chart */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => {
              barRefs.current[i] = el;
            }}
            position={[-0.55 + i * 0.22, 0, 0.12]}
          >
            <boxGeometry args={[0.14, 0.4, 0.02]} />
            <meshStandardMaterial
              color="#000"
              emissive={
                i % 3 === 0 ? "#62ffaa" : i % 3 === 1 ? accent : "#ff7a59"
              }
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}
        {/* baseline */}
        <mesh position={[0, -0.25, 0.11]}>
          <boxGeometry args={[1.3, 0.02, 0.01]} />
          <meshLambertMaterial color="#5a5d6e" />
        </mesh>
        {/* stand */}
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.35, 0.4, 0.14]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
        <mesh position={[0, -0.96, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.4]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>

      {/* CENTRE monitor — code editor */}
      <group position={[0, 2.45, -0.5]}>
        <mesh castShadow>
          <boxGeometry args={[1.8, 1.15, 0.14]} />
          <meshLambertMaterial color="#0a0b14" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[1.66, 1.02, 0.04]} />
          <meshStandardMaterial
            ref={(el) => {
              screenRefs.current[1] = el;
            }}
            color="#0e0f1c"
            emissive={accent}
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
        {/* code lines */}
        {Array.from({ length: 7 }).map((_, j) => (
          <mesh
            key={j}
            position={[
              -0.55 + (j % 3) * 0.4,
              0.36 - j * 0.13,
              0.11,
            ]}
          >
            <boxGeometry
              args={[0.35 + ((j * 0.13) % 0.9), 0.04, 0.01]}
            />
            <meshStandardMaterial
              color="#000"
              emissive={j % 3 === 0 ? accent : "#fff"}
              emissiveIntensity={1.3}
              toneMapped={false}
              transparent
              opacity={0.9}
            />
          </mesh>
        ))}
        <mesh position={[0, -0.78, 0]}>
          <boxGeometry args={[0.38, 0.42, 0.14]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
        <mesh position={[0, -1.08, 0]}>
          <boxGeometry args={[0.9, 0.08, 0.45]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>

      {/* RIGHT monitor — Slack notifications */}
      <group position={[1.7, 2.45, -0.4]} rotation={[0, -0.18, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.6, 1.05, 0.14]} />
          <meshLambertMaterial color="#0a0b14" />
        </mesh>
        <mesh position={[0, 0, 0.08]}>
          <boxGeometry args={[1.48, 0.92, 0.04]} />
          <meshStandardMaterial
            ref={(el) => {
              screenRefs.current[2] = el;
            }}
            color="#1a0a14"
            emissive="#7a2a4a"
            emissiveIntensity={0.55}
            toneMapped={false}
          />
        </mesh>
        {/* Header */}
        <mesh position={[0, 0.38, 0.11]}>
          <boxGeometry args={[1.3, 0.08, 0.01]} />
          <meshStandardMaterial
            color="#000"
            emissive="#fff"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
        {/* Notification rows */}
        {Array.from({ length: 4 }).map((_, i) => (
          <group key={i} position={[0, 0.18 - i * 0.18, 0.11]}>
            {/* avatar dot */}
            <mesh position={[-0.6, 0, 0]}>
              <boxGeometry args={[0.08, 0.08, 0.02]} />
              <meshStandardMaterial
                color="#000"
                emissive={["#62ffaa", "#caa84a", "#ff7a59", "#7d8cff"][i]}
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
            {/* text bar */}
            <mesh position={[0.05, 0, 0]}>
              <boxGeometry args={[1.0, 0.06, 0.02]} />
              <meshStandardMaterial
                ref={(el) => {
                  slackRowRefs.current[i] = el;
                }}
                color="#000"
                emissive="#fff"
                emissiveIntensity={0.85}
                toneMapped={false}
              />
            </mesh>
          </group>
        ))}
        {/* Notification badge */}
        <mesh position={[0.62, 0.4, 0.13]}>
          <boxGeometry args={[0.16, 0.16, 0.02]} />
          <meshStandardMaterial
            ref={slackDotRef}
            color="#000"
            emissive="#ff3050"
            emissiveIntensity={2.2}
            toneMapped={false}
          />
        </mesh>
        {/* stand */}
        <mesh position={[0, -0.7, 0]}>
          <boxGeometry args={[0.35, 0.4, 0.14]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
        <mesh position={[0, -0.96, 0]}>
          <boxGeometry args={[0.8, 0.08, 0.4]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>

      {/* Keyboard + RGB glow */}
      <mesh position={[0, 1.46, 0.55]} castShadow>
        <boxGeometry args={[1.9, 0.14, 0.7]} />
        <meshLambertMaterial color="#15171f" />
      </mesh>
      <mesh position={[0, 1.4, 0.55]}>
        <boxGeometry args={[1.88, 0.02, 0.68]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>

      {/* Office chair (front of desk) */}
      <group position={[0, 0, 2.0]}>
        <mesh position={[0, 0.95, 0]} castShadow>
          <boxGeometry args={[1.3, 0.18, 1.1]} />
          <meshLambertMaterial color="#15171f" />
        </mesh>
        <mesh position={[0, 1.8, 0.46]} castShadow>
          <boxGeometry args={[1.3, 1.5, 0.16]} />
          <meshLambertMaterial color="#1a1c26" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.7, 6]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>
    </group>
  );
}

function CovidBalcony({
  laptopRef,
}: {
  laptopRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
  // Small balcony platform jutting out from behind the back glass on the
  // right side, raised on a slim column so it reads as a mezzanine. A
  // tiny seated figure works on a laptop = pandemic-pivot moment.
  return (
    <group position={[3.6, 0, -7]}>
      {/* Support column */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <boxGeometry args={[0.4, 4.4, 0.4]} />
        <meshLambertMaterial color="#15182a" />
      </mesh>
      {/* Balcony platform */}
      <mesh position={[0.4, 4.3, 0.3]} castShadow>
        <boxGeometry args={[2.2, 0.16, 1.6]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      {/* Glass railing — three transparent slabs */}
      {([
        [0.4, 4.7, 1.1, 2.2, 0.6, 0.02],
        [-0.7, 4.7, 0.3, 0.02, 0.6, 1.6],
        [1.5, 4.7, 0.3, 0.02, 0.6, 1.6],
      ] as [number, number, number, number, number, number][]).map((b, i) => (
        <mesh key={i} position={[b[0], b[1], b[2]]}>
          <boxGeometry args={[b[3], b[4], b[5]]} />
          <meshStandardMaterial
            color="#1a2a40"
            emissive="#7d8cff"
            emissiveIntensity={0.25}
            toneMapped={false}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
      {/* Railing top rail */}
      <mesh position={[0.4, 5.05, 1.1]}>
        <boxGeometry args={[2.3, 0.05, 0.05]} />
        <meshLambertMaterial color="#3a3a48" />
      </mesh>

      {/* Tiny voxel figure — Atakan sitting cross-legged with a laptop.
       *  Kept very small to read as a distant detail. */}
      <group position={[0.3, 4.45, 0.4]}>
        {/* legs */}
        <mesh position={[0, 0.15, 0]}>
          <boxGeometry args={[0.32, 0.16, 0.4]} />
          <meshLambertMaterial color="#1a1f30" />
        </mesh>
        {/* torso */}
        <mesh position={[0, 0.4, -0.1]}>
          <boxGeometry args={[0.32, 0.34, 0.2]} />
          <meshLambertMaterial color="#3a4a5a" />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.7, -0.1]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshLambertMaterial color="#d8b48a" />
        </mesh>
        {/* hair cap */}
        <mesh position={[0, 0.82, -0.1]}>
          <boxGeometry args={[0.24, 0.06, 0.24]} />
          <meshLambertMaterial color="#2a1810" />
        </mesh>
        {/* laptop on legs */}
        <mesh position={[0, 0.28, 0.18]}>
          <boxGeometry args={[0.3, 0.04, 0.22]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
        {/* laptop screen */}
        <mesh position={[0, 0.42, 0.08]} rotation={[-Math.PI / 2.6, 0, 0]}>
          <boxGeometry args={[0.3, 0.22, 0.02]} />
          <meshStandardMaterial
            ref={laptopRef}
            color="#000"
            emissive="#7d8cff"
            emissiveIntensity={1.1}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Tiny "EVDEN" sign hanging on the railing */}
      <mesh position={[0.4, 4.55, 1.1]}>
        <boxGeometry args={[0.8, 0.18, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#a78bfa"
          emissiveIntensity={1.0}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph
        position={[0.4, 4.55, 1.13]}
        text="EVDEN"
        color="#fff5e6"
        scale={0.024}
      />
    </group>
  );
}

function SideDesk({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  // A second, smaller desk to the side — empty (suggests a teammate's
  // workstation). Adds depth without crowding.
  return (
    <group position={position}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[2, 0.16, 1.2]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      <mesh position={[0, 1.3, 0.6]}>
        <boxGeometry args={[2, 0.04, 0.04]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {([
        [-0.85, 0.6, 0.5],
        [0.85, 0.6, 0.5],
        [-0.85, 0.6, -0.5],
        [0.85, 0.6, -0.5],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.14, 1.2, 0.14]} />
          <meshLambertMaterial color="#1a1d28" />
        </mesh>
      ))}
      {/* idle monitor */}
      <group position={[0, 2.3, -0.4]} rotation={[0, 0.2, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.1, 0.78, 0.12]} />
          <meshLambertMaterial color="#0a0b14" />
        </mesh>
        <mesh position={[0, 0, 0.07]}>
          <boxGeometry args={[1.0, 0.68, 0.04]} />
          <meshStandardMaterial
            color="#0a1024"
            emissive={accent}
            emissiveIntensity={0.25}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, -0.6, 0]}>
          <boxGeometry args={[0.6, 0.08, 0.3]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>
      {/* chair */}
      <group position={[0, 0, 1.8]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[1.0, 0.14, 0.9]} />
          <meshLambertMaterial color="#15171f" />
        </mesh>
        <mesh position={[0, 1.6, 0.4]} castShadow>
          <boxGeometry args={[1.0, 1.2, 0.12]} />
          <meshLambertMaterial color="#1a1c26" />
        </mesh>
      </group>
    </group>
  );
}

function CoffeeCorner({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  // A tall espresso/water station against the right wall. Tiny detail
  // that makes the floor read as "open office" rather than "cubicle".
  return (
    <group position={position}>
      {/* Cabinet */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.2, 1.2, 0.7]} />
        <meshLambertMaterial color="#1a1d28" />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[1.24, 0.06, 0.74]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      {/* Coffee machine */}
      <mesh position={[-0.3, 1.55, 0]} castShadow>
        <boxGeometry args={[0.46, 0.5, 0.42]} />
        <meshLambertMaterial color="#15171f" />
      </mesh>
      <mesh position={[-0.3, 1.45, 0.22]}>
        <boxGeometry args={[0.3, 0.06, 0.04]} />
        <meshStandardMaterial color="#000" emissive={accent} emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* Water bottle */}
      <mesh position={[0.35, 1.6, 0]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial
          color="#aac4d6"
          emissive="#aac4d6"
          emissiveIntensity={0.25}
          transparent
          opacity={0.6}
          toneMapped={false}
        />
      </mesh>
      {/* Mug stack */}
      <mesh position={[0.36, 1.34, 0.25]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.1, 8]} />
        <meshLambertMaterial color="#caa84a" />
      </mesh>
    </group>
  );
}

function OfficePlant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.55, 0.5, 0.55]} />
        <meshLambertMaterial color="#3a2a1a" />
      </mesh>
      {([
        [0, 1.0, 0],
        [-0.2, 0.85, 0.15],
        [0.2, 0.8, -0.15],
        [0, 1.3, 0.12],
      ] as [number, number, number][]).map((p, i) => (
        <mesh
          key={i}
          position={p}
          rotation={[0, i * 0.7, 0.1 * (i % 2 === 0 ? 1 : -1)]}
          castShadow
        >
          <boxGeometry args={[0.4, 0.42, 0.4]} />
          <meshLambertMaterial color={["#2a6a4a", "#3a8a5a", "#1a5a3a"][i % 3]} />
        </mesh>
      ))}
    </group>
  );
}

/* ----- Bigger-room helpers --------------------------------------------- */

function EnterpriseDistantSkyline() {
  // Big-city silhouette pushed deep beyond the back wall — read through
  // the centre glass curtain wall as a sense of "Istanbul outside."
  // Far row is ~14 units behind the back wall (z ≈ -21).
  type T = { x: number; w: number; h: number; emissive?: boolean };
  const towers: T[] = [
    { x: -10, w: 2.4, h: 9, emissive: true },
    { x: -7, w: 1.8, h: 13 },
    { x: -4, w: 2.2, h: 11, emissive: true },
    { x: -1, w: 2.4, h: 16 },
    { x: 2.4, w: 1.8, h: 12, emissive: true },
    { x: 5, w: 2.6, h: 14 },
    { x: 8.4, w: 2, h: 10, emissive: true },
  ];
  return (
    <group position={[0, 0, -18]}>
      {/* hazy backdrop strip behind the towers */}
      <mesh position={[0, 6, -0.4]}>
        <planeGeometry args={[40, 18]} />
        <meshBasicMaterial color="#0a1228" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1, -0.3]}>
        <planeGeometry args={[40, 4]} />
        <meshBasicMaterial color="#1a2454" toneMapped={false} />
      </mesh>
      {towers.map((t, i) => (
        <group key={i} position={[t.x, 0, 0]}>
          <mesh position={[0, t.h / 2, 0]}>
            <boxGeometry args={[t.w, t.h, 2]} />
            <meshLambertMaterial color="#10142a" />
          </mesh>
          {/* lit windows grid */}
          {Array.from({ length: Math.min(6, Math.floor(t.h / 2)) }).map(
            (_, r) => (
              <group key={r}>
                {Array.from({ length: 2 }).map((_, c) => (
                  <mesh
                    key={c}
                    position={[
                      -t.w / 4 + c * (t.w / 2),
                      1.0 + r * 1.7,
                      1.02,
                    ]}
                  >
                    <boxGeometry args={[t.w * 0.18, 0.5, 0.02]} />
                    <meshStandardMaterial
                      color="#1a1a1e"
                      emissive={
                        t.emissive && (r + c + i) % 3 === 0
                          ? "#ffd28a"
                          : "#7d8cff"
                      }
                      emissiveIntensity={
                        t.emissive && (r + c + i) % 3 === 0 ? 0.7 : 0.3
                      }
                      toneMapped={false}
                    />
                  </mesh>
                ))}
              </group>
            ),
          )}
          {/* aircraft warning light on tallest towers */}
          {t.h > 13 && (
            <mesh position={[0, t.h + 0.18, 0]}>
              <boxGeometry args={[0.14, 0.14, 0.14]} />
              <meshStandardMaterial
                color="#000"
                emissive="#ff2a2a"
                emissiveIntensity={1.6}
                toneMapped={false}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

function MeetingRoom({ accent }: { accent: string }) {
  // Glass-walled meeting room on the far left. Inside: long table + 4
  // chairs + a giant wall-mounted TV that plays the Kariyer.net throwback
  // clip. The TV is clickable and routes to the lightbox.
  return (
    <group position={[-7.5, 0, -4.5]}>
      {/* Glass front wall (facing camera) */}
      <mesh position={[1.2, 2.2, 1.8]}>
        <boxGeometry args={[4.4, 4.4, 0.04]} />
        <meshStandardMaterial
          color="#0e1830"
          emissive="#3a8cff"
          emissiveIntensity={0.18}
          toneMapped={false}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Glass side wall (right side, dividing from open floor) */}
      <mesh position={[3.4, 2.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3.4, 4.4, 0.04]} />
        <meshStandardMaterial
          color="#0e1830"
          emissive="#3a8cff"
          emissiveIntensity={0.16}
          toneMapped={false}
          transparent
          opacity={0.6}
        />
      </mesh>
      {/* Mullions on glass walls */}
      {[-1, 0, 1].map((x, i) => (
        <mesh key={i} position={[1.2 + x * 1.4, 2.2, 1.83]}>
          <boxGeometry args={[0.04, 4.4, 0.02]} />
          <meshLambertMaterial color="#1a1f30" />
        </mesh>
      ))}
      {/* Frame at top */}
      <mesh position={[1.2, 4.4, 1.8]}>
        <boxGeometry args={[4.6, 0.18, 0.18]} />
        <meshLambertMaterial color="#15182a" />
      </mesh>
      {/* Door cutout glow strip */}
      <mesh position={[3.0, 1.0, 1.83]}>
        <boxGeometry args={[0.8, 2, 0.02]} />
        <meshStandardMaterial
          color="#0a0e1a"
          emissive={accent}
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>

      {/* Meeting room TV — wall-mounted, plays kariyer-web.mp4 */}
      <VideoScreen
        position={[1.2, 2.6, -0.2]}
        src="/assets/kariyer-web.mp4"
        width={2.6}
        height={1.6}
        frameColor="#0a0a14"
        glow
        caption={{
          tr: "Kariyer.net · ofiste bir an",
          en: "Kariyer.net · a moment in the office",
        }}
      />

      {/* Long meeting table */}
      <mesh position={[1.2, 1.0, 0.7]} castShadow>
        <boxGeometry args={[3.2, 0.12, 1.0]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      {/* table center accent strip */}
      <mesh position={[1.2, 1.08, 0.7]}>
        <boxGeometry args={[3.0, 0.02, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {/* table legs */}
      {([
        [-0.2, 0.45, 0.3],
        [2.6, 0.45, 0.3],
        [-0.2, 0.45, 1.1],
        [2.6, 0.45, 1.1],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.12, 1.0, 0.12]} />
          <meshLambertMaterial color="#15182a" />
        </mesh>
      ))}

      {/* 4 chairs around the table */}
      {([
        [0.4, 0, 1.55, 0],
        [2.0, 0, 1.55, 0],
        [0.4, 0, -0.05, Math.PI],
        [2.0, 0, -0.05, Math.PI],
      ] as [number, number, number, number][]).map((c, i) => (
        <group key={i} position={[c[0], c[1], c[2]]} rotation={[0, c[3], 0]}>
          <mesh position={[0, 0.7, 0]}>
            <boxGeometry args={[0.7, 0.12, 0.6]} />
            <meshLambertMaterial color="#15171f" />
          </mesh>
          <mesh position={[0, 1.3, 0.25]}>
            <boxGeometry args={[0.7, 1.1, 0.1]} />
            <meshLambertMaterial color="#1a1c26" />
          </mesh>
        </group>
      ))}

      {/* Small "MEETING" sign above the door */}
      <mesh position={[3.0, 3.4, 1.84]}>
        <boxGeometry args={[1.0, 0.22, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={1.2}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[3.0, 3.4, 1.86]} text="MEETING" color="#fff" scale={0.024} />
    </group>
  );
}

function LoungeCorner({ accent }: { accent: string }) {
  // Right-foreground lounge: sofa + small coffee table + a side TV
  // mounted on the right wall that plays the "yoğun ofis" clip.
  return (
    <group position={[7.6, 0, 1.0]}>
      {/* Sofa base */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[2.6, 0.5, 0.9]} />
        <meshLambertMaterial color="#3a3d4a" />
      </mesh>
      {/* Sofa back */}
      <mesh position={[0, 1.0, -0.4]} castShadow>
        <boxGeometry args={[2.6, 0.9, 0.18]} />
        <meshLambertMaterial color="#3a3d4a" />
      </mesh>
      {/* Sofa armrests */}
      {[-1.4, 1.4].map((x, i) => (
        <mesh key={i} position={[x, 0.75, 0]}>
          <boxGeometry args={[0.18, 0.7, 0.9]} />
          <meshLambertMaterial color="#2a2d38" />
        </mesh>
      ))}
      {/* 3 cushions */}
      {[-0.9, 0, 0.9].map((x, i) => (
        <mesh key={i} position={[x, 0.72, 0.04]}>
          <boxGeometry args={[0.78, 0.18, 0.7]} />
          <meshLambertMaterial color={["#4a4e5c", "#3a3d4a", "#4a4e5c"][i]} />
        </mesh>
      ))}

      {/* Small coffee table in front of the sofa */}
      <mesh position={[0, 0.4, 1.0]} castShadow>
        <boxGeometry args={[1.4, 0.08, 0.7]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      <mesh position={[0, 0.2, 1.0]}>
        <boxGeometry args={[1.2, 0.4, 0.5]} />
        <meshLambertMaterial color="#15182a" />
      </mesh>
      {/* Magazine + mug on table */}
      <mesh position={[-0.4, 0.46, 1.0]}>
        <boxGeometry args={[0.4, 0.04, 0.5]} />
        <meshLambertMaterial color="#caa84a" />
      </mesh>
      <mesh position={[0.4, 0.5, 1.0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 8]} />
        <meshLambertMaterial color="#9b3a2a" />
      </mesh>

      {/* Wall-mounted lounge TV with "yoğun ofis" clip */}
      <VideoScreen
        position={[2.0, 2.6, -0.6]}
        rotationY={-Math.PI / 2}
        src="/assets/yogun-web.mp4"
        width={1.8}
        height={1.1}
        frameColor="#0a0a14"
        glow
        caption={{
          tr: "Yoğun ofis — bir gün",
          en: "Busy office — a day in the life",
        }}
      />

      {/* "LOUNGE" sign tucked above sofa */}
      <mesh position={[0, 2.2, -0.55]}>
        <boxGeometry args={[1.2, 0.22, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive={accent}
          emissiveIntensity={1.0}
          toneMapped={false}
        />
      </mesh>
      <SignGlyph position={[0, 2.2, -0.52]} text="LOUNGE" color="#fff" scale={0.024} />
    </group>
  );
}

function TrophyDisplay() {
  // Small pillar with a framed FIFA Kupa photo and a tiny voxel trophy
  // beneath it. Sits between the meeting room and the microservice mural.
  return (
    <group position={[-5.4, 0, -2.0]}>
      {/* pillar */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[0.5, 2.8, 0.5]} />
        <meshLambertMaterial color="#2a2d3a" />
      </mesh>
      <mesh position={[0, 2.85, 0]}>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <meshLambertMaterial color="#1a1c26" />
      </mesh>
      {/* Tiny voxel trophy on the pillar */}
      <group position={[0, 3.05, 0]}>
        {/* cup body */}
        <mesh>
          <boxGeometry args={[0.22, 0.26, 0.22]} />
          <meshStandardMaterial
            color="#caa84a"
            emissive="#caa84a"
            emissiveIntensity={0.6}
            toneMapped={false}
          />
        </mesh>
        {/* base */}
        <mesh position={[0, -0.18, 0]}>
          <boxGeometry args={[0.3, 0.06, 0.3]} />
          <meshLambertMaterial color="#3a2a18" />
        </mesh>
        {/* handles */}
        <mesh position={[-0.16, 0, 0]}>
          <boxGeometry args={[0.06, 0.16, 0.06]} />
          <meshStandardMaterial color="#caa84a" emissive="#caa84a" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
        <mesh position={[0.16, 0, 0]}>
          <boxGeometry args={[0.06, 0.16, 0.06]} />
          <meshStandardMaterial color="#caa84a" emissive="#caa84a" emissiveIntensity={0.5} toneMapped={false} />
        </mesh>
      </group>
      {/* Framed FIFA photo mounted higher on the wall behind the pillar */}
      <FramedPhoto
        position={[0, 4.3, -0.25]}
        src="/assets/fifa_kupa-tex.jpg"
        width={1.4}
        height={1.05}
        frameColor="#2a2d3a"
        matColor="#dcdaca"
        glow
        caption={{
          tr: "Ofis FIFA turnuvası kupası — ekip anısı",
          en: "Office FIFA tournament trophy — team memory",
        }}
      />
    </group>
  );
}

/* =========================================================================
 * DriftDiorama — Geçiş era (2022-2025).
 *
 * "Açık yol yolculuğu" composition: a coastal road runs across the
 * scene; Atakan's modern white Sprinter is parked at a scenic camp
 * spot just off the road. A small Vespa-style scooter loops along the
 * road as the only moving vehicle. The beach is white sand with palms
 * and a Bali bamboo umbrella + rattan swing. Between two palms a tiny
 * Atakan figure lies in a hammock with an open laptop = Debite remote
 * life. A bonfire burns next to the camp; a surfboard leans on the
 * caravan side; a bicycle is parked behind it. The sea catches a
 * pink-orange golden-hour reflection; a Thai temple silhouette and
 * mountains rise in the far distance; two lotus lanterns float on
 * the water. On the far right, Heybeliada island sits with a small
 * wooden pier + a tied kayak + a clickable mini screen that plays
 * heybeliada-web.mp4. Inside the open side door of the caravan,
 * karavan-web.mp4 glows like a TV — also clickable.
 * ========================================================================= */
function DriftDiorama() {
  const accent = ERAS.drift.accent; // #f472b6 hot pink
  // Animated refs
  const fireRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const planeRef = useRef<THREE.Group | null>(null);
  const hammockFigureRef = useRef<THREE.Group | null>(null);
  const laptopRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const waveRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lanternRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const boatRef = useRef<THREE.Group | null>(null);
  const fishingBoatRef = useRef<THREE.Group | null>(null);

  useFrame(() => {
    const t = performance.now() * 0.001;
    // Bonfire flicker
    fireRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 1.4 + Math.sin(t * 6 + i) * 0.45;
    });
    // Airplane loop high in the sky — passes from over Heybeliada (right)
    // toward the SE Asia mountains (back-left), then loops behind the sky.
    if (planeRef.current) {
      const period = 22;
      const f = (t % period) / period;
      // S-curve trajectory: starts right-near, sweeps to back-left, then
      // wraps. Slight vertical wobble.
      const x = 9 - f * 18; // 9 → -9
      const z = -6 - Math.sin(f * Math.PI) * 4; // arcs from -6 to -10 to -6
      const y = 7.5 + Math.sin(f * Math.PI * 2) * 0.4;
      planeRef.current.position.set(x, y, z);
      // face direction of motion (mostly -X, with slight Z drift)
      planeRef.current.rotation.y = Math.PI / 2 + Math.sin(f * Math.PI) * 0.2;
      // gentle bank
      planeRef.current.rotation.z = Math.sin(f * Math.PI * 2) * 0.1;
    }
    // Hammock bob
    if (hammockFigureRef.current) {
      hammockFigureRef.current.position.y = 1.45 + Math.sin(t * 1.4) * 0.04;
      hammockFigureRef.current.rotation.z = Math.sin(t * 1.2) * 0.02;
    }
    // Laptop screen pulse
    if (laptopRef.current) {
      laptopRef.current.emissiveIntensity = 0.85 + Math.sin(t * 3) * 0.08;
    }
    // Wave crests shimmer
    waveRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 0.4 + Math.sin(t * 1.6 + i * 0.4) * 0.25;
    });
    // Lotus lanterns gently breathe
    lanternRefs.current.forEach((m, i) => {
      if (!m) return;
      m.emissiveIntensity = 1.3 + Math.sin(t * 1.0 + i * 0.6) * 0.2;
    });
    // Boat at Heybeliada pier bobs slowly
    if (boatRef.current) {
      boatRef.current.position.y = -0.18 + Math.sin(t * 1.1) * 0.04;
      boatRef.current.rotation.z = Math.sin(t * 0.9) * 0.03;
    }
    // Fishing boat drifting across the open sea
    if (fishingBoatRef.current) {
      const speed = 0.18;
      const span = 18;
      const x = ((t * speed) % span) - span / 2;
      fishingBoatRef.current.position.set(x, -0.2 + Math.sin(t * 1.3) * 0.05, -6.5);
      fishingBoatRef.current.rotation.y = Math.PI; // facing +Z (toward camera)
      fishingBoatRef.current.rotation.z = Math.sin(t * 1.0) * 0.025;
    }
  });

  return (
    <group>
      {/* Golden-hour sky + far horizon */}
      <DriftSky />

      {/* Far horizon: Thai temple silhouette + jungle/mountains + lotus
       *  reflection — sits deep behind the sea (z ≈ -14). */}
      <DriftHorizon />

      {/* Sea ribbon (z ≈ -7..-3): pink-orange reflection band with crests */}
      <DriftSea waveRefs={waveRefs} />

      {/* Lotus lanterns floating on the sea */}
      <LotusLantern position={[-2.4, -0.42, -5.5]} lanternRef={(el) => { lanternRefs.current[0] = el; }} />
      <LotusLantern position={[1.4, -0.42, -6.2]} lanternRef={(el) => { lanternRefs.current[1] = el; }} />
      <LotusLantern position={[3.2, -0.42, -4.6]} lanternRef={(el) => { lanternRefs.current[2] = el; }} />

      {/* Heybeliada island on the right + small pier + boat + click video */}
      <Suspense fallback={null}>
        <HeybeliadaIsland boatRef={boatRef} />
      </Suspense>

      {/* Beach sand — only a narrow foreground strip so the era's floor
       *  doesn't bleed under the road, sea and Heybeliada. */}
      <BeachSand />
      {/* Damp / wet sand strip just before the water — also narrow */}
      <mesh position={[0, -0.46, -2.2]}>
        <boxGeometry args={[24, 0.06, 1.4]} />
        <meshLambertMaterial color="#b8a884" />
      </mesh>

      {/* No road — the camp sits right on the beach; the asphalt strip
       *  used to fragment the era visually and the scooter is gone too.
       *  Sand → wet sand → sea is one uninterrupted shore. */}

      {/* ----- 3 zones along X — clean, non-overlapping boxes -----
       *
       *   LEFT  (x ≈ -10..-3) : caravan camp
       *   CENTER (x ≈ -2..+5) : Bali umbrella + hammock + palms
       *   RIGHT (x ≈ +6..+12) : Heybeliada island (rendered separately
       *                         in HeybeliadaIsland above)
       *
       * All foreground objects sit on the camp side of the road (z>0).
       */}

      {/* LEFT — caravan camp */}
      <Suspense fallback={null}>
        <SprinterCaravan position={[-6.5, 0, 0.4]} accent={accent} />
      </Suspense>
      <Surfboard position={[-9.6, 0, 0.6]} accent={accent} />
      <DriftBicycle position={[-9.8, 0, -0.6]} />
      <Bonfire fireRefs={fireRefs} position={[-3.8, -0.3, 2.4]} />
      <DriftPalm position={[-2.4, 0, 0.4]} variant={1} />

      {/* CENTER — beach lounge */}
      <Hammock
        position={[1.2, 0, 1.4]}
        figureRef={hammockFigureRef}
        laptopRef={laptopRef}
      />
      <BaliCorner position={[3.8, 0, 2.4]} />

      {/* RIGHT — Heybeliada island is positioned internally inside
       *  HeybeliadaIsland (x ≈ +8, z ≈ -5). */}

      {/* ----- Narrative bridges: tie the three zones into ONE camp -----
       * Festoon lights string from the caravan's roof to the palm to the
       * Bali umbrella so the eye follows the path through the whole camp.
       * A guitar leans on the caravan side — Atakan's road companion. */}

      {/* Festoon: caravan top → camp palm top */}
      <FestoonLights
        from={[-4.0, 3.2, 0.6]}
        to={[-2.4, 3.6, 0.4]}
        segments={6}
        sag={0.25}
      />
      {/* Festoon: palm → hammock right post → Bali umbrella */}
      <FestoonLights
        from={[-2.4, 3.6, 0.4]}
        to={[1.2 + 1.6, 2.4, 1.4]}
        segments={6}
        sag={0.2}
      />
      <FestoonLights
        from={[1.2 + 1.6, 2.4, 1.4]}
        to={[3.8, 3.4, 2.4]}
        segments={5}
        sag={0.18}
      />

      {/* Guitar leaning on caravan back-right corner */}
      <Guitar position={[-3.6, 0.5, 1.2]} rotation={[0, -0.5, 0.4]} />

      {/* Plane looping between Heybeliada and the SE Asia horizon —
       *  the sky's only moving thing now that the road is gone. */}
      <group ref={planeRef}>
        <Airplane accent={accent} />
      </group>

      {/* Camp life — small props that make the scene feel lived in */}
      <CampingChair position={[-4.6, 0, 3.4]} accent={accent} />
      <Cooler position={[-5.6, 0, 2.4]} />
      <BeachTowel position={[0.0, -0.49, 3.0]} />
      <DriftLaundryLine />
      <FirewoodStack position={[-3.0, 0, 3.0]} />
      <BackpackOpen position={[3.6, 0, 3.4]} />

      {/* Beach finds + driftwood */}
      <DriftSeashells />
      <DriftPiece position={[6.4, -0.4, 3.0]} rotation={[0, 0.3, 0.04]} />
      <DriftPiece position={[-7.5, -0.4, 3.6]} rotation={[0, -0.9, -0.06]} length={1.2} />

      {/* More distant sea life — sailboats further out + a tiny fishing
       *  caïque between the camp and Heybeliada. */}
      <DistantSailboats />
      <group ref={fishingBoatRef}>
        <FishingBoat />
      </group>

      {/* Sunset glow filler */}
      <pointLight position={[0, 3, -8]} intensity={1.4} distance={28} color="#ff8a4a" />
      <pointLight position={[-5, 1.5, 0]} intensity={0.6} distance={9} color="#ff7050" />
      <pointLight position={[8, 1.5, -3]} intensity={0.6} distance={9} color={accent} />
    </group>
  );
}

/* ===== Drift helpers ============================================== */

function BeachSand() {
  // A narrow foreground beach strip that lives ONLY in the camp/road
  // band. The previous full-size checker floor was bleeding into the
  // sea zone and under Heybeliada, which made the era's ground feel
  // tangled. Sand now stops cleanly where the road begins and the sea
  // takes over.
  const tiles = useMemo(() => {
    type Tile = { key: string; pos: [number, number, number]; color: string };
    const out: Tile[] = [];
    const xStart = -12;
    const xCount = 24;
    const zStart = -1; // just behind the road
    const zCount = 6; // shallow strip toward the camera
    for (let i = 0; i < xCount; i++) {
      for (let j = 0; j < zCount; j++) {
        const isA = (i + j) % 2 === 0;
        out.push({
          key: `${i}-${j}`,
          pos: [
            xStart + i + 0.5,
            // sand tiles sit slightly LOWER so the asphalt and damp-sand
            // strips read clearly on top of them where they overlap.
            -0.7,
            zStart + j + 0.5,
          ],
          color: isA ? "#dccfaa" : "#d4c5a0",
        });
      }
    }
    return out;
  }, []);
  return (
    <group>
      {tiles.map((t) => (
        // shorter tiles (height 0.4) so the top of the sand sits at y=-0.5
        // — half a unit below the road surface (~y=-0.41).
        <mesh key={t.key} position={t.pos} receiveShadow>
          <boxGeometry args={[1, 0.4, 1]} />
          <meshLambertMaterial color={t.color} />
        </mesh>
      ))}
    </group>
  );
}

/* Festoon string of warm bulbs — a flowing chain of tiny glowing cubes
 * along a gentle catenary curve between two anchor points. Used to tie
 * the camp together visually: caravan ↔ palm ↔ Bali umbrella.
 */
function FestoonLights({
  from,
  to,
  segments = 10,
  sag = 0.4,
  color = "#ffd28a",
}: {
  from: [number, number, number];
  to: [number, number, number];
  segments?: number;
  sag?: number;
  color?: string;
}) {
  const points = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const x = from[0] + (to[0] - from[0]) * t;
      const y = from[1] + (to[1] - from[1]) * t - Math.sin(t * Math.PI) * sag;
      const z = from[2] + (to[2] - from[2]) * t;
      out.push({ pos: [x, y, z] });
    }
    return out;
  }, [from, to, segments, sag]);
  return (
    <group>
      {/* Wire line — thin dark bar for each segment */}
      {points.slice(0, -1).map((p, i) => {
        const next = points[i + 1];
        const cx = (p.pos[0] + next.pos[0]) / 2;
        const cy = (p.pos[1] + next.pos[1]) / 2;
        const cz = (p.pos[2] + next.pos[2]) / 2;
        const dx = next.pos[0] - p.pos[0];
        const dy = next.pos[1] - p.pos[1];
        const dz = next.pos[2] - p.pos[2];
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const rotY = Math.atan2(dx, dz);
        const rotX = -Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
        return (
          <mesh key={`w-${i}`} position={[cx, cy, cz]} rotation={[rotX, rotY, 0]}>
            <boxGeometry args={[0.02, 0.02, len]} />
            <meshLambertMaterial color="#1a1a1f" />
          </mesh>
        );
      })}
      {/* Bulbs */}
      {points.map((p, i) => (
        <mesh key={`b-${i}`} position={[p.pos[0], p.pos[1] - 0.06, p.pos[2]]}>
          <boxGeometry args={[0.08, 0.1, 0.08]} />
          <meshStandardMaterial
            color="#000"
            emissive={color}
            emissiveIntensity={i % 2 === 0 ? 1.6 : 1.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* A simple voxel acoustic guitar leaning on a surface, body + neck +
 * sound hole + tiny tuning pegs. Sized to lean on the caravan or a palm. */
function Guitar({
  position,
  rotation = [0, 0, 0.35] as [number, number, number],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.7, 0.9, 0.22]} />
        <meshLambertMaterial color="#a87238" />
      </mesh>
      {/* upper-body indent (waist) — slightly smaller dark slab */}
      <mesh position={[0, 0.18, 0.115]}>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshLambertMaterial color="#5a3a1f" />
      </mesh>
      {/* sound hole */}
      <mesh position={[0, 0.0, 0.12]}>
        <boxGeometry args={[0.22, 0.22, 0.02]} />
        <meshLambertMaterial color="#1a1006" />
      </mesh>
      {/* bridge */}
      <mesh position={[0, -0.22, 0.12]}>
        <boxGeometry args={[0.34, 0.04, 0.02]} />
        <meshLambertMaterial color="#1a1006" />
      </mesh>
      {/* neck */}
      <mesh position={[0, 0.92, 0]} castShadow>
        <boxGeometry args={[0.15, 0.95, 0.12]} />
        <meshLambertMaterial color="#3a2014" />
      </mesh>
      {/* head */}
      <mesh position={[0, 1.48, 0]} castShadow>
        <boxGeometry args={[0.24, 0.22, 0.1]} />
        <meshLambertMaterial color="#2a1810" />
      </mesh>
      {/* tuning pegs */}
      {[-0.06, 0.06].map((dx, i) => (
        <mesh key={i} position={[dx, 1.5, 0.06]}>
          <boxGeometry args={[0.04, 0.04, 0.06]} />
          <meshStandardMaterial color="#caa84a" emissive="#caa84a" emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
      ))}
      {/* strings — six thin emissive lines down the neck */}
      {[-0.06, -0.03, 0, 0.03, 0.06, 0.09].map((dx, i) => (
        <mesh key={i} position={[dx - 0.015, 0.5, 0.13]}>
          <boxGeometry args={[0.008, 1.7, 0.005]} />
          <meshStandardMaterial color="#bcbab2" emissive="#bcbab2" emissiveIntensity={0.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function DriftSky() {
  // Golden-hour gradient: deep violet up top → pink → orange → soft yellow
  // just above the horizon. Sun disc sits low on the right so the right
  // half of the world catches the warmest light.
  return (
    <group position={[0, 6, -16]}>
      <mesh position={[0, 6, 0]}>
        <planeGeometry args={[60, 14]} />
        <meshBasicMaterial color="#3a2050" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1, 0.05]}>
        <planeGeometry args={[60, 6]} />
        <meshBasicMaterial color="#d44a7a" toneMapped={false} />
      </mesh>
      <mesh position={[0, -3, 0.1]}>
        <planeGeometry args={[60, 4]} />
        <meshBasicMaterial color="#ff8a3a" toneMapped={false} />
      </mesh>
      <mesh position={[0, -6, 0.15]}>
        <planeGeometry args={[60, 4]} />
        <meshBasicMaterial color="#ffce7a" toneMapped={false} />
      </mesh>
      {/* sun */}
      <mesh position={[6, -3, 0.2]}>
        <circleGeometry args={[1.4, 22]} />
        <meshBasicMaterial color="#fff0c0" toneMapped={false} />
      </mesh>
      {/* sun's inner halo */}
      <mesh position={[6, -3, 0.18]}>
        <circleGeometry args={[2.2, 24]} />
        <meshBasicMaterial color="#ffd49a" transparent opacity={0.4} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DriftHorizon() {
  // Far jungle ridge + Thai temple silhouette + mountain stack. Pushed
  // deep (z=-13) so it reads as distance behind the sea.
  return (
    <group position={[0, 0, -13]}>
      {/* Mountain ridge */}
      <mesh position={[-7, 2.2, 0]}>
        <boxGeometry args={[7, 4.4, 1]} />
        <meshLambertMaterial color="#3a1a3a" />
      </mesh>
      <mesh position={[-4, 3.8, 0]}>
        <boxGeometry args={[4.5, 7.6, 1]} />
        <meshLambertMaterial color="#2a1430" />
      </mesh>
      <mesh position={[-1, 2.5, 0]}>
        <boxGeometry args={[3.5, 5, 1]} />
        <meshLambertMaterial color="#3a1a3a" />
      </mesh>
      <mesh position={[2.5, 1.6, 0]}>
        <boxGeometry args={[2.5, 3.2, 1]} />
        <meshLambertMaterial color="#3a1a3a" />
      </mesh>

      {/* Thai temple silhouette — stepped pyramid with a tall spire */}
      <group position={[-3, 5.0, 0.5]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.4, 0.4, 1.2]} />
          <meshLambertMaterial color="#5a2a18" />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1.8, 0.5, 0.9]} />
          <meshLambertMaterial color="#6a3018" />
        </mesh>
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[1.2, 0.6, 0.7]} />
          <meshLambertMaterial color="#7a3818" />
        </mesh>
        {/* Golden spire */}
        <mesh position={[0, 1.7, 0]}>
          <boxGeometry args={[0.3, 1.0, 0.3]} />
          <meshStandardMaterial
            color="#caa84a"
            emissive="#ffd28a"
            emissiveIntensity={1.0}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 2.4, 0]}>
          <coneGeometry args={[0.18, 0.55, 6]} />
          <meshStandardMaterial
            color="#caa84a"
            emissive="#ffd28a"
            emissiveIntensity={1.2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* Background palms on the far ridge */}
      {[[-9, 1.6], [-6.3, 1.4], [-1.8, 1.4], [3.2, 1.2], [5.6, 1.0]].map(
        (p, i) => (
          <group key={i} position={[p[0], 4, 0.3]}>
            <mesh position={[0, p[1] / 2, 0]}>
              <boxGeometry args={[0.18, p[1], 0.18]} />
              <meshLambertMaterial color="#10142a" />
            </mesh>
            <mesh position={[0, p[1], 0]}>
              <boxGeometry args={[1.0, 0.16, 1.0]} />
              <meshLambertMaterial color="#10142a" />
            </mesh>
          </group>
        ),
      )}
    </group>
  );
}

function DriftSea({
  waveRefs,
}: {
  waveRefs: React.MutableRefObject<(THREE.MeshStandardMaterial | null)[]>;
}) {
  // Sea ribbon now extends from just behind the road all the way to
  // the distant mountains — no more visible "void" between the sea
  // and the horizon, and no sand bleeding through.
  return (
    <group>
      {/* base sea (very wide + deep) */}
      <mesh position={[0, -0.48, -7.5]} receiveShadow>
        <boxGeometry args={[24, 0.06, 9]} />
        <meshLambertMaterial color="#1a2a4a" />
      </mesh>
      {/* warmer near-shore band catching the sun */}
      <mesh position={[3, -0.46, -3.4]}>
        <boxGeometry args={[20, 0.06, 1.6]} />
        <meshLambertMaterial color="#3a3458" />
      </mesh>
      {/* deeper far band so the sea reads as receding */}
      <mesh position={[0, -0.48, -10]}>
        <boxGeometry args={[24, 0.06, 3]} />
        <meshLambertMaterial color="#0e1a36" />
      </mesh>
      {/* Wave crests shimmering — emissive bars spread across the wider sea */}
      {Array.from({ length: 24 }).map((_, i) => {
        const x = -11 + (i * 22) / 24 + (i * 0.31) % 1.4;
        const z = -10 + (i * 0.5) % 7;
        const w = 0.5 + ((i * 0.27) % 0.7);
        const isHot = i % 3 === 0;
        return (
          <mesh key={i} position={[x, -0.43, z]}>
            <boxGeometry args={[w, 0.02, 0.06]} />
            <meshStandardMaterial
              ref={(el) => {
                waveRefs.current[i] = el;
              }}
              color="#1a2848"
              emissive={isHot ? "#ff9a6a" : "#a4b8e8"}
              emissiveIntensity={isHot ? 0.7 : 0.35}
              toneMapped={false}
            />
          </mesh>
        );
      })}
      {/* Reflection of the sun on the sea — vertical pink-orange streak */}
      <mesh position={[5.5, -0.44, -5]}>
        <boxGeometry args={[1.2, 0.02, 3.4]} />
        <meshStandardMaterial
          color="#3a2440"
          emissive="#ff9a4a"
          emissiveIntensity={0.6}
          toneMapped={false}
          transparent
          opacity={0.7}
        />
      </mesh>
    </group>
  );
}

/* CoastalRoad + Scooter removed — the camp now sits directly on the
 * beach. New helpers below add the camp life and sea life that fill
 * the era out. */

function Airplane({ accent }: { accent: string }) {
  // Small voxel commercial plane in white + accent stripe. Built so its
  // nose points along +X by default; parent useFrame rotates it to face
  // the direction of motion.
  return (
    <group>
      {/* fuselage */}
      <mesh castShadow>
        <boxGeometry args={[1.8, 0.32, 0.32]} />
        <meshLambertMaterial color="#f4f3ee" />
      </mesh>
      {/* accent stripe */}
      <mesh position={[0, 0, 0.17]}>
        <boxGeometry args={[1.7, 0.06, 0.01]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      {/* cockpit windows */}
      <mesh position={[0.78, 0.08, 0]}>
        <boxGeometry args={[0.16, 0.1, 0.32]} />
        <meshStandardMaterial color="#0a1420" emissive="#7d8cff" emissiveIntensity={0.5} toneMapped={false} />
      </mesh>
      {/* nose cone */}
      <mesh position={[0.95, 0, 0]}>
        <boxGeometry args={[0.12, 0.22, 0.22]} />
        <meshLambertMaterial color="#dccfb4" />
      </mesh>
      {/* wings (single span) */}
      <mesh position={[0, -0.04, 0]}>
        <boxGeometry args={[0.6, 0.06, 1.8]} />
        <meshLambertMaterial color="#e8e6dc" />
      </mesh>
      {/* wing tip accent */}
      <mesh position={[0, -0.04, 0.9]}>
        <boxGeometry args={[0.6, 0.07, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.04, -0.9]}>
        <boxGeometry args={[0.6, 0.07, 0.06]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* tail vertical fin */}
      <mesh position={[-0.74, 0.22, 0]}>
        <boxGeometry args={[0.36, 0.4, 0.06]} />
        <meshLambertMaterial color="#e8e6dc" />
      </mesh>
      {/* tail horizontal stabiliser */}
      <mesh position={[-0.76, 0.0, 0]}>
        <boxGeometry args={[0.34, 0.06, 0.6]} />
        <meshLambertMaterial color="#e8e6dc" />
      </mesh>
      {/* navigation lights */}
      <mesh position={[0, -0.04, 0.95]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#000" emissive="#22ff66" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.04, -0.95]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#000" emissive="#ff3a3a" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
      {/* thin contrail trailing behind */}
      <mesh position={[-1.6, 0, 0]}>
        <boxGeometry args={[1.6, 0.04, 0.04]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.6} transparent opacity={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}

function CampingChair({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  return (
    <group position={position} rotation={[0, -0.3, 0]}>
      {/* seat */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[0.6, 0.08, 0.6]} />
        <meshLambertMaterial color={accent} />
      </mesh>
      {/* backrest */}
      <mesh position={[0, 0.9, -0.28]} castShadow>
        <boxGeometry args={[0.6, 1.0, 0.08]} />
        <meshLambertMaterial color={accent} />
      </mesh>
      {/* aluminium frame legs */}
      {([
        [-0.28, 0.21, 0.28],
        [0.28, 0.21, 0.28],
        [-0.28, 0.21, -0.28],
        [0.28, 0.21, -0.28],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.04, 0.42, 0.04]} />
          <meshLambertMaterial color="#bcbab2" />
        </mesh>
      ))}
      {/* cup-holder armrest */}
      <mesh position={[0.34, 0.55, 0]}>
        <boxGeometry args={[0.08, 0.04, 0.4]} />
        <meshLambertMaterial color="#bcbab2" />
      </mesh>
    </group>
  );
}

function Cooler({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* body */}
      <mesh position={[0, 0.36, 0]} castShadow>
        <boxGeometry args={[0.7, 0.7, 0.5]} />
        <meshLambertMaterial color="#bcd6f0" />
      </mesh>
      {/* lid */}
      <mesh position={[0, 0.74, 0]}>
        <boxGeometry args={[0.74, 0.08, 0.54]} />
        <meshLambertMaterial color="#0f55a8" />
      </mesh>
      {/* handle */}
      <mesh position={[0, 0.84, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.06]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
      {/* sticker */}
      <mesh position={[0, 0.4, 0.26]}>
        <boxGeometry args={[0.36, 0.18, 0.02]} />
        <meshStandardMaterial color="#ffd86a" emissive="#ffd86a" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BeachTowel({ position }: { position: [number, number, number] }) {
  // A rectangle of bright striped fabric laid on the sand.
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0.18]} receiveShadow>
        <planeGeometry args={[1.6, 1.0]} />
        <meshLambertMaterial color="#ff7a8c" side={THREE.DoubleSide} />
      </mesh>
      {/* stripes */}
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh
          key={i}
          position={[-0.55 + i * 0.36, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0.18]}
        >
          <planeGeometry args={[0.16, 1.0]} />
          <meshLambertMaterial color={i % 2 === 0 ? "#f4d04a" : "#62ffaa"} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* sunglasses on towel */}
      <mesh position={[0.3, 0.04, 0.0]}>
        <boxGeometry args={[0.24, 0.04, 0.1]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
    </group>
  );
}

function DriftLaundryLine() {
  // Quick rope strung between caravan roof and a small post in the sand;
  // a couple of clothes pinned to it.
  const items: { x: number; w: number; h: number; color: string }[] = [
    { x: -3.4, w: 0.36, h: 0.5, color: "#62a4ff" },
    { x: -2.6, w: 0.4, h: 0.6, color: "#e8d8b4" },
    { x: -1.8, w: 0.36, h: 0.5, color: "#ff7050" },
  ];
  return (
    <group>
      {/* small post in the sand (right anchor) */}
      <mesh position={[-1.1, 1.2, -0.4]} castShadow>
        <boxGeometry args={[0.06, 2.4, 0.06]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      {/* rope line — caravan roof (~y=3) to post top (~y=2.4) */}
      <mesh position={[-2.3, 2.7, -0.4]} rotation={[0, 0, 0.05]}>
        <boxGeometry args={[2.4, 0.02, 0.02]} />
        <meshLambertMaterial color="#5a4030" />
      </mesh>
      {items.map((it, i) => (
        <mesh key={i} position={[it.x, 2.7 - it.h / 2, -0.4]}>
          <boxGeometry args={[it.w, it.h, 0.04]} />
          <meshLambertMaterial color={it.color} />
        </mesh>
      ))}
    </group>
  );
}

function FirewoodStack({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* stacked logs in two layers */}
      {[0, 1].map((row) => (
        <group key={row} position={[0, 0.1 + row * 0.18, 0]}>
          {[-0.18, 0, 0.18].map((dx, i) => (
            <mesh key={i} position={[dx, 0, 0]} rotation={[0, 0, row * 0.05]}>
              <boxGeometry args={[0.16, 0.16, 0.7]} />
              <meshLambertMaterial color={i % 2 === 0 ? "#5a3a1f" : "#3a2418"} />
            </mesh>
          ))}
        </group>
      ))}
      {/* an axe stuck in one log */}
      <mesh position={[0.0, 0.42, 0.0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.05, 0.7, 0.05]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[0.18, 0.78, 0.0]} rotation={[0, 0, 0.6]}>
        <boxGeometry args={[0.04, 0.22, 0.16]} />
        <meshLambertMaterial color="#bcbab2" />
      </mesh>
    </group>
  );
}

function BackpackOpen({ position }: { position: [number, number, number] }) {
  return (
    <group position={position} rotation={[0, 0.5, 0]}>
      {/* body */}
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[0.5, 0.64, 0.3]} />
        <meshLambertMaterial color="#3a2818" />
      </mesh>
      {/* top flap (open) */}
      <mesh position={[0, 0.7, 0.18]} rotation={[Math.PI / 3, 0, 0]}>
        <boxGeometry args={[0.5, 0.18, 0.4]} />
        <meshLambertMaterial color="#5a3818" />
      </mesh>
      {/* shoulder straps */}
      <mesh position={[-0.16, 0.6, -0.16]}>
        <boxGeometry args={[0.06, 0.5, 0.04]} />
        <meshLambertMaterial color="#5a3818" />
      </mesh>
      <mesh position={[0.16, 0.6, -0.16]}>
        <boxGeometry args={[0.06, 0.5, 0.04]} />
        <meshLambertMaterial color="#5a3818" />
      </mesh>
      {/* spilling out — a map sticking out */}
      <mesh position={[0.0, 0.7, 0.16]} rotation={[Math.PI / 4, 0, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.32]} />
        <meshLambertMaterial color="#e8d8b4" />
      </mesh>
      {/* a small water bottle next to it */}
      <mesh position={[0.42, 0.22, 0.08]}>
        <boxGeometry args={[0.16, 0.42, 0.16]} />
        <meshStandardMaterial color="#a4d8f0" transparent opacity={0.7} emissive="#a4d8f0" emissiveIntensity={0.15} toneMapped={false} />
      </mesh>
    </group>
  );
}

function DriftPiece({
  position,
  rotation = [0, 0, 0] as [number, number, number],
  length = 1.6,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <boxGeometry args={[length, 0.22, 0.22]} />
        <meshLambertMaterial color="#7a5a40" />
      </mesh>
      {/* knots */}
      <mesh position={[-length * 0.3, 0, 0.06]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[length * 0.2, 0, -0.06]}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
    </group>
  );
}

function DriftSeashells() {
  // Scattered seashells across the foreground sand — uses a memoised
  // pseudo-random distribution so they don't dance on re-renders.
  const shells = useMemo(() => {
    const out: {
      x: number;
      z: number;
      rot: number;
      color: string;
      size: number;
    }[] = [];
    for (let i = 0; i < 14; i++) {
      const x = (Math.sin(i * 12.31) * 0.5 + 0.5) * 18 - 9;
      const z = 1 + ((i * 0.61) % 3.4);
      out.push({
        x,
        z,
        rot: (i * 0.91) % (Math.PI * 2),
        color: i % 4 === 0 ? "#f4d49a" : i % 4 === 1 ? "#f8c8a8" : i % 4 === 2 ? "#fde8c8" : "#e6c4a4",
        size: 0.1 + ((i * 0.13) % 0.06),
      });
    }
    return out;
  }, []);
  return (
    <group>
      {shells.map((s, i) => (
        <mesh key={i} position={[s.x, -0.46, s.z]} rotation={[0, s.rot, 0]}>
          <boxGeometry args={[s.size, 0.04, s.size * 0.8]} />
          <meshLambertMaterial color={s.color} />
        </mesh>
      ))}
    </group>
  );
}

function DistantSailboats() {
  // A few small sailboats placed at fixed positions far out in the sea
  // — these don't move because they read as distance markers, not life.
  return (
    <group>
      {([
        [-6, -0.2, -8.5, 0.5],
        [-2, -0.2, -9.5, 0.4],
        [3, -0.2, -8.0, 0.6],
        [6, -0.2, -9.2, 0.45],
      ] as [number, number, number, number][]).map((b, i) => (
        <group key={i} position={[b[0], b[1], b[2]]}>
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.32 * b[3], 0.14, 0.7 * b[3]]} />
            <meshLambertMaterial color="#5a4030" />
          </mesh>
          <mesh position={[0, 0.45 * b[3], 0]}>
            <boxGeometry args={[0.04, 1.0 * b[3], 0.04]} />
            <meshLambertMaterial color="#3a2418" />
          </mesh>
          <mesh position={[0, 0.5 * b[3], 0.16 * b[3]]} rotation={[0, 0, 0.18]}>
            <boxGeometry args={[0.02, 0.8 * b[3], 0.5 * b[3]]} />
            <meshStandardMaterial color="#f8efd6" emissive="#fff5d8" emissiveIntensity={0.3} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FishingBoat() {
  // A small Aegean caïque-style fishing boat with a tiny cabin and a
  // single light. Parent ref controls position and rotation.
  return (
    <group>
      {/* lower hull */}
      <mesh position={[0, 0.16, 0]} castShadow>
        <boxGeometry args={[0.7, 0.32, 1.8]} />
        <meshLambertMaterial color="#9a3a3a" />
      </mesh>
      {/* upper hull (white) */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.6, 0.2, 1.6]} />
        <meshLambertMaterial color="#e8e6dc" />
      </mesh>
      {/* cabin */}
      <mesh position={[0, 0.66, 0.2]}>
        <boxGeometry args={[0.46, 0.36, 0.8]} />
        <meshLambertMaterial color="#cfcdc0" />
      </mesh>
      {/* mast */}
      <mesh position={[0, 1.18, 0.0]}>
        <boxGeometry args={[0.04, 0.7, 0.04]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      {/* mast light */}
      <mesh position={[0, 1.55, 0.0]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#000" emissive="#ffd28a" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>
      {/* window glow */}
      <mesh position={[0.24, 0.66, 0.2]}>
        <boxGeometry args={[0.02, 0.16, 0.5]} />
        <meshStandardMaterial color="#000" emissive="#ffd28a" emissiveIntensity={1.2} toneMapped={false} />
      </mesh>
      {/* tiny captain figure */}
      <mesh position={[0, 0.9, -0.2]}>
        <boxGeometry args={[0.16, 0.32, 0.12]} />
        <meshLambertMaterial color="#3a4a5a" />
      </mesh>
      <mesh position={[0, 1.12, -0.2]}>
        <boxGeometry args={[0.14, 0.14, 0.14]} />
        <meshLambertMaterial color="#d8b48a" />
      </mesh>
    </group>
  );
}

/* Original Scooter helper retained further down (unused since the
 * road was removed). */

function SprinterCaravan({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  // Modern white box-shape Sprinter. Side door open with karavan.MOV
  // playing on the back wall inside the van so the interior glows.
  void accent;
  return (
    <group position={position} rotation={[0, 0.18, 0]}>
      {/* main body */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <boxGeometry args={[5.2, 2.6, 2.2]} />
        <meshLambertMaterial color="#f4f3ee" />
      </mesh>
      {/* roof */}
      <mesh position={[0, 2.78, 0]}>
        <boxGeometry args={[5.0, 0.18, 2.0]} />
        <meshLambertMaterial color="#e2e0d8" />
      </mesh>
      {/* lower trim */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[5.22, 0.6, 2.22]} />
        <meshLambertMaterial color="#b8b6ae" />
      </mesh>
      {/* cab front (sloped) */}
      <mesh position={[2.7, 1.5, 0]}>
        <boxGeometry args={[0.5, 2.0, 2.0]} />
        <meshLambertMaterial color="#f4f3ee" />
      </mesh>
      {/* windshield */}
      <mesh position={[2.95, 1.7, 0]}>
        <boxGeometry args={[0.04, 1.0, 1.7]} />
        <meshStandardMaterial
          color="#0a1430"
          emissive="#ff9a6a"
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>
      {/* driver door window */}
      <mesh position={[1.6, 1.7, 1.115]}>
        <boxGeometry args={[1.0, 0.8, 0.04]} />
        <meshStandardMaterial
          color="#0e2030"
          emissive="#ffb070"
          emissiveIntensity={0.35}
          toneMapped={false}
        />
      </mesh>
      {/* side window (back of cabin) */}
      <mesh position={[-1.4, 1.7, 1.115]}>
        <boxGeometry args={[1.6, 0.7, 0.04]} />
        <meshStandardMaterial
          color="#0e2030"
          emissive="#ffb070"
          emissiveIntensity={0.4}
          toneMapped={false}
        />
      </mesh>

      {/* SIDE DOOR — sliding door opened; van wall cut visually with
       *  a recessed dark cavity + a doorway frame so it reads as a
       *  real opening, not a TV mounted on the side. */}
      {/* Dark cavity backplate (deeper into the van) */}
      <mesh position={[0.4, 1.35, 1.11]}>
        <boxGeometry args={[1.4, 1.9, 0.02]} />
        <meshLambertMaterial color="#0a0a14" />
      </mesh>
      {/* Top header */}
      <mesh position={[0.4, 2.35, 1.13]}>
        <boxGeometry args={[1.55, 0.12, 0.05]} />
        <meshLambertMaterial color="#bcbab2" />
      </mesh>
      {/* Door track rail */}
      <mesh position={[0.4, 2.45, 1.13]}>
        <boxGeometry args={[1.7, 0.05, 0.05]} />
        <meshLambertMaterial color="#3a3a40" />
      </mesh>
      {/* Left jamb */}
      <mesh position={[-0.34, 1.4, 1.13]}>
        <boxGeometry args={[0.08, 1.95, 0.05]} />
        <meshLambertMaterial color="#bcbab2" />
      </mesh>
      {/* Right jamb */}
      <mesh position={[1.14, 1.4, 1.13]}>
        <boxGeometry args={[0.08, 1.95, 0.05]} />
        <meshLambertMaterial color="#bcbab2" />
      </mesh>
      {/* Step / threshold at the floor of the doorway */}
      <mesh position={[0.4, 0.42, 1.18]}>
        <boxGeometry args={[1.4, 0.08, 0.12]} />
        <meshLambertMaterial color="#3a3a40" />
      </mesh>
      {/* Karavan interior video — visible through the open door */}
      <VideoScreen
        position={[0.4, 1.4, 1.13]}
        src="/assets/karavan-web.mp4"
        width={1.2}
        height={1.5}
        frameColor="#1a1a1f"
        glow
        caption={{
          tr: "Karavanda yaşam — Çanakkale → Muğla",
          en: "Caravan life — Çanakkale → Muğla",
        }}
      />
      {/* Interior warm light pool spilling out of the door */}
      <pointLight position={[0.4, 1.4, 1.2]} intensity={1.4} distance={4} color="#ffae5a" />

      {/* Headlights */}
      <mesh position={[3, 1.05, 0.8]}>
        <boxGeometry args={[0.06, 0.18, 0.32]} />
        <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      <mesh position={[3, 1.05, -0.8]}>
        <boxGeometry args={[0.06, 0.18, 0.32]} />
        <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={1.8} toneMapped={false} />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-2.65, 1.6, 0.8]}>
        <boxGeometry args={[0.06, 0.2, 0.32]} />
        <meshStandardMaterial color="#9a1a1a" emissive="#ff3a3a" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>
      <mesh position={[-2.65, 1.6, -0.8]}>
        <boxGeometry args={[0.06, 0.2, 0.32]} />
        <meshStandardMaterial color="#9a1a1a" emissive="#ff3a3a" emissiveIntensity={0.6} toneMapped={false} />
      </mesh>

      {/* Wheels (4) */}
      {([
        [1.8, 0.0, 1.05],
        [-1.6, 0.0, 1.05],
        [1.8, 0.0, -1.05],
        [-1.6, 0.0, -1.05],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.6, 0.6, 0.4]} />
          <meshLambertMaterial color="#1a1a1a" />
        </mesh>
      ))}

      {/* Awning extended on the back side (the side facing away from
       *  the camera) so we can see the open camp without it covering
       *  the door video. Render as a thin slanted slab. */}
      <mesh position={[0, 3.0, -1.4]} rotation={[0.25, 0, 0]}>
        <boxGeometry args={[3.6, 0.04, 1.6]} />
        <meshLambertMaterial color="#d44a7a" />
      </mesh>
      {/* awning poles */}
      <mesh position={[-1.6, 1.6, -2.1]}>
        <boxGeometry args={[0.04, 3.2, 0.04]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[1.6, 1.6, -2.1]}>
        <boxGeometry args={[0.04, 3.2, 0.04]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>

      {/* Roof-rack solar panels — small detail */}
      <mesh position={[-1.4, 2.92, 0]}>
        <boxGeometry args={[1.6, 0.06, 1.0]} />
        <meshStandardMaterial color="#0a1428" emissive="#3a8cff" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
      <mesh position={[0.6, 2.92, 0]}>
        <boxGeometry args={[1.0, 0.06, 1.0]} />
        <meshStandardMaterial color="#0a1428" emissive="#3a8cff" emissiveIntensity={0.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

function BaliCorner({
  position = [5, 0, 1.6] as [number, number, number],
}: {
  position?: [number, number, number];
} = {}) {
  // Bamboo umbrella + rattan swing on the right side of the camp.
  return (
    <group position={position}>
      {/* Bamboo pole */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <boxGeometry args={[0.16, 3.2, 0.16]} />
        <meshLambertMaterial color="#caa84a" />
      </mesh>
      {/* Umbrella canopy — three radial slabs */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.8, 3.2, Math.sin(a) * 0.8]}
            rotation={[0, a, -0.25]}
            castShadow
          >
            <boxGeometry args={[1.8, 0.08, 0.7]} />
            <meshLambertMaterial color={i % 2 === 0 ? "#7a3a24" : "#8a4528"} />
          </mesh>
        );
      })}
      {/* Cap */}
      <mesh position={[0, 3.45, 0]}>
        <boxGeometry args={[0.4, 0.14, 0.4]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>

      {/* Small wooden side table */}
      <mesh position={[0.7, 0.55, 0]} castShadow>
        <boxGeometry args={[0.7, 0.08, 0.7]} />
        <meshLambertMaterial color="#5a3a1f" />
      </mesh>
      {[-0.25, 0.25].map((dx, i) => (
        <mesh key={i} position={[0.7 + dx, 0.27, 0.25]}>
          <boxGeometry args={[0.06, 0.55, 0.06]} />
          <meshLambertMaterial color="#3a2418" />
        </mesh>
      ))}
      {/* Coconut drink */}
      <mesh position={[0.7, 0.7, 0]} castShadow>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[0.7, 0.78, 0.06]}>
        <boxGeometry args={[0.06, 0.18, 0.02]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.4} toneMapped={false} />
      </mesh>

      {/* Rattan swing — woven seat hanging from the umbrella post */}
      <group position={[-1.0, 0, 0.6]}>
        {/* hanging ropes */}
        <mesh position={[-0.5, 2.2, 0]}>
          <boxGeometry args={[0.04, 2.4, 0.04]} />
          <meshLambertMaterial color="#3a2418" />
        </mesh>
        <mesh position={[0.5, 2.2, 0]}>
          <boxGeometry args={[0.04, 2.4, 0.04]} />
          <meshLambertMaterial color="#3a2418" />
        </mesh>
        {/* rattan seat (round-ish) */}
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[1.2, 0.16, 0.9]} />
          <meshLambertMaterial color="#caa84a" />
        </mesh>
        <mesh position={[0, 1.45, -0.4]} castShadow>
          <boxGeometry args={[1.2, 1.0, 0.12]} />
          <meshLambertMaterial color="#8a6a4a" />
        </mesh>
        {/* cushion */}
        <mesh position={[0, 1.16, 0.1]}>
          <boxGeometry args={[1.0, 0.16, 0.7]} />
          <meshLambertMaterial color="#f4a8b8" />
        </mesh>
      </group>
    </group>
  );
}

function DriftPalm({
  position,
  variant,
}: {
  position: [number, number, number];
  variant: 0 | 1 | 2;
}) {
  const palettes = [
    { trunk: "#3a2818", frondA: "#2a6a3a", frondB: "#1f5a2a" },
    { trunk: "#4a3220", frondA: "#3a7a44", frondB: "#2a6a34" },
    { trunk: "#2a1810", frondA: "#1a5a2a", frondB: "#0e4a1c" },
  ];
  const p = palettes[variant];
  return (
    <group position={position}>
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 0.4) * 0.2,
            0.4 + i * 0.6,
            Math.cos(i * 0.4) * 0.1,
          ]}
          castShadow
        >
          <boxGeometry args={[0.32, 0.6, 0.32]} />
          <meshLambertMaterial color={p.trunk} />
        </mesh>
      ))}
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
            <meshLambertMaterial color={i % 2 === 0 ? p.frondA : p.frondB} />
          </mesh>
        );
      })}
      {/* coconuts */}
      <mesh position={[0.2, 3.5, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.22, 0.22]} />
        <meshLambertMaterial color="#2a1a10" />
      </mesh>
    </group>
  );
}

function Hammock({
  position = [1.0, 0, 1.2] as [number, number, number],
  figureRef,
  laptopRef,
}: {
  position?: [number, number, number];
  figureRef: React.MutableRefObject<THREE.Group | null>;
  laptopRef: React.MutableRefObject<THREE.MeshStandardMaterial | null>;
}) {
  // Hammock with its OWN posts so the ropes never float; the posts read
  // like bamboo stakes driven into the sand. Spans ~2.4 wide.
  return (
    <group position={position}>
      {/* Left bamboo post */}
      <mesh position={[-1.6, 1.2, 0]} castShadow>
        <boxGeometry args={[0.12, 2.4, 0.12]} />
        <meshLambertMaterial color="#caa84a" />
      </mesh>
      {/* Right bamboo post */}
      <mesh position={[1.6, 1.2, 0]} castShadow>
        <boxGeometry args={[0.12, 2.4, 0.12]} />
        <meshLambertMaterial color="#caa84a" />
      </mesh>
      {/* Hammock fabric (drooping) */}
      <mesh position={[0, 1.35, 0]} castShadow>
        <boxGeometry args={[2.4, 0.08, 0.8]} />
        <meshLambertMaterial color="#d44a7a" />
      </mesh>
      <mesh position={[0, 1.27, 0]}>
        <boxGeometry args={[2.0, 0.06, 0.6]} />
        <meshLambertMaterial color="#a23a4a" />
      </mesh>
      {/* Ropes from posts down to hammock ends */}
      <mesh position={[-1.5, 1.7, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.9, 0.04, 0.04]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[1.5, 1.7, 0]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.9, 0.04, 0.04]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>

      {/* Tiny Atakan figure lying — head + torso visible from the side. */}
      <group ref={figureRef} position={[0, 1.45, 0.05]}>
        {/* legs/feet */}
        <mesh position={[0.7, 0.05, 0]}>
          <boxGeometry args={[0.7, 0.18, 0.36]} />
          <meshLambertMaterial color="#1a1f30" />
        </mesh>
        {/* torso */}
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.7, 0.22, 0.4]} />
          <meshLambertMaterial color="#3a4a5a" />
        </mesh>
        {/* head */}
        <mesh position={[-0.5, 0.18, 0]}>
          <boxGeometry args={[0.24, 0.24, 0.26]} />
          <meshLambertMaterial color="#d8b48a" />
        </mesh>
        {/* hair */}
        <mesh position={[-0.5, 0.3, 0]}>
          <boxGeometry args={[0.26, 0.06, 0.28]} />
          <meshLambertMaterial color="#2a1810" />
        </mesh>
        {/* laptop on chest */}
        <mesh position={[0.0, 0.32, 0]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.32, 0.04, 0.22]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
        <mesh position={[-0.15, 0.42, 0]} rotation={[0, 0, 1.4]}>
          <boxGeometry args={[0.32, 0.22, 0.02]} />
          <meshStandardMaterial
            ref={laptopRef}
            color="#000"
            emissive="#f472b6"
            emissiveIntensity={1.0}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function Bonfire({
  position = [-3.6, -0.3, 2.0] as [number, number, number],
  fireRefs,
}: {
  position?: [number, number, number];
  fireRefs: React.MutableRefObject<(THREE.MeshStandardMaterial | null)[]>;
}) {
  return (
    <group position={position}>
      {/* 3 stones around */}
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
      {/* logs */}
      <mesh position={[-0.18, 0.22, 0]} rotation={[0, 0.4, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.12]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[0.2, 0.22, 0.1]} rotation={[0, -0.5, 0]}>
        <boxGeometry args={[0.6, 0.12, 0.12]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      {/* Flames */}
      {Array.from({ length: 5 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.sin(i * 1.7) * 0.18,
            0.5 + Math.cos(i * 1.3) * 0.18,
            Math.cos(i * 1.7) * 0.18,
          ]}
        >
          <boxGeometry args={[0.3, 0.45, 0.3]} />
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
      <pointLight position={[0, 0.6, 0]} intensity={1.8} distance={8} color="#ff8a3a" />
    </group>
  );
}

function Surfboard({
  position,
  accent,
}: {
  position: [number, number, number];
  accent: string;
}) {
  return (
    <group position={position} rotation={[0, 0, 0.3]}>
      <mesh castShadow>
        <boxGeometry args={[0.32, 2.6, 0.6]} />
        <meshLambertMaterial color="#f9e8c4" />
      </mesh>
      {/* accent stripe */}
      <mesh position={[0.17, 0, 0]}>
        <boxGeometry args={[0.02, 2.6, 0.16]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      {/* fin */}
      <mesh position={[0, -1.0, -0.16]}>
        <boxGeometry args={[0.08, 0.2, 0.18]} />
        <meshLambertMaterial color="#1a1810" />
      </mesh>
    </group>
  );
}

function DriftBicycle({ position }: { position: [number, number, number] }) {
  // Simplified bike (reusing the Genesis voxel pattern at a smaller scale)
  return (
    <group position={position} rotation={[0, 0.5, 0.06]}>
      {/* two wheels */}
      {[-0.5, 0.5].map((dx, i) => (
        <group key={i} position={[dx, 0.36, 0]}>
          {Array.from({ length: 10 }).map((_, j) => {
            const a = (j / 10) * Math.PI * 2;
            return (
              <mesh
                key={j}
                position={[Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0]}
                rotation={[0, 0, a]}
              >
                <boxGeometry args={[0.1, 0.06, 0.06]} />
                <meshLambertMaterial color="#1a1a1a" />
              </mesh>
            );
          })}
        </group>
      ))}
      <mesh position={[0, 0.62, 0]}>
        <boxGeometry args={[0.95, 0.06, 0.06]} />
        <meshLambertMaterial color="#3a8aaa" />
      </mesh>
      <mesh position={[-0.42, 0.78, 0]} castShadow>
        <boxGeometry args={[0.06, 0.32, 0.05]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[-0.42, 0.96, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.16]} />
        <meshLambertMaterial color="#3a2418" />
      </mesh>
      <mesh position={[0.42, 0.78, 0]} castShadow>
        <boxGeometry args={[0.06, 0.32, 0.05]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
      <mesh position={[0.42, 0.96, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.4]} />
        <meshLambertMaterial color="#2a2a30" />
      </mesh>
    </group>
  );
}

function Scooter({ accent }: { accent: string }) {
  // Vespa-style scooter — voxel approximation, sitting on the road,
  // facing +X (driven by the parent's rotation/position via useFrame).
  return (
    <group>
      {/* body shell (round-ish, but voxel-blocky) */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[0.46, 0.7, 0.7]} />
        <meshLambertMaterial color={accent} />
      </mesh>
      {/* lower deck */}
      <mesh position={[-0.2, 0.3, 0]}>
        <boxGeometry args={[0.6, 0.16, 0.5]} />
        <meshLambertMaterial color={accent} />
      </mesh>
      {/* front shield + headlight stem */}
      <mesh position={[0.35, 0.55, 0]} castShadow>
        <boxGeometry args={[0.18, 0.45, 0.45]} />
        <meshLambertMaterial color={accent} />
      </mesh>
      {/* headlight */}
      <mesh position={[0.46, 0.65, 0]}>
        <boxGeometry args={[0.05, 0.16, 0.2]} />
        <meshStandardMaterial color="#fff5d0" emissive="#fff5d0" emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* handlebars */}
      <mesh position={[0.36, 0.85, 0]}>
        <boxGeometry args={[0.08, 0.06, 0.5]} />
        <meshLambertMaterial color="#1a1a25" />
      </mesh>
      {/* seat */}
      <mesh position={[-0.05, 0.8, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.3]} />
        <meshLambertMaterial color="#1a1820" />
      </mesh>
      {/* wheels */}
      <mesh position={[0.34, 0.16, 0]}>
        <boxGeometry args={[0.18, 0.32, 0.32]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[-0.34, 0.16, 0]}>
        <boxGeometry args={[0.18, 0.32, 0.32]} />
        <meshLambertMaterial color="#1a1a1a" />
      </mesh>
      {/* rider */}
      <group position={[-0.05, 1.05, 0]}>
        {/* torso */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.3, 0.38, 0.3]} />
          <meshLambertMaterial color="#3a4a5a" />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.22, 0.22, 0.22]} />
          <meshLambertMaterial color="#d8b48a" />
        </mesh>
        {/* helmet shell */}
        <mesh position={[0, 0.58, 0]}>
          <boxGeometry args={[0.26, 0.14, 0.26]} />
          <meshLambertMaterial color="#1a1a25" />
        </mesh>
      </group>
    </group>
  );
}

function LotusLantern({
  position,
  lanternRef,
}: {
  position: [number, number, number];
  lanternRef: (el: THREE.MeshStandardMaterial | null) => void;
}) {
  return (
    <group position={position}>
      {/* lotus petals (4 around) */}
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18]}
            rotation={[0, a, -0.3]}
          >
            <boxGeometry args={[0.16, 0.08, 0.32]} />
            <meshLambertMaterial color="#f4a8b8" />
          </mesh>
        );
      })}
      {/* candle glow */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial
          ref={lanternRef}
          color="#000"
          emissive="#ffb070"
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function HeybeliadaIsland({
  boatRef,
}: {
  boatRef: React.MutableRefObject<THREE.Group | null>;
}) {
  // Distant island silhouette on the right (z ≈ -7) + wooden pier
  // jutting from the beach + a moored kayak that bobs. Mini video
  // screen on a wooden post next to the pier plays heybeliada-web.mp4.
  return (
    <group position={[8, 0, -5]}>
      {/* island base */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[5.0, 1.0, 2.4]} />
        <meshLambertMaterial color="#2a1828" />
      </mesh>
      {/* island silhouette hills */}
      <mesh position={[-1.4, 1.1, 0]}>
        <boxGeometry args={[2.2, 1.4, 1.6]} />
        <meshLambertMaterial color="#3a1a30" />
      </mesh>
      <mesh position={[0.5, 1.4, 0]}>
        <boxGeometry args={[2.8, 2.0, 1.6]} />
        <meshLambertMaterial color="#2e1428" />
      </mesh>
      <mesh position={[2.0, 1.0, 0]}>
        <boxGeometry args={[1.6, 1.2, 1.6]} />
        <meshLambertMaterial color="#3a1a30" />
      </mesh>
      {/* pine trees on the island (Heybeliada is famous for them) */}
      {[-1.2, 0.4, 1.8].map((x, i) => (
        <group key={i} position={[x, 2.0 + (i % 2) * 0.3, 0.6]}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[0.12, 0.8, 0.12]} />
            <meshLambertMaterial color="#1a1014" />
          </mesh>
          <mesh position={[0, 0.9, 0]}>
            <boxGeometry args={[0.55, 0.55, 0.55]} />
            <meshLambertMaterial color="#16302a" />
          </mesh>
          <mesh position={[0, 1.25, 0]}>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshLambertMaterial color="#1c4030" />
          </mesh>
        </group>
      ))}
      {/* a small house with lit window */}
      <group position={[0.5, 2.4, 0.8]}>
        <mesh>
          <boxGeometry args={[0.4, 0.4, 0.3]} />
          <meshLambertMaterial color="#1a1822" />
        </mesh>
        <mesh position={[0, 0.28, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshLambertMaterial color="#2a1818" />
        </mesh>
        <mesh position={[0, -0.04, 0.16]}>
          <boxGeometry args={[0.14, 0.14, 0.02]} />
          <meshStandardMaterial color="#000" emissive="#ffd28a" emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
      </group>

      {/* Pier (wooden boards extending TOWARD the camera, +Z, from the
       *  island's near edge). Posts and planks now run along Z so the
       *  pier reads as a walkway out into the strait, not a board that
       *  cuts across the diorama. */}
      <group position={[-1.6, -0.45, 1.4]}>
        {/* planks — long axis along Z */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.7, 0.08, 3.0]} />
          <meshLambertMaterial color="#5a3a1f" />
        </mesh>
        <mesh position={[-0.2, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.02, 3.0]} />
          <meshLambertMaterial color="#3a2418" />
        </mesh>
        <mesh position={[0.2, 0.06, 0]}>
          <boxGeometry args={[0.04, 0.02, 3.0]} />
          <meshLambertMaterial color="#3a2418" />
        </mesh>
        {/* posts along the pier length */}
        {[-1.2, 0, 1.2].map((z, i) => (
          <mesh key={i} position={[0.3, -0.3, z]}>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshLambertMaterial color="#3a2418" />
          </mesh>
        ))}
        {[-1.2, 0, 1.2].map((z, i) => (
          <mesh key={i} position={[-0.3, -0.3, z]}>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshLambertMaterial color="#3a2418" />
          </mesh>
        ))}

        {/* Heybeliada mini video screen on a sign post at the far
         *  (camera-facing) end of the pier — clickable. */}
        <group position={[0, 0.55, 1.3]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 1.0, 0.08]} />
            <meshLambertMaterial color="#3a2418" />
          </mesh>
          <VideoScreen
            position={[0, 0.7, 0]}
            src="/assets/heybeliada-web.mp4"
            width={0.9}
            height={0.6}
            frameColor="#3a2418"
            glow
            caption={{
              tr: "Heybeliada · ada hayatı",
              en: "Heybeliada · island life",
            }}
          />
        </group>

        {/* Tied kayak on the water next to the pier — bobs gently */}
        <group ref={boatRef} position={[0.9, -0.18, 0.4]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.36, 0.16, 1.2]} />
            <meshLambertMaterial color="#caa84a" />
          </mesh>
          <mesh position={[0, 0.12, 0]}>
            <boxGeometry args={[0.26, 0.06, 0.9]} />
            <meshLambertMaterial color="#8a6a4a" />
          </mesh>
          {/* paddle */}
          <mesh position={[0.2, 0.16, 0.5]} rotation={[0, 0, 0.2]}>
            <boxGeometry args={[0.7, 0.04, 0.06]} />
            <meshLambertMaterial color="#3a2418" />
          </mesh>
        </group>
      </group>
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
