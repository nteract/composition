// @flow
import css from "styled-jsx/css";

const TOP_OFFSET = "20px";
export const modalCss = css`
  /* completions styles */
  dialog {
    // We don't have a reset, so we need to reset some things on dialog.
    width: initial;
    height: initial;
    margin: initial;
    background: initial;
  }
  .modal--overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.25);
    z-index: 10000;
  }
  .modal--content {
    align-items: stretch;
    background-color: var(--theme-app-bg);
    color: var(--theme-app-fg);
    border-radius: 4px;
    border: var(--theme-app-border) 1px solid;
    box-sizing: border-box;
    display: flex;
    flex-flow: column nowrap;
    justify-content: flex-start;
    left: 400px;
    max-height: calc(100vh - ${TOP_OFFSET} * 2);
    outline: none;
    overflow: auto;
    padding: 20px;
    position: absolute;
    right: 400px;
    top: ${TOP_OFFSET};
    z-index: 10000;
  }
  @media only screen and (max-width: 1500px) {
    .modal--content {
      left: 200px;
      right: 200px;
    }
  }
  @media only screen and (max-width: 1000px) {
    .modal--content {
      left: 100px;
      right: 100px;
    }
  }
  @media only screen and (max-width: 600px) {
    .modal--content {
      left: 40px;
      right: 40px;
    }
  }
  .modal--content--header {
    padding: 0 20px 20px 20px;
    border-bottom: var(--theme-app-border) 1px solid;
  }
  .modal--content--body {
    padding: 20px;
  }
  .modal--content--body--field {
    font-weight: bold;
    margin-right: 5px;
  }
  .modal--content--body--value {
    font-family: monospace;
  }
`;
