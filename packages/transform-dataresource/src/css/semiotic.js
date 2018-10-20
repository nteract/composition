import css from "styled-jsx/css";

export default css`
  :global(.tick > path) {
    stroke: lightgray;
  }

  :global(.axis-labels) {
    fill: #aaa;
    font-size: 14px;
  }
  :global(.axis-baseline) {
    stroke-opacity: 0.25;
  }
  :global(circle.frame-hover) {
    fill: none;
    stroke: gray;
  }
  :global(.rect) {
    stroke: green;
    stroke-width: 5px;
    stroke-opacity: 0.5;
  }
  :global(rect.selection) {
    opacity: 0.5;
  }
`;
