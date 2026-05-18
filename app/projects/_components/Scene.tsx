"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EraDioramas, EraTargetTracker } from "./EraDioramas";
import type { ScrollState } from "../_lib/scroll";

// Camera-distance clamps for the custom zoom controller. The scene reads
// nicely between roughly half its default distance and ~1.75x out.
const ZOOM_MIN_DISTANCE = 9;
const ZOOM_MAX_DISTANCE = 42;
const ZOOM_DEFAULT_DISTANCE = 22;

export type ProjectsZoomDetail = {
  // "step" applies a relative dolly (factor < 1 = zoom in, > 1 = zoom out).
  // "reset" snaps camera distance back to the default.
  // "wheel" passes a raw wheel deltaY for fine-grained zoom.
  mode: "step" | "reset" | "wheel";
  factor?: number;
  deltaY?: number;
};

type Props = {
  scrollRef: React.MutableRefObject<ScrollState>;
};

/**
 * Inside the canvas, animate the scene background and fog from a quiet
 * night-city (early eras) to deep neon (late eras), matching the diorama
 * progression from CRT to AI lab.
 */
function SkyAtmosphere({ scrollRef }: Props) {
  const { scene } = useThree();
  const earlyColor = new THREE.Color("#0a0e1a");
  const lateColor = new THREE.Color("#080814");
  const tmp = new THREE.Color();

  useFrame(() => {
    const p = scrollRef.current.progress;
    tmp.copy(earlyColor).lerp(lateColor, p);
    if (scene.background instanceof THREE.Color) {
      scene.background.copy(tmp);
    } else {
      scene.background = tmp.clone();
    }
    if (scene.fog instanceof THREE.FogExp2) {
      // Thin fog so the dioramas read crisply.
      scene.fog.density = 0.012;
      scene.fog.color.copy(tmp);
    }
  });

  return null;
}

/**
 * ZoomInterpolator — runs every frame, smoothly lerping the camera's
 * distance from the orbit target toward `targetRef.current`. The lerp
 * factor uses the framerate-independent `1 - exp(-k * dt)` form so the
 * glide feels the same on a 60Hz vs 120Hz display. Once the distance
 * settles within ~0.01 of the target, the ref is cleared so we don't
 * fight `EraTargetTracker` during era transitions.
 */
function ZoomInterpolator({
  controlsRef,
  targetRef,
  smoothRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  targetRef: React.MutableRefObject<number | null>;
  smoothRef: React.MutableRefObject<number>;
}) {
  useFrame((_, delta) => {
    const ctrl = controlsRef.current;
    const target = targetRef.current;
    if (!ctrl || target == null) return;
    const cam = ctrl.object as THREE.PerspectiveCamera;
    const offset = cam.position.clone().sub(ctrl.target);
    const dist = offset.length();
    if (dist < 1e-4) return;
    const k = 1 - Math.exp(-smoothRef.current * delta);
    const next = dist + (target - dist) * k;
    offset.setLength(next);
    cam.position.copy(ctrl.target).add(offset);
    ctrl.update();
    if (Math.abs(next - target) < 0.01) {
      targetRef.current = null;
    }
  });
  return null;
}

function OrbitedScene({ scrollRef }: Props) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  // Zoom is driven by `projects-zoom` CustomEvents (buttons, +/- keys,
  // Cmd/Ctrl+wheel, pinch). Instead of snapping camera distance instantly,
  // we store a target distance here and a useFrame ramps the actual
  // distance toward it each frame — gives a cinematic glide on button
  // presses and a tight follow on continuous wheel/pinch input.
  const zoomTargetRef = useRef<number | null>(null);
  // Per-event smoothing factor: buttons + keys = slow glide, raw
  // wheel/pinch = nearly 1:1 so the camera tracks the gesture.
  const zoomSmoothRef = useRef<number>(6); // higher = faster catch-up

  useEffect(() => {
    const onZoom = (e: Event) => {
      const ctrl = controlsRef.current;
      if (!ctrl) return;
      const detail = (e as CustomEvent<ProjectsZoomDetail>).detail;
      if (!detail) return;
      const cam = ctrl.object as THREE.PerspectiveCamera;
      // Compound from the *target* (not current camera distance) so
      // rapid clicks keep stepping in the same direction even while the
      // glide is still in flight.
      const baseDist =
        zoomTargetRef.current ?? cam.position.distanceTo(ctrl.target);
      let nextDist = baseDist;
      if (detail.mode === "reset") {
        nextDist = ZOOM_DEFAULT_DISTANCE;
        zoomSmoothRef.current = 5; // slightly slower for the reset glide
      } else if (detail.mode === "step") {
        nextDist = baseDist * (detail.factor ?? 1);
        zoomSmoothRef.current = 7; // smooth glide for button/key presses
      } else if (detail.mode === "wheel") {
        const k = Math.exp((detail.deltaY ?? 0) * 0.0018);
        nextDist = baseDist * k;
        zoomSmoothRef.current = 16; // near-instant for continuous input
      }
      zoomTargetRef.current = Math.max(
        ZOOM_MIN_DISTANCE,
        Math.min(ZOOM_MAX_DISTANCE, nextDist),
      );
    };
    window.addEventListener("projects-zoom", onZoom as EventListener);
    return () =>
      window.removeEventListener("projects-zoom", onZoom as EventListener);
  }, []);

  return (
    <>
      {/* Soft moonlight from above */}
      <ambientLight intensity={0.55} color="#bcc4d8" />
      <directionalLight
        position={[24, 30, 18]}
        intensity={0.95}
        color="#f0f4ff"
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-near={0.5}
        shadow-camera-far={120}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={40}
        shadow-camera-bottom={-2}
      />
      {/* warm bottom rim */}
      <pointLight position={[0, 1, 6]} intensity={0.4} distance={20} color="#ff9b6b" />

      <EraDioramas scrollRef={scrollRef} />
      <SkyAtmosphere scrollRef={scrollRef} />
      <ZoomInterpolator
        controlsRef={controlsRef}
        targetRef={zoomTargetRef}
        smoothRef={zoomSmoothRef}
      />

      {/* Drag rotates around the active diorama; scroll wheel passes through
         to the page (enableZoom=false), pinch-to-zoom still works on touch.
         The target itself is animated by EraTargetTracker so the camera
         glides between dioramas as the active era changes. */}
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enableRotate
        enablePan={false}
        rotateSpeed={0.55}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.55}
        makeDefault
      />
      <EraTargetTracker scrollRef={scrollRef} controlsRef={controlsRef} />
    </>
  );
}

export default function Scene({ scrollRef }: Props) {
  return (
    <Canvas
      shadows
      // Low DPR + canvas CSS image-rendering: pixelated → that crisp
      // chunky look. We trade detail for character.
      dpr={0.7}
      frameloop="always"
      camera={{ fov: 42, near: 0.1, far: 600, position: [14, 11, 18] }}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl, scene }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
        scene.fog = new THREE.FogExp2("#0a0e1a", 0.012);
      }}
      style={{ imageRendering: "pixelated" }}
    >
      <color attach="background" args={["#0a0e1a"]} />
      <OrbitedScene scrollRef={scrollRef} />
    </Canvas>
  );
}
