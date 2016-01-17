/* eslint camelcase: 0 */
//                   ^^---- for ignoring Jupyter JSON, like msg_id

global.enchannelZMQ = require('../src');
const uuid = require('uuid');
global.uuid = uuid;

(() => {
  const chalk = require('chalk');
  const util = require('util');

  // Quick helper functions
  const codeLog = (s) => console.log(chalk.white(chalk.bgBlack(s)));
  const insp = o => util.inspect(o, { colors: true });

  codeLog('\nconsole.log(enchannelZMQ)');
  console.log(insp(global.enchannelZMQ));

  codeLog('\nvar identity = uuid.v4()');
  global.identity = uuid.v4();

  console.log(chalk.green('\nHINT: ') + chalk.white('var config = require(\'./kernel.json\')'));
  console.log(chalk.white('var shell = createShellSubject(identity, config)'));

  const message = {
    header: {
      msg_id: `execute_${uuid.v4()}`,
      username: '',
      session: '00000000-0000-0000-0000-000000000000',
      msg_type: 'execute_request',
      version: '5.0',
    },
    content: {
      code: 'print("woo")',
      silent: false,
      store_history: true,
      user_expressions: {},
      allow_stdin: false,
    },
  };

  console.log('var payload = ');
  console.log(message);
  console.log('\n      ' + chalk.white('iopub.subscribe(console.log)'));
  console.log('\n      ' + chalk.white('shell.subscribe(console.log)'));
  console.log('\n      ' + chalk.white('shell.send(payload)'));

})();

require('repl').start('> ');
