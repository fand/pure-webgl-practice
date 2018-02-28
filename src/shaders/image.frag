#version 300 es
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D lena;
out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv.y = 1. - uv.y;
    uv.y *= .5;
    fragColor = texture(lena, fract(uv + time * -.1));
}
