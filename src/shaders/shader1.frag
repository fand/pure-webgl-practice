#version 300 es
precision mediump float;
uniform float time;
uniform vec2 resolution;
out vec4 fragColor;

void main(void){
    vec2 uv = gl_FragCoord.xy / resolution;
    fragColor = vec4(uv.x, uv.y, abs(sin(time)), 1.0);

    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    if (length(p) < .3) {
        fragColor.rgb = 1. - fragColor.rgb;
    }
}
