// @flow
// $FlowFixMe: this is a "fake" import from styled-jsx that gets handled by their babel setup
import css from "styled-jsx/css";

export default css`
  /* completions styles */

  :global(.CodeMirror-hint) {
    padding-left: 0;
    border-bottom: none;
  }

  :global(.completion-type) {
    background: transparent;
    border: transparent 1px solid;
    width: 17px;
    height: 17px;
    margin: 0;
    padding: 0;
    display: inline-block;
    margin-right: 5px;
    top: 18px;
  }

  :global(.completion-type:before) {
    content: "?";
    bottom: 1px;
    left: 4px;
    position: relative;
  }
  /* color and content for each type of completion */
  :global(.completion-type-keyword:before) {
    content: "K";
  }
  :global(.completion-type-keyword) {
    background-color: darkred;
  }

  :global(.completion-type-class:before) {
    content: "C";
  }
  :global(.completion-type-class) {
    background-color: blueviolet;
  }

  :global(.completion-type-module:before) {
    content: "M";
  }
  :global(.completion-type-module) {
    background-color: chocolate;
  }

  :global(.completion-type-statement:before) {
    content: "S";
  }
  :global(.completion-type-statement) {
    background-color: forestgreen;
  }

  :global(.completion-type-function:before) {
    content: "ƒ";
  }
  :global(.completion-type-function) {
    background-color: yellowgreen;
  }

  :global(.completion-type-instance:before) {
    content: "I";
  }
  :global(.completion-type-instance) {
    background-color: teal;
  }

  :global(.completion-type-null:before) {
    content: "ø";
  }
  :global(.completion-type-null) {
    background-color: black;
  }

  /* end completion type color and content */

  /*
    Codemirror
 */

  :global(.CodeMirror) {
    font-family: "Source Code Pro";
    font-size: 14px;
    line-height: 20px;

    height: auto;

    background: none;
  }

  :global(.CodeMirror-cursor) {
    border-left-width: 1px;
    border-left-style: solid;
    border-left-color: var(--cm-color, black);
  }

  :global(.CodeMirror-scroll) {
    overflow-x: auto !important;
    overflow-y: hidden !important;
    width: 100%;
  }

  :global(.CodeMirror-lines) {
    padding: 0.4em;
  }

  :global(.CodeMirror-linenumber) {
    padding: 0 8px 0 4px;
  }

  :global(.CodeMirror-gutters) {
    border-top-left-radius: 2px;
    border-bottom-left-radius: 2px;
  }

  :global(.cm-s-composition.CodeMirror) {
    font-family: "Source Code Pro", monospace;
    letter-spacing: 0.3px;
    word-spacing: 1px;
    background: var(--cm-background, #fafafa);
    color: var(--cm-color, black);
  }
  :global(.cm-s-composition .CodeMirror-lines) {
    padding: 10px;
  }
  :global(.cm-s-composition .CodeMirror-gutters) {
    box-shadow: 1px 0 2px 0 rgba(0, 0, 0, 0.5);
    -webkit-box-shadow: 1px 0 2px 0 rgba(0, 0, 0, 0.5);
    background-color: var(--cm-gutter-bg, white);
    padding-right: 10px;
    z-index: 3;
    border: none;
  }

  :global(.cm-s-composition span.cm-comment) {
    color: var(--cm-comment, #a86);
  }
  :global(.cm-s-composition span.cm-keyword) {
    line-height: 1em;
    font-weight: bold;
    color: var(--cm-keyword, blue);
  }
  :global(.cm-s-composition span.cm-string) {
    color: var(--cm-string, #a22);
  }
  :global(.cm-s-composition span.cm-builtin) {
    line-height: 1em;
    font-weight: bold;
    color: var(--cm-builtin, #077);
  }
  :global(.cm-s-composition span.cm-special) {
    line-height: 1em;
    font-weight: bold;
    color: var(--cm-special, #0aa);
  }
  :global(.cm-s-composition span.cm-variable) {
    color: var(--cm-variable, black);
  }
  :global(.cm-s-composition span.cm-number),
  :global(.cm-s-composition span.cm-atom) {
    color: var(--cm-number, #3a3);
  }
  :global(.cm-s-composition span.cm-meta) {
    color: var(--cm-meta, #555);
  }
  :global(.cm-s-composition span.cm-link) {
    color: var(--cm-link, #3a3);
  }
  :global(.cm-s-composition span.cm-operator) {
    color: var(--cm-operator, black);
  }
  :global(.cm-s-composition span.cm-def) {
    color: var(--cm-def, black);
  }
  :global(.cm-s-composition .CodeMirror-activeline-background) {
    background: var(--cm-activeline-bg, #e8f2ff);
  }
  :global(.cm-s-composition .CodeMirror-matchingbracket) {
    border-bottom: 1px solid var(--cm-matchingbracket-outline, grey);
    color: var(--cm-matchingbracket-color, black) !important;
  }

  /* Overwrite some of the hint Styling */

  :global(.CodeMirror-hints) {
    -webkit-box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.2);
    -moz-box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.2);
    box-shadow: 2px 3px 5px rgba(0, 0, 0, 0.2);
    border-radius: 0px;
    border: none;
    padding: 0;

    background: var(--cm-hint-bg, white);
    font-size: 90%;
    font-family: "Source Code Pro", monospace;

    z-index: 9001;

    overflow-y: auto;
  }

  :global(.CodeMirror-hint) {
    border-radius: 0px;
    white-space: pre;
    cursor: pointer;
    color: var(--cm-hint-color, black);
  }

  :global(li.CodeMirror-hint-active) {
    background: var(--cm-hint-bg-active, #abd1ff);
    color: var(--cm-hint-color-active, black);
  }
`;
