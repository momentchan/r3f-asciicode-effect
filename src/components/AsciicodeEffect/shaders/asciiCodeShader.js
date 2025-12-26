import {
  Fn,
  uv,
  texture,
  attribute,
  uniform,
  color,
  pow,
  mix,
  step,
  vec2,
  vec3,
  floor,
  mul,
  div,
  positionLocal,
  atan,
  length,
  cos,
  sin,
} from "three/tsl";
import { ASCII_COLOR_PALETTE } from "../constant";

/**
 * Creates the ASCII code shader function for material color node (fragment shader)
 * @param {Object} params - Shader parameters
 * @param {Texture} params.sceneTexture - Texture from the rendered scene
 * @param {Texture} params.localTexture - Local texture (from useTexture)
 * @param {Texture} params.asciiTexture - ASCII character texture
 * @param {number} params.len - Length of ASCII dictionary
 * @param {boolean} params.useSceneTexture - Whether to use sceneTexture (true) or localTexture (false)
 * @returns {Function} Shader function for color node
 */
export function createAsciiCodeShader({ 
  sceneTexture, 
  localTexture, 
  asciiTexture, 
  len, 
  useSceneTexture = true 
}) {
  const uColor1 = uniform(color(ASCII_COLOR_PALETTE[0]));
  const uColor2 = uniform(color(ASCII_COLOR_PALETTE[1]));
  const uColor3 = uniform(color(ASCII_COLOR_PALETTE[2]));
  const uColor4 = uniform(color(ASCII_COLOR_PALETTE[3]));
  const uColor5 = uniform(color(ASCII_COLOR_PALETTE[4]));

  return Fn(() => {
    // Use sceneTexture or localTexture based on useSceneTexture flag
    // Scene texture uses aPixelUV (pixel-based UVs), local texture uses standard UVs
    const sourceTexture = useSceneTexture ? sceneTexture : localTexture;
    const textureUV = attribute("aPixelUV");
    const textureColor = texture(sourceTexture, textureUV);
    const brightness = pow(textureColor.r, 0.9).add(attribute("aRandom").mul(0.02));

    const asciiUv = vec2(
      uv().x.div(len).add(floor(brightness.mul(len)).div(len)),
      uv().y
    );

    const asciiColor = texture(asciiTexture, asciiUv);

    let finalColor = uColor1;
    finalColor = mix(finalColor, uColor2, step(0.2, brightness));
    finalColor = mix(finalColor, uColor3, step(0.4, brightness));
    finalColor = mix(finalColor, uColor4, step(0.6, brightness));
    finalColor = mix(finalColor, uColor5, step(0.8, brightness));

    return asciiColor.mul(finalColor);
  });
}

/**
 * Creates the position math shader function for material position node (vertex shader)
 * @param {Object} params - Shader parameters
 * @param {number} params.barrelDistortion - Barrel distortion strength (positive = barrel, negative = pincushion). Default: 0
 * @returns {Function} Shader function for position node
 */
export function createPositionMathShader({ barrelDistortion = 0 }) {
  const uBarrelDistortion = uniform(barrelDistortion);
  const uOne = uniform(1.0);

  return Fn(() => {
    const originalPos = attribute("aPosition");
    const theta = atan(originalPos.y, originalPos.x);
    const baseRadius = length(originalPos);
    
    // Apply barrel distortion: newRadius = baseRadius * (1 + distortion * radius^2)
    // Positive values = barrel (bulge outward), negative = pincushion (pinch inward)
    const radiusSquared = baseRadius.mul(baseRadius);
    const distortionFactor = uOne.add(uBarrelDistortion.mul(radiusSquared));
    const finalRadius = baseRadius.mul(distortionFactor);
    const pos = vec3(finalRadius.mul(cos(theta)), finalRadius.mul(sin(theta)), 0);

    return positionLocal.add(pos);
  });
}

