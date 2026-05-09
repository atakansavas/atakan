"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  ERAS,
  ERA_ORDER,
  EXPERIENCES,
  LIFE_CHAPTERS,
  PROJECTS,
  expEnd,
  isProjectAlive,
} from "../_lib/data";
import type { Project } from "../_lib/data";
import type { ScrollState } from "../_lib/scroll";

/** Visual geometry kind for a project, derived from data:
 *  - "flower" = alive / live / production / "Yayında"
 *  - "sprig"  = no parent experience (sprouts straight off the trunk)
 *  - "leaf"   = anything else (a project that lived under an experience and
 *               has since wrapped up) */
function projectVisualKind(p: Project): "flower" | "sprig" | "leaf" {
  if (isProjectAlive(p)) return "flower";
  if (!p.parentExperienceId) return "sprig";
  return "leaf";
}

/* =========================================================================
 * Tree of a career.
 *
 * - Vertical trunk grows from the ground (oldest) to the canopy (today).
 * - Each LinkedIn experience is a branch breaking out of the trunk at its
 *   start year, lasting (proportional to) its tenure.
 * - Each project is a leaf/fruit hanging from its parent experience's
 *   branch (or directly off the trunk for self-taught early projects).
 * - The trunk and branches recolour through the eras the way bark changes
 *   between seasons.
 * - The atmosphere is a quiet night-forest: drifting pollen + thick fog,
 *   no stars.
 * ========================================================================= */

const FIRST_YEAR = ERAS.genesis.range[0];
const LAST_YEAR = ERAS.agentic.range[1];
const YEAR_SPAN = LAST_YEAR - FIRST_YEAR;

const TRUNK_BOTTOM_Y = 0;
const TRUNK_TOP_Y = 50;
const TRUNK_HEIGHT = TRUNK_TOP_Y - TRUNK_BOTTOM_Y;

function yearToY(year: number): number {
  const t = (year - FIRST_YEAR) / YEAR_SPAN;
  return TRUNK_BOTTOM_Y + t * TRUNK_HEIGHT;
}

function eraIndexAtY(y: number): number {
  const t = (y - TRUNK_BOTTOM_Y) / TRUNK_HEIGHT;
  const year = FIRST_YEAR + t * YEAR_SPAN;
  for (let i = 0; i < ERA_ORDER.length; i++) {
    const era = ERAS[ERA_ORDER[i]];
    if (year >= era.range[0] && year <= era.range[1]) return i;
  }
  return ERA_ORDER.length - 1;
}

/** Catmull-Rom curve for the trunk so it has a natural S-shape */
function makeTrunkCurve(): THREE.CatmullRomCurve3 {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.4, 8, -0.3),
    new THREE.Vector3(-0.4, 16, 0.5),
    new THREE.Vector3(0.5, 24, -0.2),
    new THREE.Vector3(-0.3, 32, -0.5),
    new THREE.Vector3(0.4, 40, 0.4),
    new THREE.Vector3(0, 48, 0),
    new THREE.Vector3(0, 50, 0),
  ]);
}

/** Position-on-trunk for a given year */
function trunkPointAtYear(curve: THREE.CatmullRomCurve3, year: number): THREE.Vector3 {
  const t = Math.max(0, Math.min(1, (year - FIRST_YEAR) / YEAR_SPAN));
  return curve.getPointAt(t).clone();
}

const TRUNK_RADIUS = 0.55;

type TerrainProps = { scrollRef: React.MutableRefObject<ScrollState> };

/* =========================================================================
 * Trunk
 * ========================================================================= */
