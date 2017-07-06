// @flow
// To be used for server side rendering
// Not finished yet

const CodeMirror = require("codemirror/addon/runmode/runmode.node.js");
require("codemirror/mode/meta.js");
require("codemirror/mode/python/python.js");

function esc(str) {
  return str.replace(/[<&]/g, function(ch) {
    return ch == "&" ? "&amp;" : "&lt;";
  });
}

function highlight(s: stream$Writable, code: string, lang = "python") {
  var modeName = lang;

  var found =
    CodeMirror.findModeByMIME(lang) || CodeMirror.findModeByName(lang);
  if (found) {
    modeName = found.mode;
    lang = found.mime;
  }

  var curStyle = null,
    accum = "";

  function flush() {
    if (curStyle)
      s.write(
        '<span class="' +
          curStyle.replace(/(^|\s+)/g, "$1cm-") +
          '">' +
          esc(accum) +
          "</span>"
      );
    else s.write(esc(accum));
  }

  CodeMirror.runMode(code, lang, function(text, style) {
    if (style != curStyle) {
      flush();
      curStyle = style;
      accum = text;
    } else {
      accum += text;
    }
  });
  flush();
}
