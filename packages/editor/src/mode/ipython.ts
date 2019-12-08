// https://github.com/nteract/nteract/issues/389
import CodeMirror, { EditorConfiguration, Mode } from "codemirror";

import "codemirror/mode/meta";
import "codemirror/mode/python/python";

// The TypeScript definitions are missing these versions
// of the codemirror define* functions that IPython uses for
// highlighting magics
// @ts-ignore
CodeMirror.defineMode(
  "ipython",
  (conf: EditorConfiguration, parserConf: any): Mode<any> => {
    const ipythonConf = Object.assign({}, parserConf, {
      name: "python",
      singleOperators: new RegExp("^[\\+\\-\\*/%&|@\\^~<>!\\?]"),
      identifiers: new RegExp(
        "^[_A-Za-z\u00A1-\uFFFF][_A-Za-z0-9\u00A1-\uFFFF]*"
      ) // Technically Python3
    });
    return CodeMirror.getMode(conf, ipythonConf);
  },
  // @ts-ignore
  "python"
);

// @ts-ignore
CodeMirror.defineMIME("text/x-ipython", "ipython");
