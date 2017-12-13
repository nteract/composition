module.exports = {
  webpack: (config, { buildId, dev }) => {
    config.module.rules.push({
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel-loader"
    });

    config.resolve = Object.assign({}, config.resolve, {
      mainFields: ["nteractDesktop", "es2015", "jsnext:main", "module", "main"]
    });
    return config;
  }
};
