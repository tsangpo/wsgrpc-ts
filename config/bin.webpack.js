const path = require("path");

module.exports = {
  entry: "./src/bin/main.ts",
  mode: "production",
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  output: {
    filename: "bin.js",
    // path: path.resolve(__dirname, 'dist'),
    path: path.resolve("dist"),
  },
};
