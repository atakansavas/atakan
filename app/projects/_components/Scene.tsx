"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { EraDioramas, EraTargetTracker } from "./EraDioramas";
import type { ScrollState } from "../_lib/scroll";

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

function OrbitedScene({ scrollRef }: Props) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // OrbitControls' wheel zoom is disabled below (enableZoom={false}) so
  // wheel events fall through to the page-level handler in page.tsx,
  // which now drives the one-wheel-per-era carousel.

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
