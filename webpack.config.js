const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src/index.tsx'),
    output: {
        path: path.resolve(__dirname, 'docs'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: path.join(__dirname, 'docs'),
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json'],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: 'ts-loader' },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'raw-loader',
            },
            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'glslify-loader',
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
        ],
    },
};
