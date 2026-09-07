"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type ThreeAmbientSceneProps = {
  className?: string;
  intensity?: number;
};

const PARTICLE_COUNT = 720;
const RING_SEGMENTS = 96;

/**
 * Lightweight local visual layer for the TLTP hero surface. It stays isolated
 * from the feed and submission flow so it can be tuned independently.
 */
export function ThreeAmbientScene({
  className = "pointer-events-none absolute inset-0 overflow-hidden",
  intensity = 1,
}: ThreeAmbientSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || typeof window === "undefined") return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 20);
    camera.position.set(0, 0, 4.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.domElement.setAttribute("aria-hidden", "true");
    renderer.domElement.style.display = "block";
    renderer.domElement.style.pointerEvents = "none";
    mount.appendChild(renderer.domElement);

    const safeIntensity = THREE.MathUtils.clamp(intensity, 0.25, 1.5);
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const baseX = new Float32Array(PARTICLE_COUNT);
    const baseY = new Float32Array(PARTICLE_COUNT);
    const baseZ = new Float32Array(PARTICLE_COUNT);
    const phases = new Float32Array(PARTICLE_COUNT);
    const speeds = new Float32Array(PARTICLE_COUNT);

    for (let index = 0; index < PARTICLE_COUNT; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.sqrt(Math.random()) * 2.6;
      const x = Math.cos(angle) * radius * 1.35;
      const y = Math.sin(angle) * radius * 0.78;
      const z = (Math.random() - 0.5) * 1.6;

      baseX[index] = x;
      baseY[index] = y;
      baseZ[index] = z;
      phases[index] = Math.random() * Math.PI * 2;
      speeds[index] = 0.35 + Math.random() * 0.5;

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;
    }

    const particleGeometry = new THREE.BufferGeometry();
    const particlePosition = new THREE.BufferAttribute(positions, 3);
    particleGeometry.setAttribute("position", particlePosition);

    const particleMaterial = new THREE.PointsMaterial({
      color: 0xffc46a,
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.58 * safeIntensity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const orbitGroup = new THREE.Group();
    const orbitMaterials: THREE.LineBasicMaterial[] = [];
    const orbitGeometries: THREE.BufferGeometry[] = [];

    for (let ringIndex = 0; ringIndex < 3; ringIndex += 1) {
      const ringPositions = new Float32Array(RING_SEGMENTS * 3);
      const radiusX = 1.35 + ringIndex * 0.32;
      const radiusY = 0.56 + ringIndex * 0.18;

      for (let pointIndex = 0; pointIndex < RING_SEGMENTS; pointIndex += 1) {
        const angle = (pointIndex / RING_SEGMENTS) * Math.PI * 2;
        ringPositions[pointIndex * 3] = Math.cos(angle) * radiusX;
        ringPositions[pointIndex * 3 + 1] = Math.sin(angle) * radiusY;
        ringPositions[pointIndex * 3 + 2] = (ringIndex - 1) * 0.24;
      }

      const ringGeometry = new THREE.BufferGeometry();
      ringGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(ringPositions, 3),
      );
      const ringMaterial = new THREE.LineBasicMaterial({
        color: ringIndex === 1 ? 0xf97316 : 0xfbbf24,
        transparent: true,
        opacity: (0.075 - ringIndex * 0.012) * safeIntensity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const ring = new THREE.LineLoop(ringGeometry, ringMaterial);
      ring.rotation.x = ringIndex * 0.34 - 0.34;
      ring.rotation.y = ringIndex * 0.27;
      orbitGroup.add(ring);
      orbitGeometries.push(ringGeometry);
      orbitMaterials.push(ringMaterial);
    }

    scene.add(orbitGroup);

    const pointer = new THREE.Vector2();
    const pointerTarget = new THREE.Vector2();
    const timer = new THREE.Timer();
    timer.connect(document);
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let animationFrame = 0;

    const resize = () => {
      const width = Math.max(mount.clientWidth, 1);
      const height = Math.max(mount.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const updatePointer = (event: PointerEvent) => {
      const bounds = mount.getBoundingClientRect();
      pointerTarget.x = THREE.MathUtils.clamp(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        -1,
        1,
      );
      pointerTarget.y = THREE.MathUtils.clamp(
        -(((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 - 1),
        -1,
        1,
      );
    };

    const resetPointer = () => {
      pointerTarget.set(0, 0);
    };

    const render = (timestamp?: number) => {
      timer.update(timestamp);
      const elapsed = timer.getElapsed();
      pointer.lerp(pointerTarget, 0.045);

      const particleArray = particlePosition.array as Float32Array;
      for (let index = 0; index < PARTICLE_COUNT; index += 1) {
        const offset = index * 3;
        const phase = phases[index];
        const speed = speeds[index];

        particleArray[offset] =
          baseX[index] + Math.sin(elapsed * speed * 0.18 + phase) * 0.055;
        particleArray[offset + 1] =
          baseY[index] + Math.cos(elapsed * speed * 0.2 + phase) * 0.045;
        particleArray[offset + 2] =
          baseZ[index] + Math.sin(elapsed * speed * 0.12 + phase) * 0.035;
      }
      particlePosition.needsUpdate = true;

      particles.rotation.y = elapsed * 0.025 + pointer.x * 0.08;
      particles.rotation.x = Math.sin(elapsed * 0.16) * 0.035 + pointer.y * 0.05;
      orbitGroup.rotation.z = elapsed * 0.035 + pointer.x * 0.035;
      orbitGroup.rotation.x = Math.sin(elapsed * 0.12) * 0.04;

      camera.position.x += (pointer.x * 0.12 - camera.position.x) * 0.035;
      camera.position.y += (pointer.y * 0.08 - camera.position.y) * 0.035;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);

      if (!prefersReducedMotion) {
        animationFrame = window.requestAnimationFrame(render);
      }
    };

    resize();
    mount.addEventListener("pointermove", updatePointer, { passive: true });
    mount.addEventListener("pointerleave", resetPointer, { passive: true });

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(mount);
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      mount.removeEventListener("pointermove", updatePointer);
      mount.removeEventListener("pointerleave", resetPointer);
      particleGeometry.dispose();
      particleMaterial.dispose();
      orbitGeometries.forEach((geometry) => geometry.dispose());
      orbitMaterials.forEach((material) => material.dispose());
      renderer.dispose();
      timer.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [intensity]);

  return <div ref={mountRef} aria-hidden="true" className={className} />;
}

export default ThreeAmbientScene;
