import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

export function useScene2() {
  const meshesRef = useRef([]);
  const rotationSpeedsRef = useRef([]);

  const scene2 = useMemo(() => {
    return new THREE.Scene();
  }, []);

  const camera2 = useMemo(() => {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 5);
    return camera;
  }, []);

  const renderTarget = useMemo(() => {
    return new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight);
  }, []);

  useEffect(() => {
    // Add lights once
    const light = new THREE.AmbientLight(0xffffff, 0.5);
    scene2.add(light);

    const light2 = new THREE.DirectionalLight(0xffffff, 1.5);
    light2.position.set(1, 1, 0.866);
    scene2.add(light2);

    // Add meshes
    const num = 50;
    const meshes = [];

    for (let i = 0; i < num; i++) {
      const size = random(0.5, 0.9);
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshPhysicalMaterial({ color: "white" })
      );
      mesh.position.set(random(-3, 3), random(-3, 3), random(-3, 3));
      mesh.rotation.set(
        random(0, Math.PI),
        random(0, Math.PI),
        random(0, Math.PI)
      );
      scene2.add(mesh);
      meshes.push(mesh);
    }

    meshesRef.current = meshes;
  }, [scene2]);

  const speed = 0.5;

  // Animation function to be called from useFrame
  const animateCubes = (time, delta) => {
    meshesRef.current.forEach((mesh, index) => {
      mesh.rotation.x = Math.sin(mesh.position.x * time) * speed;
      mesh.rotation.y = Math.sin(mesh.position.y * time) * speed;
      mesh.rotation.z = Math.sin(mesh.position.z * time) * speed;
    });
  };

  return { scene2, camera2, renderTarget, animateCubes };
}
