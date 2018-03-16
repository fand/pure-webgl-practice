#version 300 es
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D camera;
out vec4 fragColor;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    fragColor = fract(texture(camera, uv) * 3. + time);
    fragColor.r *= .7;
    fragColor.a = 1.;
}
