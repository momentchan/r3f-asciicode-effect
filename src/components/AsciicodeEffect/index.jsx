import { useMemo, useRef, useLayoutEffect, useState, useCallback } from "react";
import * as THREE from "three";
import { useControls, button } from "leva";
import { getMaterial } from "./getMaterial";
import {
  createAsciiTexture,
  generateInstanceAttributes,
} from "./utils";
import {
  ASCII_SIZE,
  ASCII_INSTANCES,
} from "./constant";
import { useTexture } from "@react-three/drei";
import { useThree, useFrame } from "@react-three/fiber";
import { useScene2 } from "../../hooks/useScene2";

export default function AsciicodeEffect() {
  const { scene, camera, gl } = useThree();
  const { scene2, camera2, renderTarget, animateCubes } = useScene2();

  const instancedMeshRef = useRef(null);
  const [uploadedTexture, setUploadedTexture] = useState(null);

  const defaultTex = useTexture("/textures/Anne_Hathaway.jpg");

  const handleFileUpload = useCallback((file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Dispose of previous uploaded texture using functional update
        setUploadedTexture((prevTexture) => {
          if (prevTexture) {
            prevTexture.dispose();
          }
          const texture = new THREE.Texture(img);
          texture.needsUpdate = true;
          return texture;
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, []);

  const { useSceneTexture, barrelDistortion } = useControls({
    useSceneTexture: {
      value: true,
      label: "Use Scene Texture",
    },
    barrelDistortion: {
      value: 0,
      min: -0.1,
      max: 0.1,
      step: 0.01,
      label: "Barrel Distortion",
    },
    uploadTexture: button(() => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = e.target.files?.[0];
        if (file) handleFileUpload(file);
      };
      input.click();
    }),
  });

  const tex = uploadedTexture || defaultTex;

  const asciiTextureData = useMemo(() => createAsciiTexture(), []);

  const material = useMemo(() => {
    if (!asciiTextureData) return null;
    if (useSceneTexture && !renderTarget.texture) return null;
    if (!useSceneTexture && !tex) return null;
    
    return getMaterial({
      tex: tex,
      asciiTexture: asciiTextureData.asciiTexture,
      sceneTexture: renderTarget.texture,
      len: asciiTextureData.length,
      useSceneTexture,
      barrelDistortion,
    });
  }, [tex, asciiTextureData, renderTarget, useSceneTexture, barrelDistortion]);

  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(ASCII_SIZE, ASCII_SIZE, 1, 1);
  }, []);

  const { uvs, randoms, positions } = useMemo(() => {
    return generateInstanceAttributes();
  }, []);

  // Set instance attributes on the instanced mesh
  useLayoutEffect(() => {
    if (instancedMeshRef.current && uvs && randoms && positions) {
      instancedMeshRef.current.geometry.setAttribute(
        "aPixelUV",
        new THREE.InstancedBufferAttribute(uvs, 2)
      );
      instancedMeshRef.current.geometry.setAttribute(
        "aRandom",
        new THREE.InstancedBufferAttribute(randoms, 1)
      );
      instancedMeshRef.current.geometry.setAttribute(
        "aPosition",
        new THREE.InstancedBufferAttribute(positions, 3)
      );
    }
  }, [uvs, randoms, positions]);

  useFrame((state, delta) => {
    animateCubes(state.clock.elapsedTime, delta);

    gl.setRenderTarget(renderTarget);
    gl.render(scene2, camera2);
    gl.setRenderTarget(null);
    gl.render(scene, camera);
  }, 1);

  // Cleanup uploaded texture on unmount
  useLayoutEffect(() => {
    return () => {
      if (uploadedTexture) {
        uploadedTexture.dispose();
      }
    };
  }, [uploadedTexture]);

  if (!material) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, ASCII_INSTANCES]}
    />
  );
}
