import css from "styled-jsx/css";

export const light = css`
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
  --prompt-bg: var(--pager-bg);

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
`;
