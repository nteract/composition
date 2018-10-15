// @flow
/**
 * This script is used to create styled-jsx css`` strings for use by components.
 *
 * One problem though -- this doesn't solve the issue of loading fonts. We still have to tackle that.
 */

const fs = require("fs");
const util = require("util");
const path = require("path");

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const mkdirp = util.promisify(require("mkdirp"));

async function loadCSS(filename) /*: Promise<string> */ {
  const rawCSS = await readFile(filename);

  // $FlowFixMe Don't actually fix, flow is hoping for a string literal, for which we will not have here
  const loader = require(require("styled-jsx/webpack").loader);

  const cssInJS = await new Promise((resolve, reject) => {
    loader.call(
      // Abusing styled-jsx's webpack API just to get the CSS we need
      {
        query: "?type=global",
        addDependency: () => {},
        callback: (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        }
      },
      rawCSS.toString()
    );
  });

  return cssInJS;
}

/*::
type Manifest = Array<{
  cssIn: string,
  jsOut: string,
}>;
 */

async function processManifest(manifest /*: Manifest*/) {
  for (var entry of manifest) {
    console.log(`Processing CSS of ${entry.cssIn}`);
    const result = await loadCSS(entry.cssIn);
    await mkdirp(path.dirname(entry.jsOut));
    await writeFile(entry.jsOut, result);
    console.log(`Wrote CSS for ${entry.cssIn} to ${entry.jsOut}`);
  }
}

var manifest = [
  {
    cssIn: require.resolve("@blueprintjs/core/lib/css/blueprint.css"),
    jsOut: path.join(__dirname, "..", "src/vendor/blueprint.css.js")
  }
];

console.log("Converting CSS to CSS-in-JS");
processManifest(manifest)
  .then(() => {
    console.log("✨");
  })
  .catch(err => {
    console.error(err);
    process.exit(3);
  });
