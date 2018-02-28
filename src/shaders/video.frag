#version 300 es
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D video1;
uniform sampler2D video2;
uniform sampler2D video3;
out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 v1 = texture(video1, uv);
    vec4 v2 = texture(video2, uv);
    vec4 v3 = texture(video3, uv);
    fragColor = vec4(
      v1.r + v2.r,
      v2.g + v3.g,
      v3.b + v1.b,
      1
    );
}
