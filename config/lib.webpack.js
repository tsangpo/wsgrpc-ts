const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode:'production',
  target:'web',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
  },
  output: {
    filename: 'index.js',
    // path: path.resolve(__dirname, 'dist'),
    path: path.resolve('dist'),
  },
};