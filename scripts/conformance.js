#!/usr/bin/env node

const nbschema = require("nbschema");
const validate = require("jsonschema").validate;

const glob = require("glob");

const fs = require("fs");
const path = require("path");

const notebookDir = path.join(__dirname, "..", "example-notebooks");
const files = glob.sync(path.join(notebookDir, "*.ipynb"));

let numFailed = 0;

files
  .map(file => {
    const notebook = JSON.parse(fs.readFileSync(file));
    const validation = validate(notebook, nbschema.v4);
    return {
      name: file,
      passed: validation.errors.length === 0,
      validation
    };
  })
  .forEach(result => {
    const emoji = result.passed ? "✅" : "❌";
    console.log(`${emoji}\t${result.name}`);

    if (!result.passed) {
      console.error(result.validation.errors);
    }
    // Update if any failed
    numFailed = numFailed + (result.passed ? 0 : 1);
  });

process.exit(numFailed);
