import { useMemo, useRef, useLayoutEffect } from "react";
import { useControls } from "leva";
import * as THREE from "three";
import { getMaterial } from "../utils/getMaterial";
import { useTexture } from "@react-three/drei";
import { useEffect } from "react";

const rows = 50;
const cols = 50;
const size = 0.1;
const instances = rows * cols;

function createAsciiTexture() {
  const dict =
    "`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";
  const length = dict.length;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = length * 64;
  canvas.height = 64;

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 40px Arial";
  ctx.textAlign = "center";

  for (let i = 0; i < length; i++) {
    if(i>50){
      for(let j = 0; j < 6; j++) {
        ctx.filter = `blur(${j*2}px)`;
        ctx.fillText(dict[i], 32 + i * 64, 45);
      }
    }
    ctx.filter = "none";
    ctx.fillText(dict[i], 32 + i * 64, 45);
  }

  const asciiTexture = new THREE.Texture(canvas);
  asciiTexture.needsUpdate = true;
  return { length, asciiTexture };
}

export default function BasicMesh() {
  const instancedMeshRef = useRef(null);

  const { alpha } = useControls("Material", {
    alpha: { value: 1, min: 0, max: 1, step: 0.01 },
  });

  const tex = useTexture("/textures/Anne_Hathaway.jpg");

  const material = useMemo(() => {
    if (!tex) return null;
    return getMaterial({
      tex: tex,
      asciiTexture: createAsciiTexture().asciiTexture,
      length: createAsciiTexture().length,
    });
  }, [tex]);

  const geometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(size, size, 1, 1);
    return geometry;
  }, []);

  const { matrices, uvs, randoms } = useMemo(() => {
    const positions = new Float32Array(instances * 3);
    const uvs = new Float32Array(instances * 2);
    const randoms = new Float32Array(instances);
    const matrices = new Float32Array(instances * 16);
    const matrix = new THREE.Matrix4();

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const index = i * cols + j;
        randoms[index] = Math.pow(Math.random(), 4);
        // Compute positions
        const x = i * size - ((rows - 1) / 2) * size;
        const y = j * size - ((cols - 1) / 2) * size;
        const z = 0;

        positions[index * 3] = x;
        positions[index * 3 + 1] = y;
        positions[index * 3 + 2] = z;

        // Compute UVs
        uvs[index * 2] = i / (rows - 1);
        uvs[index * 2 + 1] = j / (cols - 1);

        // Compute instance matrices
        matrix.setPosition(x, y, z);
        matrix.toArray(matrices, index * 16);
      }
    }

    return { matrices, uvs, randoms };
  }, []);

  // Set instance matrix on the instanced mesh
  useLayoutEffect(() => {
    if (instancedMeshRef.current && uvs && randoms) {
      instancedMeshRef.current.instanceMatrix.array.set(matrices);
      instancedMeshRef.current.instanceMatrix.needsUpdate = true;
      instancedMeshRef.current.geometry.setAttribute(
        "aPixelUV",
        new THREE.InstancedBufferAttribute(uvs, 2)
      );
      instancedMeshRef.current.geometry.setAttribute(
        "aRandom",
        new THREE.InstancedBufferAttribute(randoms, 1)
      );
    }
  }, [matrices, uvs, randoms]);

  if (!material) return null;

  return (
    <instancedMesh
      ref={instancedMeshRef}
      args={[geometry, material, instances]}
    />
  );
}