function Trunk() {
  const { geometry, curve } = useMemo(() => {
    const curve = makeTrunkCurve();
    const geo = new THREE.TubeGeometry(curve, 220, TRUNK_RADIUS, 16, false);
    // Vertex colors: gradient through eras based on y position
    const positions = geo.attributes.position;
    const colors = new Float32Array(positions.count * 3);
    const tmp = new THREE.Color();
    const tmpA = new THREE.Color();
    const tmpB = new THREE.Color();
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const t = Math.max(0, Math.min(1, y / TRUNK_HEIGHT));
      const eraFloat = t * (ERA_ORDER.length - 1);
      const e0 = Math.floor(eraFloat);
      const e1 = Math.min(ERA_ORDER.length - 1, e0 + 1);
      const eraT = eraFloat - e0;
      tmpA.set(ERAS[ERA_ORDER[e0]].accent);
      tmpB.set(ERAS[ERA_ORDER[e1]].accent);
      tmp.copy(tmpA).lerp(tmpB, eraT);
      // Darken slightly to feel like bark, not neon
      tmp.multiplyScalar(0.45);
      colors[i * 3] = tmp.r;
      colors[i * 3 + 1] = tmp.g;
      colors[i * 3 + 2] = tmp.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { geometry: geo, curve };
  }, []);

  // Expose curve via ref-like pattern by attaching to userData
  return (
    <group userData={{ curve }}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          vertexColors
          metalness={0.1}
          roughness={0.95}
          flatShading
        />
      </mesh>
      {/* Faint glow halo around the trunk so it reads against fog */}
      <mesh geometry={geometry}>
        <meshBasicMaterial
          vertexColors
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * Branches — one per experience, spiraling out from the trunk
 * ========================================================================= */
function Branches({ scrollRef }: TerrainProps) {
  const branchRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tipRefs = useRef<(THREE.Mesh | null)[]>([]);
  const haloRefs = useRef<(THREE.Mesh | null)[]>([]);

  const data = useMemo(() => {
    const curve = makeTrunkCurve();
    return EXPERIENCES.map((exp, i) => {
      const startPt = trunkPointAtYear(curve, exp.start);
      const endPt = trunkPointAtYear(curve, expEnd(exp));
      // Spiral angle around y axis (golden angle for a phyllotaxy feel)
      const angle = i * 2.3998;
      const tenure = Math.max(1, expEnd(exp) - exp.start);
      const branchLen = 4 + tenure * 1.4;
      // Branch lifts a bit as it moves outward (real branches angle up)
      const dir = new THREE.Vector3(Math.cos(angle), 0.1, Math.sin(angle))
        .normalize();
      const branchEnd = startPt.clone().add(dir.clone().multiplyScalar(branchLen));
      // Curve through start → mid (bow up) → end
      const mid = startPt
        .clone()
        .lerp(branchEnd, 0.55)
        .add(new THREE.Vector3(0, 0.6, 0));
      const branchCurve = new THREE.CatmullRomCurve3([startPt, mid, branchEnd]);
      // Branch radius scales with how flagship it is
      const baseRadius = exp.flagship ? 0.18 : 0.12;
      const tubeGeom = new THREE.TubeGeometry(
        branchCurve,
        48,
        baseRadius,
        10,
        false,
      );
      // Branch end position covering startPt to endPt range so old
      // experiences stay where they bloomed (anchored to start year)
      return {
        exp,
        startPt: startPt.clone(),
        endPt: endPt.clone(),
        branchEnd,
        tubeGeom,
        accent: ERAS[exp.era].accent,
        index: i,
      };
    });
  }, []);

  useFrame((_, delta) => {
    const s = scrollRef.current;
    const t = performance.now() * 0.001;
    data.forEach((d, i) => {
      const branch = branchRefs.current[i];
      const tip = tipRefs.current[i];
      const halo = haloRefs.current[i];
      if (!branch || !tip || !halo) return;
      const isActive = s.activeKind === "experience" && s.activeId === d.exp.id;
      const isAncestor =
        s.activeKind === "project" && s.parentExperienceId === d.exp.id;
      const focus = isActive ? 1 : isAncestor ? 0.7 : 0;

      // Branch material brightening — inactive branches get visibly darker
      // so the active one really pops.
      const bm = branch.material as THREE.MeshStandardMaterial;
      const target = focus > 0.5 ? 2.0 : focus > 0 ? 1.0 : 0.12;
      const damp = 1 - Math.exp(-delta * 4);
      bm.emissiveIntensity += (target - bm.emissiveIntensity) * damp;

      // Tip (cluster bud) — inactive buds shrink and dim,
      // active grows ~1.6x and pulses bright
      const tm = tip.material as THREE.MeshStandardMaterial;
      const tipTarget = focus > 0.5 ? 3.4 : focus > 0 ? 1.6 : 0.4;
      tm.emissiveIntensity += (tipTarget - tm.emissiveIntensity) * damp;
      const pulse =
        (focus > 0.5 ? 1.55 : focus > 0 ? 1.15 : 0.7) +
        Math.sin(t * 1.6 + i) * 0.06 * (1 + focus);
      tip.scale.setScalar(pulse);

      // Halo opacity — only active flare visibly
      const hm = halo.material as THREE.MeshBasicMaterial;
      const haloTarget = focus > 0.5 ? 0.85 : focus > 0 ? 0.35 : 0;
      hm.opacity += (haloTarget - hm.opacity) * damp;
      halo.scale.setScalar(
        (focus > 0.5 ? 1.25 : 1) + Math.sin(t * 1.1 + i) * 0.05,
      );
    });
  });

  return (
    <group>
      {data.map((d, i) => (
        <group key={d.exp.id}>
          {/* The branch (tube) */}
          <mesh
            ref={(el) => { branchRefs.current[i] = el; }}
            geometry={d.tubeGeom}
          >
            <meshStandardMaterial
              color={new THREE.Color(d.accent).multiplyScalar(0.6)}
              emissive={d.accent}
              emissiveIntensity={0.35}
              roughness={0.85}
              metalness={0.05}
              flatShading
            />
          </mesh>
          {/* Cluster bud at the branch tip — the "experience flower" */}
          <mesh
            ref={(el) => { tipRefs.current[i] = el; }}
            position={d.branchEnd}
          >
            <icosahedronGeometry args={[d.exp.flagship ? 0.55 : 0.38, 1]} />
            <meshStandardMaterial
              color={d.accent}
              emissive={d.accent}
              emissiveIntensity={0.7}
              roughness={0.45}
              metalness={0.4}
            />
          </mesh>
          {/* Soft halo around the bud */}
          <mesh
            ref={(el) => { haloRefs.current[i] = el; }}
            position={d.branchEnd}
          >
            <sphereGeometry args={[d.exp.flagship ? 1.2 : 0.9, 16, 16]} />
            <meshBasicMaterial
              color={d.accent}
              transparent
              opacity={0}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/* =========================================================================
 * Leaves — one per project, hanging on its parent branch (or trunk)
 * ========================================================================= */
function Leaves({ scrollRef }: TerrainProps) {
  const leafRefs = useRef<(THREE.Mesh | null)[]>([]);
  const stemRefs = useRef<(THREE.Mesh | null)[]>([]);

  const data = useMemo(() => {
    const curve = makeTrunkCurve();
    // Pre-compute branch endpoints per experience so leaves can hang on them
    const branchInfo = new Map<
      string,
      { startPt: THREE.Vector3; branchEnd: THREE.Vector3; accent: string; index: number }
    >();
    EXPERIENCES.forEach((exp, i) => {
      const startPt = trunkPointAtYear(curve, exp.start);
      const angle = i * 2.3998;
      const tenure = Math.max(1, expEnd(exp) - exp.start);
      const branchLen = 4 + tenure * 1.4;
      const dir = new THREE.Vector3(Math.cos(angle), 0.1, Math.sin(angle)).normalize();
      const branchEnd = startPt.clone().add(dir.clone().multiplyScalar(branchLen));
      branchInfo.set(exp.id, {
        startPt,
        branchEnd,
        accent: ERAS[exp.era].accent,
        index: i,
      });
    });

    return PROJECTS.map((p: Project, i: number) => {
      const explicitParent = p.parentExperienceId
        ? branchInfo.get(p.parentExperienceId)
        : undefined;
      const implicitParent = !explicitParent
        ? Array.from(branchInfo.values()).find((b) => {
            const exp = EXPERIENCES[b.index];
            return p.year >= exp.start && p.year <= expEnd(exp);
          })
        : undefined;
      const parentBranch = explicitParent ?? implicitParent ?? null;

      let anchor: THREE.Vector3;
      let parentDir: THREE.Vector3;
      if (parentBranch) {
        // Hang along the branch — interpolate position by how late in the
        // experience the project came (rough approximation).
        const exp = EXPERIENCES[parentBranch.index];
        const u = Math.max(0.15, Math.min(0.95, (p.year - exp.start) / Math.max(1, expEnd(exp) - exp.start)));
        anchor = parentBranch.startPt.clone().lerp(parentBranch.branchEnd, u);
        parentDir = parentBranch.branchEnd.clone().sub(parentBranch.startPt).normalize();
      } else {
        // No parent — hang directly off the trunk
        anchor = trunkPointAtYear(curve, p.year);
        parentDir = new THREE.Vector3(0, 1, 0);
      }
      // Leaf hangs slightly out and down from the anchor
      const offsetDir = parentDir
        .clone()
        .add(new THREE.Vector3(0, -0.4, 0))
        .normalize();
      const sideAxis = new THREE.Vector3(0, 1, 0)
        .cross(parentDir)
        .normalize()
        .multiplyScalar(0.8);
      // Alternate sides so leaves don't overlap on a branch
      const sideSign = i % 2 === 0 ? 1 : -1;
      const leafOffset = offsetDir
        .multiplyScalar(0.7)
        .add(sideAxis.multiplyScalar(sideSign * 0.6))
        .add(new THREE.Vector3(0, -0.5, 0));
      const leafPos = anchor.clone().add(leafOffset);

      const accent =
        parentBranch?.accent ?? ERAS[p.era].accent;

      return {
        project: p,
        anchor,
        leafPos,
        accent,
        scale: p.flagship ? 0.45 : 0.28,
      };
    });
  }, []);

  useFrame((_, delta) => {
    const s = scrollRef.current;
    const t = performance.now() * 0.001;
    data.forEach((d, i) => {
      const leaf = leafRefs.current[i];
      const stem = stemRefs.current[i];
      if (!leaf || !stem) return;
      const isActive = s.activeKind === "project" && s.activeId === d.project.id;
      const inActiveExp =
        s.activeKind === "experience" &&
        d.project.parentExperienceId === s.activeId;
      const focus = isActive ? 1 : inActiveExp ? 0.55 : 0;

      // Wind sway — every leaf moves a tiny bit
      const sway = Math.sin(t * 1.4 + i * 0.7) * 0.05;
      leaf.rotation.z = sway;
      leaf.rotation.x = Math.cos(t * 1.1 + i) * 0.04;

      const damp = 1 - Math.exp(-delta * 4);
      // Inactive leaves are noticeably smaller (so the active one looks like
      // a swelling fruit on the branch).
      const sizeFactor =
        (focus > 0.5 ? 1.7 : focus > 0 ? 1.05 : 0.65) +
        Math.sin(t * 2 + i) * 0.04 * (1 + focus);
      leaf.scale.setScalar(d.scale * sizeFactor);

      const lm = leaf.material as THREE.MeshStandardMaterial;
      const target = focus > 0.5 ? 2.4 : focus > 0 ? 1.1 : 0.12;
      lm.emissiveIntensity += (target - lm.emissiveIntensity) * damp;

      const sm = stem.material as THREE.MeshBasicMaterial;
      const sopacity = focus > 0.5 ? 0.85 : focus > 0 ? 0.35 : 0.08;
      sm.opacity += (sopacity - sm.opacity) * damp;
    });
  });

  return (
    <group>
      {data.map((d, i) => {
        const kind = projectVisualKind(d.project);
        return (
        <group key={d.project.id}>
          {/* Stem connecting leaf to the branch/trunk — slim cylinder */}
          <StemCylinder
            from={d.anchor}
            to={d.leafPos}
            color={d.accent}
            stemRef={(el) => { stemRefs.current[i] = el; }}
          />
          {kind === "flower" ? (
            // Alive / live / "Yayında" — a multi-faceted flower
            <mesh ref={(el) => { leafRefs.current[i] = el; }} position={d.leafPos}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={d.accent}
                emissive={d.accent}
                emissiveIntensity={0.6}
                metalness={0.55}
                roughness={0.3}
                flatShading
              />
            </mesh>
          ) : kind === "sprig" ? (
            // No parent experience — a sprig (single elongated cone) sprouting
            // straight off the trunk. Pointing slightly outward.
            <mesh
              ref={(el) => { leafRefs.current[i] = el; }}
              position={d.leafPos}
              rotation={[0, 0, Math.PI * 0.04]}
            >
              <coneGeometry args={[0.32, 1.4, 8]} />
              <meshStandardMaterial
                color={d.accent}
                emissive={d.accent}
                emissiveIntensity={0.55}
                metalness={0.35}
                roughness={0.5}
                flatShading
              />
            </mesh>
          ) : (
            // Default leaf
            <mesh ref={(el) => { leafRefs.current[i] = el; }} position={d.leafPos}>
              <octahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color={d.accent}
                emissive={d.accent}
                emissiveIntensity={0.5}
                metalness={0.45}
                roughness={0.45}
                flatShading
              />
            </mesh>
          )}
        </group>
        );
      })}
    </group>
  );
}

/* =========================================================================
 * StemCylinder — slim cylinder bridging anchor → leafPos.
 * Used as the project stem instead of a <line>, which has JSX-namespace
 * conflicts in some setups.
 * ========================================================================= */
function StemCylinder({
  from,
  to,
  color,
  stemRef,
}: {
  from: THREE.Vector3;
  to: THREE.Vector3;
  color: string;
  stemRef: (m: THREE.Mesh | null) => void;
}) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const length = dir.length();
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  // Quaternion to align +Y cylinder with `dir`
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(
    up,
    dir.clone().normalize(),
  );
  return (
    <mesh ref={stemRef} position={mid} quaternion={quat}>
      <cylinderGeometry args={[0.025, 0.025, length, 6]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={0.3}
        depthWrite={false}
      />
    </mesh>
  );
}

/* =========================================================================
 * Pollen / dust drifting around the tree (replaces stars)
 * ========================================================================= */
function Pollen() {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, velocities } = useMemo(() => {
    const COUNT = 600;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      // Cloud around the tree column
      const r = 6 + Math.random() * 24;
      const angle = Math.random() * Math.PI * 2;
      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = Math.random() * 60;
      positions[i * 3 + 2] = Math.sin(angle) * r;
      velocities[i] = 0.4 + Math.random() * 1.0;
    }
    return { positions, velocities };
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    const geom = pointsRef.current.geometry as THREE.BufferGeometry;
    const arr = geom.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i + 1] += velocities[i / 3] * delta * 0.3;
      if (arr[i + 1] > 60) arr[i + 1] = -2;
      // gentle horizontal drift
      arr[i] += Math.sin(performance.now() * 0.0003 + i) * delta * 0.05;
    }
    geom.attributes.position.needsUpdate = true;
  });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  return (
    <points ref={pointsRef} geometry={geometry}>
      <pointsMaterial
        color="#f6e9c4"
        size={0.18}
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* =========================================================================
 * Forest ground: a soft circular plate under the trunk for grounding
 * ========================================================================= */
function ForestGround() {
  const ringRef = useRef<THREE.Mesh>(null);
  useFrame(() => {
    if (!ringRef.current) return;
    const t = performance.now() * 0.0006;
    ringRef.current.rotation.z = t * 0.2;
  });
  return (
    <group>
      {/* dark mossy disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <circleGeometry args={[40, 64]} />
        <meshStandardMaterial color="#0a1612" roughness={1} metalness={0} />
      </mesh>
      {/* glowing root ring */}
      <mesh
        ref={ringRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <ringGeometry args={[1.4, 1.65, 64]} />
        <meshBasicMaterial
          color="#ff7a59"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * Active highlight: light up the active branch tip / leaf with a corona
 * ========================================================================= */
function ActiveCorona({ scrollRef }: TerrainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const tmp = useRef(new THREE.Vector3());
  const tmpColor = useRef(new THREE.Color());

  const curve = useMemo(() => makeTrunkCurve(), []);

  // Branch tip lookup
  const branchTipById = useMemo(() => {
    const m = new Map<string, { tip: THREE.Vector3; accent: string }>();
    EXPERIENCES.forEach((exp, i) => {
      const startPt = trunkPointAtYear(curve, exp.start);
      const angle = i * 2.3998;
      const tenure = Math.max(1, expEnd(exp) - exp.start);
      const branchLen = 4 + tenure * 1.4;
      const dir = new THREE.Vector3(Math.cos(angle), 0.1, Math.sin(angle)).normalize();
      const tip = startPt.clone().add(dir.clone().multiplyScalar(branchLen));
      m.set(exp.id, { tip, accent: ERAS[exp.era].accent });
    });
    return m;
  }, [curve]);

  // Leaf position lookup
  const leafPosById = useMemo(() => {
    const m = new Map<string, { pos: THREE.Vector3; accent: string }>();
    PROJECTS.forEach((p, i) => {
      let anchor: THREE.Vector3;
      let parentDir: THREE.Vector3;
      let accent: string;
      const parent = p.parentExperienceId
        ? branchTipById.get(p.parentExperienceId)
        : null;
      if (parent) {
        const exp = EXPERIENCES.find((e) => e.id === p.parentExperienceId)!;
        const startPt = trunkPointAtYear(curve, exp.start);
        const u = Math.max(0.15, Math.min(0.95, (p.year - exp.start) / Math.max(1, expEnd(exp) - exp.start)));
        anchor = startPt.clone().lerp(parent.tip, u);
        parentDir = parent.tip.clone().sub(startPt).normalize();
        accent = parent.accent;
      } else {
        anchor = trunkPointAtYear(curve, p.year);
        parentDir = new THREE.Vector3(0, 1, 0);
        accent = ERAS[p.era].accent;
      }
      const offsetDir = parentDir.clone().add(new THREE.Vector3(0, -0.4, 0)).normalize();
      const sideAxis = new THREE.Vector3(0, 1, 0).cross(parentDir).normalize().multiplyScalar(0.8);
      const sideSign = i % 2 === 0 ? 1 : -1;
      const leafOffset = offsetDir
        .multiplyScalar(0.7)
        .add(sideAxis.multiplyScalar(sideSign * 0.6))
        .add(new THREE.Vector3(0, -0.5, 0));
      m.set(p.id, { pos: anchor.clone().add(leafOffset), accent });
    });
    return m;
  }, [branchTipById, curve]);

  useFrame((_, delta) => {
    if (!groupRef.current || !ring1Ref.current || !ring2Ref.current) return;
    const s = scrollRef.current;

    let target: { pos: THREE.Vector3; accent: string } | null = null;
    if (s.activeKind === "experience") {
      const t = branchTipById.get(s.activeId);
      if (t) target = { pos: t.tip, accent: t.accent };
    } else {
      const l = leafPosById.get(s.activeId);
      if (l) target = { pos: l.pos, accent: l.accent };
    }

    const damp = 1 - Math.exp(-delta * 4);
    if (target) {
      tmp.current.copy(target.pos);
      groupRef.current.position.lerp(tmp.current, damp);
      tmpColor.current.set(target.accent);
      const m1 = ring1Ref.current.material as THREE.MeshBasicMaterial;
      const m2 = ring2Ref.current.material as THREE.MeshBasicMaterial;
      m1.color.lerp(tmpColor.current, damp);
      m2.color.lerp(tmpColor.current, damp);
    }

    const t = performance.now() * 0.001;
    const expFactor = s.activeKind === "experience" ? 1.4 : 0.85;
    ring1Ref.current.scale.setScalar((1.2 + Math.sin(t * 1.4) * 0.15) * expFactor);
    ring2Ref.current.scale.setScalar((1.9 + Math.cos(t) * 0.18) * expFactor);
    ring1Ref.current.rotation.z = t * 0.5;
    ring2Ref.current.rotation.z = -t * 0.35;
    ring1Ref.current.rotation.x = -Math.PI / 2 + Math.sin(t * 0.7) * 0.4;
    ring2Ref.current.rotation.x = -Math.PI / 2 + Math.cos(t * 0.6) * 0.4;
  });

  return (
    <group ref={groupRef}>
      {/* Outer ring — the obvious "you are here" hoop */}
      <mesh ref={ring1Ref}>
        <ringGeometry args={[0.95, 1.05, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref}>
        <ringGeometry args={[0.78, 0.84, 64]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.32} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * BarkBump + Beacon —
 *   - A bright bud-like sphere that "swells out of the bark" at the
 *     active branch tip / leaf, so the selected node screams
 *     "this is what you're reading"
 *   - A small downward beacon cone above it, like a map pin
 * ========================================================================= */
function BarkBumpBeacon({ scrollRef }: TerrainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bumpRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const beaconRef = useRef<THREE.Mesh>(null);
  const tmp = useRef(new THREE.Vector3());
  const tmpColor = useRef(new THREE.Color());

  const curve = useMemo(() => makeTrunkCurve(), []);

  // Reuse the same lookups as ActiveCorona
  const branchTipById = useMemo(() => {
    const m = new Map<string, { tip: THREE.Vector3; accent: string }>();
    EXPERIENCES.forEach((exp, i) => {
      const startPt = trunkPointAtYear(curve, exp.start);
      const angle = i * 2.3998;
      const tenure = Math.max(1, expEnd(exp) - exp.start);
      const branchLen = 4 + tenure * 1.4;
      const dir = new THREE.Vector3(Math.cos(angle), 0.1, Math.sin(angle)).normalize();
      const tip = startPt.clone().add(dir.clone().multiplyScalar(branchLen));
      m.set(exp.id, { tip, accent: ERAS[exp.era].accent });
    });
    return m;
  }, [curve]);

  const leafPosById = useMemo(() => {
    const m = new Map<string, { pos: THREE.Vector3; accent: string }>();
    PROJECTS.forEach((p, i) => {
      let anchor: THREE.Vector3;
      let parentDir: THREE.Vector3;
      let accent: string;
      const parent = p.parentExperienceId
        ? branchTipById.get(p.parentExperienceId)
        : null;
      if (parent) {
        const exp = EXPERIENCES.find((e) => e.id === p.parentExperienceId)!;
        const startPt = trunkPointAtYear(curve, exp.start);
        const u = Math.max(0.15, Math.min(0.95, (p.year - exp.start) / Math.max(1, expEnd(exp) - exp.start)));
        anchor = startPt.clone().lerp(parent.tip, u);
        parentDir = parent.tip.clone().sub(startPt).normalize();
        accent = parent.accent;
      } else {
        anchor = trunkPointAtYear(curve, p.year);
        parentDir = new THREE.Vector3(0, 1, 0);
        accent = ERAS[p.era].accent;
      }
      const offsetDir = parentDir.clone().add(new THREE.Vector3(0, -0.4, 0)).normalize();
      const sideAxis = new THREE.Vector3(0, 1, 0).cross(parentDir).normalize().multiplyScalar(0.8);
      const sideSign = i % 2 === 0 ? 1 : -1;
      const leafOffset = offsetDir
        .multiplyScalar(0.7)
        .add(sideAxis.multiplyScalar(sideSign * 0.6))
        .add(new THREE.Vector3(0, -0.5, 0));
      m.set(p.id, { pos: anchor.clone().add(leafOffset), accent });
    });
    return m;
  }, [branchTipById, curve]);

  useFrame((_, delta) => {
    if (!groupRef.current || !bumpRef.current || !innerRef.current || !beaconRef.current) return;
    const s = scrollRef.current;

    let target: { pos: THREE.Vector3; accent: string } | null = null;
    if (s.activeKind === "experience") {
      const t = branchTipById.get(s.activeId);
      if (t) target = { pos: t.tip, accent: t.accent };
    } else {
      const l = leafPosById.get(s.activeId);
      if (l) target = { pos: l.pos, accent: l.accent };
    }

    const damp = 1 - Math.exp(-delta * 5);
    if (target) {
      tmp.current.copy(target.pos);
      groupRef.current.position.lerp(tmp.current, damp);
      tmpColor.current.set(target.accent);
      [bumpRef, innerRef, beaconRef].forEach((r) => {
        if (!r.current) return;
        const m = r.current.material as THREE.MeshStandardMaterial | THREE.MeshBasicMaterial;
        if ("color" in m) m.color.lerp(tmpColor.current, damp);
        if ((m as THREE.MeshStandardMaterial).emissive) {
          (m as THREE.MeshStandardMaterial).emissive.lerp(tmpColor.current, damp);
        }
      });
    }

    const t = performance.now() * 0.001;
    // Outer "swelling" sphere — like a bud emerging from the bark
    const bumpScale = 1.25 + Math.sin(t * 2.4) * 0.18;
    bumpRef.current.scale.setScalar(s.activeKind === "experience" ? bumpScale * 1.15 : bumpScale);
    const bumpMat = bumpRef.current.material as THREE.MeshStandardMaterial;
    bumpMat.emissiveIntensity = 1.6 + Math.sin(t * 2) * 0.4;
    // Inner solid bud
    const innerScale = 0.55 + Math.sin(t * 3) * 0.05;
    innerRef.current.scale.setScalar(innerScale);
    // Beacon hovering above the bud — bobs up and down
    beaconRef.current.position.y = 1.4 + Math.sin(t * 1.6) * 0.12;
    beaconRef.current.rotation.y = t * 1.2;
    const beaconMat = beaconRef.current.material as THREE.MeshBasicMaterial;
    beaconMat.opacity = 0.7 + Math.sin(t * 1.8) * 0.18;
  });

  return (
    <group ref={groupRef}>
      {/* Outer translucent swelling — the "bark bump" */}
      <mesh ref={bumpRef}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={1.6}
          transparent
          opacity={0.35}
          roughness={0.4}
          metalness={0.2}
          depthWrite={false}
        />
      </mesh>
      {/* Inner solid bud — the bright core */}
      <mesh ref={innerRef}>
        <icosahedronGeometry args={[0.32, 1]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={2.4}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {/* Floating downward beacon — like a map pin pointing at this node */}
      <mesh ref={beaconRef} position={[0, 1.4, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.22, 0.55, 16, 1, true]} />
        <meshBasicMaterial
          color="#ffffff"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * Era transition ritual:
 *   1. Pollen burst from the trunk at the active year
 *   2. Concentric glow ring expanding from the trunk (era's signature wave)
 *   3. Brief trunk-segment flash above/below the active y
 * ========================================================================= */
function EraTransitionRitual({ scrollRef }: TerrainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);
  const flashRef = useRef<THREE.Mesh>(null);
  const lastEraRef = useRef<string>("");
  const triggerTimeRef = useRef<number>(-1);
  const colorRef = useRef(new THREE.Color());

  const curve = useMemo(() => makeTrunkCurve(), []);

  useFrame(() => {
    const s = scrollRef.current;
    const era = ERAS[s.activeEra as keyof typeof ERAS];
    if (!era || !groupRef.current) return;
    if (s.activeEra !== lastEraRef.current && lastEraRef.current !== "") {
      triggerTimeRef.current = performance.now();
      colorRef.current.set(era.accent);
    }
    if (s.activeEra !== lastEraRef.current) {
      lastEraRef.current = s.activeEra;
      const trunkP = trunkPointAtYear(curve, s.activeYear);
      groupRef.current.position.copy(trunkP);
    }

    if (triggerTimeRef.current < 0) {
      groupRef.current.visible = false;
      return;
    }
    const elapsed = (performance.now() - triggerTimeRef.current) / 1000;
    if (elapsed > 3.0) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;

    // Concentric expanding rings (horizontal, like ripples on water)
    if (ring1Ref.current) {
      const r = 0.5 + elapsed * 12;
      ring1Ref.current.scale.set(r, r, 1);
      const m = ring1Ref.current.material as THREE.MeshBasicMaterial;
      m.color.copy(colorRef.current);
      m.opacity = Math.max(0, 0.7 - elapsed / 2.6);
    }
    if (ring2Ref.current) {
      const r = 0.5 + Math.max(0, elapsed - 0.4) * 9;
      ring2Ref.current.scale.set(r, r, 1);
      const m = ring2Ref.current.material as THREE.MeshBasicMaterial;
      m.color.copy(colorRef.current);
      m.opacity = Math.max(0, 0.5 - elapsed / 2.4);
    }
    // Vertical trunk flash — a glowing capsule that pulses up the trunk
    if (flashRef.current) {
      const m = flashRef.current.material as THREE.MeshBasicMaterial;
      m.color.copy(colorRef.current);
      const k = Math.max(0, 1 - elapsed / 1.5);
      m.opacity = k * 0.85;
      flashRef.current.scale.set(1 + k * 0.5, 1 + elapsed * 1.6, 1 + k * 0.5);
    }
  });

  return (
    <group ref={groupRef} visible={false}>
      <mesh ref={ring1Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[0.95, 1.05, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={ring2Ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]}>
        <ringGeometry args={[0.78, 0.84, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={flashRef}>
        <cylinderGeometry args={[0.85, 0.85, 1.4, 24, 1, true]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * Era transition pollen burst (replaces shockwave)
 * ========================================================================= */
function EraPollenBurst({ scrollRef }: TerrainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const lastEraRef = useRef<string>("");
  const triggerTimeRef = useRef<number>(-1);
  const colorRef = useRef(new THREE.Color());

  const curve = useMemo(() => makeTrunkCurve(), []);

  useFrame(() => {
    const s = scrollRef.current;
    const era = ERAS[s.activeEra as keyof typeof ERAS];
    if (!era || !groupRef.current) return;
    if (s.activeEra !== lastEraRef.current) {
      triggerTimeRef.current = performance.now();
      lastEraRef.current = s.activeEra;
      colorRef.current.set(era.accent);
      // Anchor at the trunk position for the active year
      const trunkP = trunkPointAtYear(curve, s.activeYear);
      groupRef.current.position.copy(trunkP);
    }
    const elapsed = (performance.now() - triggerTimeRef.current) / 1000;
    if (triggerTimeRef.current < 0 || elapsed > 2.4) {
      groupRef.current.visible = false;
      return;
    }
    groupRef.current.visible = true;
    // Move children outward
    const children = groupRef.current.children;
    children.forEach((child, i) => {
      const angle = (i / children.length) * Math.PI * 2;
      const radius = elapsed * 8;
      child.position.set(
        Math.cos(angle) * radius,
        Math.sin(elapsed * 2 + i) * radius * 0.4 + elapsed * 4,
        Math.sin(angle) * radius,
      );
      const m = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      m.color.copy(colorRef.current);
      m.opacity = Math.max(0, 0.9 - elapsed / 2.4);
    });
  });

  return (
    <group ref={groupRef} visible={false}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.12, 6, 6]} />
          <meshBasicMaterial
            color="#ffffff"
            transparent
            opacity={0.9}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================================
 * Stars — fade in only at the canopy (p > 0.7), so the forest below stays
 * a forest and the space-feel arrives only when we reach the sky.
 * ========================================================================= */
function CanopyStars({ scrollRef }: TerrainProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const { positions, colors } = useMemo(() => {
    const COUNT = 1200;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const palette = ["#cbd6ff", "#ffe7c0", "#a6f0ff", "#ffd0e9"];
    for (let i = 0; i < COUNT; i++) {
      // Sphere shell concentrated above the tree top (y > 35), wide radius
      const r = 60 + Math.random() * 90;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(0.4 - Math.random() * 0.6); // bias upward
      positions[i * 3] = Math.cos(theta) * Math.sin(phi) * r;
      positions[i * 3 + 1] = Math.cos(phi) * r + 30;
      positions[i * 3 + 2] = Math.sin(theta) * Math.sin(phi) * r;
      const c = new THREE.Color(palette[Math.floor(Math.random() * palette.length)]);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    return { positions, colors };
  }, []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

  useFrame(() => {
    if (!pointsRef.current) return;
    const p = scrollRef.current.progress;
    // Visible only above ~0.65, fully opaque past ~0.92
    const visibility = Math.max(0, Math.min(1, (p - 0.65) / 0.27));
    const mat = pointsRef.current.material as THREE.PointsMaterial;
    mat.opacity = visibility * 0.9;
    pointsRef.current.visible = visibility > 0.01;
    // Slow rotation gives a galaxy feel
    pointsRef.current.rotation.y = performance.now() * 0.00003;
  });

  return (
    <points ref={pointsRef} geometry={geometry} visible={false}>
      <pointsMaterial
        size={0.7}
        vertexColors
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* =========================================================================
 * Aurora ribbons — diffuse glowing planes that fade in at the canopy
 * to enhance the "space" feel without going full sci-fi.
 * ========================================================================= */
function AuroraSky({ scrollRef }: TerrainProps) {
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(() => {
    const p = scrollRef.current.progress;
    const visibility = Math.max(0, Math.min(1, (p - 0.7) / 0.25));
    const t = performance.now() * 0.0003;
    meshRefs.current.forEach((m, i) => {
      if (!m) return;
      m.visible = visibility > 0.01;
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = visibility * (0.18 + Math.sin(t * 1.3 + i) * 0.07);
      m.rotation.z = t * 0.18 + i;
    });
  });
  const layers = useMemo(
    () => [
      { color: "#7da0ff", y: 70, scale: 1 },
      { color: "#a08bff", y: 78, scale: 1.2 },
      { color: "#ff9bdc", y: 86, scale: 0.8 },
    ],
    [],
  );
  return (
    <group>
      {layers.map((l, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={[0, l.y, 0]}
          rotation={[Math.PI / 2.4, 0, 0]}
          visible={false}
        >
          <planeGeometry args={[160 * l.scale, 80 * l.scale, 1, 1]} />
          <meshBasicMaterial
            color={l.color}
            transparent
            opacity={0}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

/* =========================================================================
 * Below-camera fade — additive dark fog disc that grows under the camera
 * to hide low-trunk debris once we've climbed past it.
 * ========================================================================= */
function UnderFloor({ scrollRef }: TerrainProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => makeTrunkCurve(), []);
  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return;
    const s = scrollRef.current;
    const p = s.progress;
    // Disc tracks the active node's y minus a bit, so anything well below
    // the active reading point gets visually muted.
    const trunkP = trunkPointAtYear(curve, s.activeYear);
    const targetY = Math.max(0, trunkP.y - 8);
    groupRef.current.position.y +=
      (targetY - groupRef.current.position.y) * 0.08;
    const mat = meshRef.current.material as THREE.MeshBasicMaterial;
    mat.opacity = Math.min(0.85, Math.max(0, p - 0.15) * 1.4);
  });
  return (
    <group ref={groupRef}>
      <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[80, 64]} />
        <meshBasicMaterial color="#0a1620" transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* =========================================================================
 * LifeChapterRings — bark rings around the trunk for each "where I lived"
 * chapter, plus a billboarded HTML tag listing the city/region.
 * The active chapter (the one whose range contains the current scroll year)
 * pulses; the others sit quietly.
 * ========================================================================= */
function LifeChapterRings({ scrollRef }: TerrainProps) {
  const ringRefs = useRef<(THREE.Mesh | null)[]>([]);
  const tagRefs = useRef<(HTMLDivElement | null)[]>([]);

  const data = useMemo(() => {
    const curve = makeTrunkCurve();
    return LIFE_CHAPTERS.map((c) => {
      const startY = yearToY(c.start);
      const endY = yearToY(c.end === "present" ? LAST_YEAR : c.end);
      const midY = (startY + endY) / 2;
      // Anchor at the trunk's center for that mid-year so rings feel
      // like real bark sliced at that age.
      const startPt = trunkPointAtYear(curve, c.start);
      const endPt = trunkPointAtYear(curve, c.end === "present" ? LAST_YEAR : c.end);
      const midPt = startPt.clone().lerp(endPt, 0.5);
      midPt.y = midY;
      return { c, startY, endY, midY, midPt };
    });
  }, []);

  useFrame((_, delta) => {
    const s = scrollRef.current;
    const t = performance.now() * 0.001;
    const activeYear = s.activeYear;
    // Mirror lifeChapterAtYear semantics: a transition year belongs to the
    // chapter that *starts* at that year, otherwise [start, end) inclusive.
    const startingIdx = data.findIndex((d) => d.c.start === activeYear);
    data.forEach((d, i) => {
      const ring = ringRefs.current[i];
      const containsYear =
        activeYear >= d.c.start &&
        activeYear < (d.c.end === "present" ? LAST_YEAR : d.c.end);
      const isActive =
        startingIdx >= 0 ? startingIdx === i : containsYear;
      if (ring) {
        const m = ring.material as THREE.MeshBasicMaterial;
        const targetOpacity = isActive ? 0.85 : 0.18;
        const damp = 1 - Math.exp(-delta * 4);
        m.opacity += (targetOpacity - m.opacity) * damp;
        const breath = isActive ? 1 + Math.sin(t * 1.6 + i) * 0.07 : 1;
        ring.scale.set(breath, 1, breath);
      }
      const tag = tagRefs.current[i];
      if (tag) {
        tag.style.opacity = String(isActive ? 1 : 0.35);
        tag.classList.toggle("lc-tag-active", isActive);
      }
    });
  });

  return (
    <group>
      {data.map((d, i) => (
        <group key={d.c.id} position={[0, d.midY, 0]}>
          {/* Glowing bark ring — bigger than the trunk's radius */}
          <mesh
            ref={(el) => { ringRefs.current[i] = el; }}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[d.midPt.x, 0, d.midPt.z]}
          >
            <ringGeometry args={[TRUNK_RADIUS * 1.15, TRUNK_RADIUS * 1.4, 48]} />
            <meshBasicMaterial
              color={d.c.accent}
              transparent
              opacity={0.18}
              side={THREE.DoubleSide}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* HTML billboarded tag — small chip with the chapter's headline */}
          <Billboard
            position={[d.midPt.x + 1.4, d.midY + 0.5, d.midPt.z + 1.4]}
            follow
          >
            <Html center distanceFactor={28} style={{ pointerEvents: "none" }}>
              <div
                ref={(el) => { tagRefs.current[i] = el; }}
                className="lc-tag"
                style={{ ["--lc-color" as string]: d.c.accent }}
              >
                <span className="lc-tag-dot" />
                <span className="lc-tag-label">{d.c.label.tr}</span>
                <span className="lc-tag-range">
                  {d.c.start}–{d.c.end === "present" ? "" : String(d.c.end).slice(2)}
                </span>
              </div>
            </Html>
          </Billboard>
        </group>
      ))}
    </group>
  );
}

/* =========================================================================
 * Master tree scene
 * ========================================================================= */
export function Terrain({ scrollRef }: TerrainProps) {
  return (
    <group>
      <ForestGround />
      <Trunk />
      <Branches scrollRef={scrollRef} />
      <Leaves scrollRef={scrollRef} />
      <LifeChapterRings scrollRef={scrollRef} />
      <Pollen />
      <CanopyStars scrollRef={scrollRef} />
      <AuroraSky scrollRef={scrollRef} />
      <UnderFloor scrollRef={scrollRef} />
      <ActiveCorona scrollRef={scrollRef} />
      <BarkBumpBeacon scrollRef={scrollRef} />
      <EraTransitionRitual scrollRef={scrollRef} />
      <EraPollenBurst scrollRef={scrollRef} />
    </group>
  );
}

/* =========================================================================
 * Camera: climbs the tree, orbits around it, and tilts its gaze upward
 * as we approach the canopy. The end of the journey becomes a cosmic
 * arrival rather than a tree-top look-up.
 * ========================================================================= */
export function ScrollDrivenCamera({ scrollRef }: { scrollRef: React.MutableRefObject<ScrollState> }) {
  const tmp = useRef(new THREE.Vector3());
  const lookTarget = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());

  const curve = useMemo(() => makeTrunkCurve(), []);

  useFrame((state, delta) => {
    const s = scrollRef.current;
    const p = s.progress;

    // Camera height tracks the active year so the active node is always
    // roughly horizontal from the camera (no more "looking up at the canopy
    // from the ground" once we're high in the tree).
    const trunkAt = trunkPointAtYear(curve, s.activeYear);
    // Sit a touch above the active node so the bark below stays visible
    // but the active node is in the upper third of the frame.
    const climbY = trunkAt.y + 4 + p * 4;

    // Orbit around the trunk. Radius slightly opens up near the canopy so
    // we can see the sky around the tree, but capped so the tree stays
    // big in frame.
    const t = performance.now() * 0.00025;
    const orbitT = t + p * Math.PI * 1.2;
    const baseRadius = s.activeKind === "experience" ? 14 : 11;
    const radius = baseRadius + Math.max(0, p - 0.6) * 4; // gentler than before
    const orbitX = Math.cos(orbitT) * radius;
    const orbitZ = Math.sin(orbitT) * radius;

    // Look-at: locked on the active item. The "reach the sky" feeling
    // comes from background/Stars/Aurora taking over, NOT from rotating
    // the gaze off the tree.
    lookTarget.current.copy(trunkAt);
    if (s.activeKind === "project") lookTarget.current.y -= 0.5;
    // A very small upward bias near the very top so we hint at the sky,
    // but never enough to drop the tree out of frame.
    const skyHint = Math.max(0, p - 0.85) * 8;
    lookTarget.current.y += skyHint;

    tmp.current.set(orbitX, climbY, orbitZ);

    const baseDamp = s.activeKind === "experience" ? 3.4 : 4.4;
    const damp = 1 - Math.exp(-delta * baseDamp);
    state.camera.position.lerp(tmp.current, damp);
    currentLook.current.lerp(lookTarget.current, damp);
    state.camera.lookAt(currentLook.current);
  });

  return null;
}

export { yearToY, eraIndexAtY, TRUNK_HEIGHT };
