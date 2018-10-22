// Note: This file is ES5 because it doesn't get transpiled, only gets used for building the module
const fs = require("fs");
const path = require("path");

const BUILD_DIR = path.join(__dirname, "build");
const CSS_PATH = path.join(BUILD_DIR, "index.js");
const FLOW_PATH = path.join("src", "index.js");
const DECLARATIONS_PATH = path.join(BUILD_DIR, "declarations.json");
const VARIABLES_PATH = path.join(BUILD_DIR, "variables.json");

const declarations = {};

const toDash = str => str.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const makeName = name => {
  const dashName = toDash(name.replace(/--/g, "-").replace(/-$/, ""));
  return `--${config.prefix}-${dashName}`;
};

const lodash = require("lodash");

const config = require("./src/config.json");

function makeDeclarationSet(groupKey, isAlias) {
  const modifiers = config.theme.modifiers[groupKey];
  if (isAlias) {
    lodash.toPairs(config.theme.alias[groupKey]).forEach(([jsAlias, jsKey]) => {
      if (modifiers) {
        modifiers.order.forEach(modifierValue => {
          const variableName = makeName(
            `${groupKey}-${jsAlias}-${modifierValue}`
          );
          const baseName = makeName(`${groupKey}-${jsKey}-${modifierValue}`);
          if (!declarations[baseName]) {
            throw new Error(`Base variable ${baseName} not assigned.`);
          }
          declarations[variableName] = `var(${baseName})`;
        });
      } else {
        const variableName = makeName(`${groupKey}-${jsAlias}`);
        const baseName = makeName(`${groupKey}-${jsKey}`);
        if (!declarations[baseName]) {
          throw new Error(`Base variable ${baseName} not assigned.`);
        }
        declarations[variableName] = `var(${baseName})`;
      }
    });
  } else {
    lodash.toPairs(config.theme.base[groupKey]).forEach(([jsKey, value]) => {
      if (modifiers) {
        const modifierObject =
          typeof value === "object" ? value : { [modifiers.default]: value };
        modifiers.order.forEach(modifierValue => {
          const variableName = makeName(
            `${groupKey}-${jsKey}-${modifierValue}`
          );
          const cssValue = modifierObject[modifierValue];
          if (typeof cssValue !== "undefined") {
            declarations[variableName] = cssValue;
          } else {
            const fallback = modifiers.values[modifierValue];
            if (fallback === null) {
              throw new Error(
                `Cannot resolve modifiers for "${groupKey}", "${jsKey}"`
              );
            }
            const baseName = makeName(`${groupKey}-${jsKey}-${fallback}`);
            declarations[variableName] = `var(${baseName})`;
          }
        });
      } else {
        if (typeof value === "object") {
          throw new Error(`Invalid modifier object in group ${groupKey}`);
        }
        declarations[makeName(`${groupKey}-${jsKey}`)] = value;
      }
    });
  }
}

Object.keys(config.theme.base).forEach(groupKey =>
  makeDeclarationSet(groupKey)
);
Object.keys(config.theme.alias).forEach(groupKey =>
  makeDeclarationSet(groupKey, true)
);

if (!fs.existsSync(BUILD_DIR)) {
  fs.mkdirSync(BUILD_DIR);
}

const lines = [
  "// @flow",
  "// This file is auto-generated. See buildStyles.js for details.",
  // Ensure this ends up as an es module for nice webpack usage
  "export default `",
  ":root {"
].concat(
  // Generated CSS from our config
  lodash
    .toPairs(declarations)
    .map(([cssProperty, cssValue]) => `  ${cssProperty}: ${cssValue};`),
  ["}", "`;"]
);

fs.writeFileSync(CSS_PATH, lines.join("\n"));
fs.writeFileSync(FLOW_PATH, lines.join("\n"));

// Generate variable file for validation.
fs.writeFileSync(
  VARIABLES_PATH,
  JSON.stringify(Object.keys(declarations), null, "  ")
);

// Generate declarations json file.
fs.writeFileSync(
  DECLARATIONS_PATH,
  JSON.stringify(lodash.toPairs(declarations), null, "  ")
);
