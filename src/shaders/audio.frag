#version 300 es
precision mediump float;
uniform float time;
uniform vec2  resolution;
uniform sampler2D spectrum;
uniform sampler2D samples;
uniform float volume;
out vec4 fragColor;

void main (void) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;

    float freq = texture(spectrum, vec2(uv.x, .5)).r;
    float wave = texture(samples, vec2(uv.x, .5)).r;

    float r = 1. - step(0.01, abs(wave - uv.y));
    float g = 1. - step(0.01, abs(freq - uv.y));
    float b = 1. - step(0.01, abs(volume / 255. - uv.y));

    fragColor = vec4(r, g, b, 1.);
}
