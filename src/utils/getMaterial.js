import * as THREE from "three/webgpu";
import {
  vec2,
  vec4,
  Fn,
  uv,
  texture,
  attribute,
  uniform,
  color,
  pow,
  mix,
  step,
  div,
  floor,
  mul,
  add,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

export function getMaterial({ tex, asciiTexture, length }) {
  if (!tex) return null;

  const material = new THREE.NodeMaterial();

  const pallete = ["#8C1EFF", "#F222FF", "#FF2975", "#FF901F", "#FFD319"];

  const uColor1 = uniform(color(pallete[0]));
  const uColor2 = uniform(color(pallete[1]));
  const uColor3 = uniform(color(pallete[2]));
  const uColor4 = uniform(color(pallete[3]));
  const uColor5 = uniform(color(pallete[4]));

  const asciiCode = Fn(() => {
    const textureColor = texture(tex, attribute("aPixelUV"));
    const brightness = pow(textureColor.r, 0.9).add(attribute("aRandom").mul(0.02));

    const asciiUv = vec2(
      uv().x.div(length).add(floor(brightness.mul(length)).div(length)),
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

  material.colorNode = asciiCode();

  material.transparent = true;
  material.side = THREE.DoubleSide;

  return material;
}
