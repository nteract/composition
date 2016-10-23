const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

// Don't webpack those that cause errors
const nodeModules = {
  yargs: 'commonjs yargs',
};

module.exports = {
  entry: './src/main/index.js',
  target: 'electron-main',
  output: {
    path: path.join(__dirname, 'app', 'build', 'main'),
    filename: 'webpacked-main.js'
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
      path.resolve(__dirname, 'node_modules'),
    ],
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
  ],
  devtool: 'sourcemap'
};
