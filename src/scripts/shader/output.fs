#version 300 es
precision mediump float;

uniform sampler2D tSource;

in vec2 vUv;
out vec4 outColor;

void main() {
  outColor = texture(tSource, vUv);
}