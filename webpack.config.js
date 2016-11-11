const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const nodeModules = {
  zmq: 'commonjs zmq',
  jmp: 'commonjs jmp',
  github: 'commonjs github',
  canvas: 'commonjs canvas',
};

module.exports = {
  entry: './src/notebook/index.js',
  target: 'electron-renderer',
  output: {
    path: path.join(__dirname, 'app', 'build'),
    filename: 'webpacked-notebook.js'
  },
  module: {
    loaders: [
      { test: /\.js$/, exclude: /node_modules/, loaders: ['babel'] },
      { test: /\.json$/, loader: 'json-loader' },
    ]
  },
  resolve: {
    extensions: ['', '.js', '.jsx'],
    root: path.join(__dirname, 'app'),
    // Webpack 1
    modulesDirectories: [
      path.resolve(__dirname, 'app', 'node_modules'),
      path.resolve(__dirname, 'node_modules'),
    ],
    // Webpack 2
    modules: [
      path.resolve(__dirname, 'app', 'node_modules'),
    ],
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
  ],
};
