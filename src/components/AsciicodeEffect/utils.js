import * as THREE from "three";
import { ASCII_DICT, ASCII_ROWS, ASCII_COLS, ASCII_SIZE, ASCII_INSTANCES } from "./constant";

/**
 * Creates an ASCII texture from the character dictionary
 * @returns {Object} Object containing the texture and dictionary length
 */
export function createAsciiTexture() {
  const length = ASCII_DICT.length;
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
    if (i > 50) {
      for (let j = 0; j < 2; j++) {
        ctx.filter = `blur(${j * 2}px)`;
        ctx.fillText(ASCII_DICT[i], 32 + i * 64, 45);
      }
    }
    ctx.filter = "none";
    ctx.fillText(ASCII_DICT[i], 32 + i * 64, 45);
  }

  const asciiTexture = new THREE.Texture(canvas);
  asciiTexture.needsUpdate = true;
  return { length, asciiTexture };
}

/**
 * Generates instance attributes (positions, UVs, and random values) for the ASCII effect
 * @returns {Object} Object containing positions, uvs, and randoms Float32Arrays
 */
export function generateInstanceAttributes() {
  const positions = new Float32Array(ASCII_INSTANCES * 3);
  const uvs = new Float32Array(ASCII_INSTANCES * 2);
  const randoms = new Float32Array(ASCII_INSTANCES);

  for (let i = 0; i < ASCII_ROWS; i++) {
    for (let j = 0; j < ASCII_COLS; j++) {
      const index = i * ASCII_COLS + j;
      randoms[index] = Math.pow(Math.random(), 4);

      // Compute positions
      const x = i * ASCII_SIZE - ((ASCII_ROWS - 1) / 2) * ASCII_SIZE;
      const y = j * ASCII_SIZE - ((ASCII_COLS - 1) / 2) * ASCII_SIZE;
      const z = 0;

      positions[index * 3] = x;
      positions[index * 3 + 1] = y;
      positions[index * 3 + 2] = z;

      // Compute UVs
      uvs[index * 2] = i / (ASCII_ROWS - 1);
      uvs[index * 2 + 1] = j / (ASCII_COLS - 1);
    }
  }

  return { uvs, randoms, positions };
}

