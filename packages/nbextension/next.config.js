// next.config.js
module.exports = {
  exportPathMap: function() {
    return {
      "/": { page: "/" }
    };
  },
  outdir: "flat",
  outDir: "camel"
};
