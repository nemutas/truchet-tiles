#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D tBackBuffer;

#define sat(v) clamp(v, 0.0, 1.0)

const float PI = acos(-1.0);
const float sm = 0.01, wi = 0.07, hwi = wi * 0.5, dot = 0.1;
vec2 asp, fuv, iuv, suv;

mat2 rot(float a) {
  float s = sin(a), c = cos(a);
  return mat2(c, s, -s, c);
}

vec2 hash(vec2 v) {
  uvec2 x = floatBitsToUint(v + vec2(0.1, 0.2));
  x = (x >> 8 ^ x.yx) * 0x20240121u;
  x = (x >> 8 ^ x.yx) * 0x20240121u;
  x = (x >> 8 ^ x.yx) * 0x20240121u;
  return vec2(x) / vec2(-1u);
}

#include './modules/dotLine.glsl'
#include './modules/starCircle.glsl'

void main() {
  vec4 bb = texture(tBackBuffer, vUv);

  float time = uTime * 110.0 / 60.0;
  float bt = floor(time);
  float tr = tanh(fract(time) * 5.0);
  float lt = bt + tr;

  asp = uResolution / min(uResolution.x, uResolution.y);
  vec2 uv = vUv * asp;
  uv.y -= lt / 10.0;
  fuv = fract(uv * 10.0);
  iuv = floor(uv * 10.0);
  suv = fuv * 2.0 - 1.0;

  float col;
  col = dotLine();
  
  uv = vUv * asp;
  uv.x -= lt / 10.0;
  fuv = fract(uv * 10.0);
  iuv = floor(uv * 10.0);
  suv = fuv * 2.0 - 1.0;
  col += starCircle() * 0.15;

  suv = fract(vUv * asp * 10.0) * 2.0 - 1.0;
  float bo = 1.0 - (step(abs(suv.x), 1.0 - wi * 0.25) * step(abs(suv.y), 1.0 - wi * 0.25));
  col += bo * 0.1;

  vec3 color = vec3(sat(col), bb.rg);
  color = mix(color, bb.rgb, 0.5);

  outColor = vec4(color, 1.0);
}