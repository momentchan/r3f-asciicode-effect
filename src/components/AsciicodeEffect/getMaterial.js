import * as THREE from "three/webgpu";
import {
  createAsciiCodeShader,
  createPositionMathShader,
} from "./shaders/asciiCodeShader";

/**
 * Creates an ASCII material with custom shaders
 * @param {Object} params - Material parameters
 * @param {Texture} params.tex - Local texture (from useTexture)
 * @param {Texture} params.asciiTexture - ASCII character texture
 * @param {Texture} params.sceneTexture - Texture from the rendered scene
 * @param {number} params.len - Length of ASCII dictionary
 * @param {boolean} params.useSceneTexture - Whether to use sceneTexture (true) or localTexture/tex (false). Default: true
 * @param {number} params.barrelDistortion - Barrel distortion strength (positive = barrel, negative = pincushion). Default: 0
 * @returns {THREE.NodeMaterial|null} The created material or null if required textures are not provided
 */
export function getMaterial({ 
  tex, 
  asciiTexture, 
  sceneTexture, 
  len, 
  useSceneTexture = true,
  barrelDistortion = 0 
}) {
  // Require tex if using local texture, or sceneTexture if using scene texture
  if (useSceneTexture && !sceneTexture) return null;
  if (!useSceneTexture && !tex) return null;
  if (!asciiTexture) return null;

  const material = new THREE.NodeMaterial();

  const asciiCodeShader = createAsciiCodeShader({
    sceneTexture,
    localTexture: tex,
    asciiTexture,
    len,
    useSceneTexture,
  });

  const positionMathShader = createPositionMathShader({
    barrelDistortion,
  });

  material.colorNode = asciiCodeShader();
  material.positionNode = positionMathShader();

  material.transparent = true;
  material.side = THREE.DoubleSide;

  return material;
}

