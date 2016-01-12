global.enchannelZMQ = require('..');

(() => {
  const chalk = require('chalk');
  const util = require('util');

  // Quick helper functions
  const codeLog = (s) => console.log(chalk.white(chalk.bgBlack(s)));
  const insp = o => util.inspect(o, { colors: true });

  codeLog('\nconsole.log(enchannelZMQ)');
  console.log(insp(global.enchannelZMQ));

  console.log(chalk.green('\nHINT: ') + chalk.white('enchannelZMQ(\'kernel.json\')\n'));
})();

require('repl').start('> ');
