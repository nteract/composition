const version = require('../../package.json').version;
const yargs = require('yargs');

function parseCommandLine(processArgs) {
  const options = yargs(processArgs).wrap(100);
  options.usage(`nteract v${version}

    Usage: nteract [notebook ...]

    One or more notebooks may be specified.
    `);

  const args = options.argv;
  if (args.help) {
    process.stdout.write(options.help());
    process.exit(0);
  }

  if (args.version) {
    process.stdout.write(
      `nteract     : ${version}\n` +
      `Electron    : ${process.versions.electron}\n` +
      `Chrome      : ${process.versions.chrome}\n` +
      `Node        : ${process.versions.node}\n`
    );
    process.exit(0);
  }
  const pathsToOpen = args._;
  const urlsToOpen = [];

  return {
    pathsToOpen,
    urlsToOpen,
  };
}

module.exports = parseCommandLine;
