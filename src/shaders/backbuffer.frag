#version 300 es
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D backbuffer;
out vec4 fragColor;

float draw(in vec2 p, in float t) {
  float c = 0.;
  c += 0.03 / length(p - vec2(sin(t * 2.), cos(t * 3.)));
  c += 0.03 / length(p - vec2(sin(t * 1.3), cos(t * 2.8)));
  c += 0.03 / length(p - vec2(sin(t * 3.9), cos(t * 1.7)));
  c += 0.03 / length(p - vec2(cos(t * 3.47), sin(t * 3.9)));
  return c;
}

void main() {
  vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
  float t = time * .1;

  float c = (
    draw(p, t) +
    draw(p * vec2(1, -1), t + .2) +
    draw(p * vec2(-1, 1), t + .4) +
    draw(p * vec2(-1, -1), t + .5)
  );

  float d = .4;
  c = smoothstep(d, d + .01, c * c * c);

  vec4 b = texture(backbuffer, gl_FragCoord.xy / resolution);

  fragColor = vec4(c * vec3(0.2, 0.3, 0.8), 1) + b * 0.9;
  fragColor.r = texture(backbuffer, gl_FragCoord.xy / resolution + .03).g;
}
