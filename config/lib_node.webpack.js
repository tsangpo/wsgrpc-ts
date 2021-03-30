const path = require('path');

module.exports = {
  entry: './src/node.ts',
  mode:'production',
  target:'node',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  externals: ["ws"],
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    filename: 'node.js',
    // path: path.resolve(__dirname, 'dist'),
    path: path.resolve('dist'),
  },
};