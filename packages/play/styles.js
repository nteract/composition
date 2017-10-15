// import css from "styled-jsx/css";

export const lightTheme = `
  :root {
    --main-bg-color: white;
    --main-fg-color: rgb(51, 51, 51);

    --primary-border: #cbcbcb;

    --cell-bg: white;
    --cell-bg-hover: #eeedee;
    --cell-bg-focus: #e2dfe3;

    --toolbar-bg: rgba(255, 255, 255, 0.5);
    --toolbar-button: #aaa;
    --toolbar-button-hover: #555;

    --dropdown-content: var(--cell-bg-hover);
    --dropdown-content-hover: var(--cell-bg-focus);

    --pager-bg: #fafafa;
    --input-color: #8c8a8e;

    --cm-background: #fafafa;
    --cm-color: black;

    --cm-gutter-bg: white;

    --cm-comment: #a86;
    --cm-keyword: blue;
    --cm-string: #a22;
    --cm-builtin: #077;
    --cm-special: #0aa;
    --cm-variable: black;
    --cm-number: #3a3;
    --cm-meta: #555;
    --cm-link: #3a3;
    --cm-operator: black;
    --cm-def: black;

    --cm-activeline-bg: #e8f2ff;
    --cm-matchingbracket-outline: grey;
    --cm-matchingbracket-color: black;

    --cm-hint-color: var(--cm-color);
    --cm-hint-color-active: var(--cm-color);
    --cm-hint-bg: var(--main-bg-color);
    --cm-hint-bg-active: #abd1ff;

    --status-bar: #eeedee;
  }

  /* -------------------- */
  /* Miscellaneous Styles */
  /* -------------------- */

  body {
    line-height: 1.3 !important;
  }

  /*custom scrollbar for notebook cells and hint box*/
  div::-webkit-scrollbar,
  ul::-webkit-scrollbar {
    width: 11px;
    height: 11px;
  }
  div::-webkit-scrollbar-track,
  ul::-webkit-scrollbar-track {
    -webkit-box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
  }
  div::-webkit-scrollbar-thumb,
  ul::-webkit-scrollbar-thumb {
    background-color: rgba(199, 199, 199, 0.4);
  }
  div::-webkit-scrollbar-thumb:hover,
  ul::-webkit-scrollbar-thumb:hover {
    background-color: rgba(199, 199, 199, 0.6);
  }
  div::-webkit-scrollbar-thumb:active,
  ul::-webkit-scrollbar-thumb:active {
    background-color: rgba(199, 199, 199, 0.8);
  }
  div::-webkit-scrollbar-corner,
  ul::-webkit-scrollbar-corner {
    background-color: transparent;
  }
`;

export const darkTheme = `
:root {
  --main-bg-color: #2b2b2b;
  --main-fg-color: #ccc;

  --primary-border: #cbcbcb;

  --cell-bg: #2b2b2b;
  --cell-bg-hover: #151515;
  --cell-bg-focus: #1f1f1f;

  --toolbar-bg: rgba(0,0,0,.3);;
  --toolbar-button: #aaa;
  --toolbar-button-hover: #555;

  --dropdown-content: var(--cell-bg-focus);
  --dropdown-content-hover: var(--cell-bg-hover);

  --pager-bg: #111;
  --input-color: #fafafa;

  --cm-background: #111;
  --cm-color: #ecf0f1;

  --cm-gutter-bg: #777;

  --cm-comment: #777;
  --cm-keyword: #3498db;
  --cm-string: #f1c40f;
  --cm-builtin: #16a085;
  --cm-special: #1abc9c;
  --cm-variable: #ecf0f1;
  --cm-number: #2ecc71;
  --cm-meta: #95a5a6;
  --cm-link: #2ecc71;
  --cm-operator: #ecf0f1;
  --cm-def: #ecf0f1;

  --cm-activeline-bg: #e8f2ff;
  --cm-matchingbracket-outline: grey;
  --cm-matchingbracket-color: white;

  --cm-hint-color: var(--main-fg-color);
  --cm-hint-color-active: var(--cm-color);
  --cm-hint-bg: var(--main-bg-color);
  --cm-hint-bg-active: var(--pager-bg);

  --status-bar: #111;
}

/* -------------------- */
/* Miscellaneous Styles */
/* -------------------- */

body
{
  line-height: 1.3 !important;
}

/*custom scrollbar for notebook cells and hint box*/
div::-webkit-scrollbar, ul::-webkit-scrollbar {
      width: 11px;
      height: 11px;
}
div::-webkit-scrollbar-track, ul::-webkit-scrollbar-track {
      -webkit-box-shadow: inset 0 0 10px rgba(0,0,0,0.3);
}
div::-webkit-scrollbar-thumb, ul::-webkit-scrollbar-thumb {
      background-color: rgba(204,204,204, .6);
}
div::-webkit-scrollbar-thumb:hover, ul::-webkit-scrollbar-thumb:hover {
      background-color: rgba(204,204,204, .7);
}
div::-webkit-scrollbar-thumb:active, ul::-webkit-scrollbar-thumb:active {
      background-color: rgba(204,204,204, .9);
}
div::-webkit-scrollbar-corner, ul::-webkit-scrollbar-corner {
      background-color: transparent;
}
`;
