import css from "styled-jsx/css";

// This file contains the base codemirror styles for including in the base editor
export default css`
  /* BASICS */

  :global(.CodeMirror) {
    /* Set height, width, borders, and global font properties here */
    font-family: monospace;
    height: 100%;
    color: black;
    direction: ltr;
  }

  /* PADDING */

  :global(.CodeMirror-lines) {
    padding: 4px 0; /* Vertical padding around content */
  }
  :global(.CodeMirror pre) {
    padding: 0 4px; /* Horizontal padding of content */
  }

  :global(.CodeMirror-scrollbar-filler),
  :global(.CodeMirror-gutter-filler) {
    background-color: white; /* The little square between H and V scrollbars */
  }

  /* GUTTER */

  :global(.CodeMirror-gutters) {
    border-right: 1px solid #ddd;
    background-color: #f7f7f7;
    white-space: nowrap;
  }
  :global(.CodeMirror-linenumbers) {
  }
  :global(.CodeMirror-linenumber) {
    padding: 0 3px 0 5px;
    min-width: 20px;
    text-align: right;
    color: #999;
    white-space: nowrap;
  }

  :global(.CodeMirror-guttermarker) {
    color: black;
  }
  :global(.CodeMirror-guttermarker-subtle) {
    color: #999;
  }

  /* CURSOR */

  :global(.CodeMirror-cursor) {
    border-left: 1px solid black;
    border-right: none;
    width: 0;
  }
  /* Shown when moving in bi-directional text */
  :global(.CodeMirror div.CodeMirror-secondarycursor) {
    border-left: 1px solid silver;
  }
  :global(.cm-fat-cursor .CodeMirror-cursor) {
    width: auto;
    border: 0 !important;
    background: #7e7;
  }
  :global(.cm-fat-cursor div.CodeMirror-cursors) {
    z-index: 1;
  }
  :global(.cm-fat-cursor-mark) {
    background-color: rgba(20, 255, 20, 0.5);
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
  }
  :global(.cm-animate-fat-cursor) {
    width: auto;
    border: 0;
    -webkit-animation: blink 1.06s steps(1) infinite;
    -moz-animation: blink 1.06s steps(1) infinite;
    animation: blink 1.06s steps(1) infinite;
    background-color: #7e7;
  }

  @-moz-keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }
  @-webkit-keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }
  @keyframes blink {
    0% {
    }
    50% {
      background-color: transparent;
    }
    100% {
    }
  }

  /* Can style cursor different in overwrite (non-insert) mode */
  :global(.CodeMirror-overwrite .CodeMirror-cursor) {
  }

  :global(.cm-tab) {
    display: inline-block;
    text-decoration: inherit;
  }

  :global(.CodeMirror-rulers) {
    position: absolute;
    left: 0;
    right: 0;
    top: -50px;
    bottom: -20px;
    overflow: hidden;
  }
  :global(.CodeMirror-ruler) {
    border-left: 1px solid #ccc;
    top: 0;
    bottom: 0;
    position: absolute;
  }

  /* DEFAULT THEME */

  :global(.cm-s-default .cm-header) {
    color: blue;
  }
  :global(.cm-s-default .cm-quote) {
    color: #090;
  }
  :global(.cm-negative) {
    color: #d44;
  }
  :global(.cm-positive) {
    color: #292;
  }
  :global(.cm-header),
  :global(.cm-strong) {
    font-weight: bold;
  }
  :global(.cm-em) {
    font-style: italic;
  }
  :global(.cm-link) {
    text-decoration: underline;
  }
  :global(.cm-strikethrough) {
    text-decoration: line-through;
  }

  :global(.cm-s-default .cm-keyword) {
    color: #708;
  }
  :global(.cm-s-default .cm-atom) {
    color: #219;
  }
  :global(.cm-s-default .cm-number) {
    color: #164;
  }
  :global(.cm-s-default .cm-def) {
    color: #00f;
  }
  :global(.cm-s-default .cm-variable),
  :global(.cm-s-default .cm-punctuation),
  :global(.cm-s-default .cm-property),
  :global(.cm-s-default .cm-operator) {
  }
  :global(.cm-s-default .cm-variable-2) {
    color: #05a;
  }
  :global(.cm-s-default .cm-variable-3),
  :global(.cm-s-default .cm-type) {
    color: #085;
  }
  :global(.cm-s-default .cm-comment) {
    color: #a50;
  }
  :global(.cm-s-default .cm-string) {
    color: #a11;
  }
  :global(.cm-s-default .cm-string-2) {
    color: #f50;
  }
  :global(.cm-s-default .cm-meta) {
    color: #555;
  }
  :global(.cm-s-default .cm-qualifier) {
    color: #555;
  }
  :global(.cm-s-default .cm-builtin) {
    color: #30a;
  }
  :global(.cm-s-default .cm-bracket) {
    color: #997;
  }
  :global(.cm-s-default .cm-tag) {
    color: #170;
  }
  :global(.cm-s-default .cm-attribute) {
    color: #00c;
  }
  :global(.cm-s-default .cm-hr) {
    color: #999;
  }
  :global(.cm-s-default .cm-link) {
    color: #00c;
  }

  :global(.cm-s-default .cm-error) {
    color: #f00;
  }
  :global(.cm-invalidchar) {
    color: #f00;
  }

  :global(.CodeMirror-composing) {
    border-bottom: 2px solid;
  }

  /* Default styles for common addons */

  :global(div.CodeMirror span.CodeMirror-matchingbracket) {
    color: #0f0;
  }
  :global(div.CodeMirror span.CodeMirror-nonmatchingbracket) {
    color: #f22;
  }
  :global(.CodeMirror-matchingtag) {
    background: rgba(255, 150, 0, 0.3);
  }
  :global(.CodeMirror-activeline-background) {
    background: #e8f2ff;
  }

  /* STOP */

  /* The rest of this file contains styles related to the mechanics of
   the editor. You probably shouldn't touch them. */

  :global(.CodeMirror) {
    position: relative;
    overflow: hidden;
    background: white;
  }

  :global(.CodeMirror-scroll) {
    overflow: scroll !important; /* Things will break if this is overridden */
    /* 30px is the magic margin used to hide the element's real scrollbars */
    /* See overflow: hidden in .CodeMirror */
    margin-bottom: -30px;
    margin-right: -30px;
    padding-bottom: 30px;
    height: 100%;
    outline: none; /* Prevent dragging from highlighting the element */
    position: relative;
  }
  :global(.CodeMirror-sizer) {
    position: relative;
    border-right: 30px solid transparent;
  }

  /* The fake, visible scrollbars. Used to force redraw during scrolling
   before actual scrolling happens, thus preventing shaking and
   flickering artifacts. */
  :global(.CodeMirror-vscrollbar),
  :global(.CodeMirror-hscrollbar),
  :global(.CodeMirror-scrollbar-filler),
  :global(.CodeMirror-gutter-filler) {
    position: absolute;
    z-index: 6;
    display: none;
  }
  :global(.CodeMirror-vscrollbar) {
    right: 0;
    top: 0;
    overflow-x: hidden;
    overflow-y: scroll;
  }
  :global(.CodeMirror-hscrollbar) {
    bottom: 0;
    left: 0;
    overflow-y: hidden;
    overflow-x: scroll;
  }
  :global(.CodeMirror-scrollbar-filler) {
    right: 0;
    bottom: 0;
  }
  :global(.CodeMirror-gutter-filler) {
    left: 0;
    bottom: 0;
  }

  :global(.CodeMirror-gutters) {
    position: absolute;
    left: 0;
    top: 0;
    min-height: 100%;
    z-index: 3;
  }
  :global(.CodeMirror-gutter) {
    white-space: normal;
    height: 100%;
    display: inline-block;
    vertical-align: top;
    margin-bottom: -30px;
  }
  :global(.CodeMirror-gutter-wrapper) {
    position: absolute;
    z-index: 4;
    background: none !important;
    border: none !important;
  }
  :global(.CodeMirror-gutter-background) {
    position: absolute;
    top: 0;
    bottom: 0;
    z-index: 4;
  }
  :global(.CodeMirror-gutter-elt) {
    position: absolute;
    cursor: default;
    z-index: 4;
  }
  :global(.CodeMirror-gutter-wrapper ::selection) {
    background-color: transparent;
  }
  :global(.CodeMirror-gutter-wrapper ::-moz-selection) {
    background-color: transparent;
  }

  :global(.CodeMirror-lines) {
    cursor: text;
    min-height: 1px; /* prevents collapsing before first draw */
  }
  :global(.CodeMirror pre) {
    /* Reset some styles that the rest of the page might have set */
    -moz-border-radius: 0;
    -webkit-border-radius: 0;
    border-radius: 0;
    border-width: 0;
    background: transparent;
    font-family: inherit;
    font-size: inherit;
    margin: 0;
    white-space: pre;
    word-wrap: normal;
    line-height: inherit;
    color: inherit;
    z-index: 2;
    position: relative;
    overflow: visible;
    -webkit-tap-highlight-color: transparent;
    -webkit-font-variant-ligatures: contextual;
    font-variant-ligatures: contextual;
  }
  :global(.CodeMirror-wrap pre) {
    word-wrap: break-word;
    white-space: pre-wrap;
    word-break: normal;
  }

  :global(.CodeMirror-linebackground) {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 0;
  }

  :global(.CodeMirror-linewidget) {
    position: relative;
    z-index: 2;
    overflow: auto;
  }

  :global(.CodeMirror-widget) {
  }

  :global(.CodeMirror-rtl pre) {
    direction: rtl;
  }

  :global(.CodeMirror-code) {
    outline: none;
  }

  /* Force content-box sizing for the elements where we expect it */
  :global(.CodeMirror-scroll),
  :global(.CodeMirror-sizer),
  :global(.CodeMirror-gutter),
  :global(.CodeMirror-gutters),
  :global(.CodeMirror-linenumber) {
    -moz-box-sizing: content-box;
    box-sizing: content-box;
  }

  :global(.CodeMirror-measure) {
    position: absolute;
    width: 100%;
    height: 0;
    overflow: hidden;
    visibility: hidden;
  }

  :global(.CodeMirror-cursor) {
    position: absolute;
    pointer-events: none;
  }
  :global(.CodeMirror-measure pre) {
    position: static;
  }

  :global(div.CodeMirror-cursors) {
    visibility: hidden;
    position: relative;
    z-index: 3;
  }
  :global(div.CodeMirror-dragcursors) {
    visibility: visible;
  }

  :global(.CodeMirror-focused div.CodeMirror-cursors) {
    visibility: visible;
  }

  :global(.CodeMirror-selected) {
    background: #d9d9d9;
  }
  :global(.CodeMirror-focused .CodeMirror-selected) {
    background: #d7d4f0;
  }
  :global(.CodeMirror-crosshair) {
    cursor: crosshair;
  }
  :global(.CodeMirror-line::selection),
  :global(.CodeMirror-line > span::selection),
  :global(.CodeMirror-line > span > span::selection) {
    background: #d7d4f0;
  }
  :global(.CodeMirror-line::-moz-selection),
  :global(.CodeMirror-line > span::-moz-selection),
  :global(.CodeMirror-line > span > span::-moz-selection) {
    background: #d7d4f0;
  }

  :global(.cm-searching) {
    background-color: #ffa;
    background-color: rgba(255, 255, 0, 0.4);
  }

  /* Used to force a border model for a node */
  :global(.cm-force-border) {
    padding-right: 0.1px;
  }

  /* See issue #2901 */
  :global(.cm-tab-wrap-hack:after) {
    content: "";
  }

  /* Help users use markselection to safely style text background */
  :global(span.CodeMirror-selectedtext) {
    background: none;
  }
`;
