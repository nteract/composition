import css from "styled-jsx/css";

export default css`
  .button-text {
    margin: 0 10px 10px 0;
    -webkit-appearance: none;
    padding: 5px 15px;
    background: white;
    border: 1px solid #bbb;
    color: #555;
    border-radius: 3px;
    cursor: pointer;
  }
  .button-text.selected {
    border-color: #1d8bf1;
    color: #1d8bf1;
  }
  .button-group .button-text {
    margin-right: -1px;
    border-radius: 0;
  }
  .button-group .button-text:first-child {
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
  }
  .button-group .button-text:last-child {
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  .button-group .button-text.selected {
    background: white;
    color: #1d8bf1;
    z-index: 1;
    position: relative;
  }
`;
