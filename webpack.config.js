const path = require("path")

module.exports = {
  entry: path.resolve(__dirname, "src/index.ts"),
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js"
  },
  devServer: {
    contentBase: path.join(__dirname, "public")
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {test: /\.tsx?$/, loader: "ts-loader"},
      {
        test: /\.(glsl|frag|vert)$/,
        loader: "raw-loader"
      },
      {
        test: /\.(glsl|frag|vert)$/,
        loader: "glslify-loader"
      }
    ]
  }
}
