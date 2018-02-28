#version 300 es
precision mediump float;
in vec3 position;
uniform mat4 mvpMatrix;
uniform float time;

void main(void) {
    gl_Position = mvpMatrix * vec4(position, 1.0);
    gl_PointSize = 10.;
}
