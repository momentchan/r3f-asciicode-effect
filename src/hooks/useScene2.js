import { useMemo, useEffect, useRef } from "react";
import * as THREE from "three";

const random = (min, max) => {
  return Math.random() * (max - min) + min;
};

export function useScene2() {
  const meshesRef = useRef([]);
  const lightsRef = useRef([]);

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

    // Add lights
    const light = new THREE.AmbientLight(0xffffff, 0.05);
    scene2.add(light);
    lightsRef.current.push(light);

    const light2 = new THREE.DirectionalLight(0xffffff, 2.5);
    light2.position.set(1, 1, 0.866);
    scene2.add(light2);
    lightsRef.current.push(light2);

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

    // Cleanup function
    return () => {
      // Remove meshes
      meshesRef.current.forEach((mesh) => {
        mesh.geometry.dispose();
        mesh.material.dispose();
        scene2.remove(mesh);
      });
      meshesRef.current = [];

      // Remove lights
      lightsRef.current.forEach((light) => {
        scene2.remove(light);
        if (light.dispose) light.dispose();
      });
      lightsRef.current = [];
    };
  }, [scene2]);

  const speed = 2.5;

  // Animation function to be called from useFrame
  const animateCubes = (time, delta) => {
    meshesRef.current.forEach((mesh, index) => {
      mesh.rotation.x = Math.sin(mesh.position.x + time * speed);
      mesh.rotation.y = Math.sin(mesh.position.y + time * speed);
      mesh.rotation.z = Math.sin(mesh.position.z + time * speed);
      mesh.position.y = Math.sin(time * 0.5 + index) * 2;
    });
  };

  return { scene2, camera2, renderTarget, animateCubes };
}
