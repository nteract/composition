/* eslint camelcase: 0 */
//                   ^^---- for ignoring Jupyter JSON, like msg_id

const enchannelZMQ = require('../src');
const createShellSubject = enchannelZMQ.createShellSubject;
const createIOPubSubject = enchannelZMQ.createIOPubSubject;
const uuid = require('uuid/v4');
const path = require('path');

const chalk = require('chalk');
const identity = uuid();

const fsp = require('fs-promise');
const runtimeDir = require('jupyter-paths').runtimeDir();

fsp.readdir(runtimeDir)
   .then(data => {
     const kernels = data.filter(x => (/kernel.+\.json/).test(x));
     if(kernels.length <= 0) {
       throw new Error('You need a running Jupyter session');
     }
     console.log('Using the first kernel!');
     return path.join(runtimeDir, kernels[0]);
   })
  .then(runtimePath => {
    return fsp.readFile(runtimePath);
  })
  .then(contents => {
    return JSON.parse(contents);
  })
  .then(kernelConfig => {
    const shell = createShellSubject(identity, kernelConfig);
    const iopub = createIOPubSubject(identity, kernelConfig);
    global.shell = shell;
    global.iopub = iopub;

    global.message = {
      header: {
        msg_id: `execute_${uuid()}`,
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

    console.log(chalk.green('\nHINT: ') + chalk.white('iopub.subscribe(console.log, console.error)'));
    console.log(chalk.green('\nHINT: ') + chalk.white('shell.subscribe(console.log, console.error)'));
    console.log(chalk.green('\nHINT: ') + chalk.white('shell.send(message)'));

    require('repl').start('> ');
  })
  .catch(err => {
    console.error(err);
  });
