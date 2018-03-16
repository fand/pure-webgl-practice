import GL from './gl';

interface IShaders {
    vs: string;
    fs: string;
    imported?: any;
}

declare const require: any;
const shaders: { [id: string]: IShaders } = {
    shader1: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/shader1.frag'),
    },
    mouse: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/mouse.frag'),
    },
    backbuffer: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/backbuffer.frag'),
    },
    image: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/image.frag'),
        imported: {
            lena: './cat.jpg',
        },
    },
    video: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/video.frag'),
        imported: {
            video1: './videos/1.mp4',
            video2: './videos/2.mp4',
            video3: './videos/3.mp4',
        },
    },
    audio: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/audio.frag'),
    },
    camera: {
        vs: require('./shaders/shader1.vert'),
        fs: require('./shaders/camera.frag'),
    },
};

let imports: string[] = [];

const loadShader = async (gl: GL, name: string) => {
    const { vs, fs, imported = {} } = shaders[name];

    const newImports: string[] = [];

    const importFinished = Promise.all(
        Object.keys(imported).map(key => {
            newImports.push(key);
            return gl.loadTexture(key, imported[key]);
        }),
    );

    return importFinished.then(() => {
        gl.loadShader({ vs, fs });

        imports.forEach(key => {
            if (newImports.indexOf(key) === -1) {
                gl.unloadTexture(key);
            }
        });
        imports = newImports;
    });
};

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './app';

// const App = () => <div>hello</div>;

ReactDOM.render(<App />, document.querySelector('#app'));

// window.addEventListener('load', () => {
//     const main = document.getElementById('main')!;
//     const gl = new GL(main);
//
//     Array.from(document.querySelectorAll('#menu li')).forEach((e: any) => {
//         e.addEventListener('click', () => loadShader(gl, e.innerText));
//     });
//
//     gl.start();
//     gl.toggleAudio(true);
//     gl.toggleCamera(true);
//
//     main.addEventListener(
//         'click',
//         () => (gl.isPlaying ? gl.stop() : gl.start()),
//     );
// });
