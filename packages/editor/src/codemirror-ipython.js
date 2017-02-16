// https://github.com/nteract/nteract/issues/389
import CodeMirror from 'codemirror';

import 'codemirror/mode/meta';
import 'codemirror/mode/python/python';

CodeMirror.defineMode('ipython', (conf, parserConf) => {
  const ipythonConf = Object.assign({}, parserConf, {
    name: 'python',
    singleOperators: new RegExp('^[\\+\\-\\*/%&|@\\^~<>!\\?]'),
    identifiers: new RegExp('^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*'), // Technically Python3
  });
  return CodeMirror.getMode(conf, ipythonConf);
}, 'python');

CodeMirror.defineMIME('text/x-ipython', 'ipython');
