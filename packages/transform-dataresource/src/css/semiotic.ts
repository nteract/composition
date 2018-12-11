import css from "styled-jsx/css";

// NOTE: All these CSS variables should have defaults set so that a developer can drop the data explorer in without
//       needing our CSS variables set

export default css`
  :global(.html-legend-item) {
    color: var(--theme-app-fg);
  }

  :global(.tick > path) {
    stroke: lightgray;
  }

  :global(.axis-labels, .ordinal-labels) {
    fill: var(--theme-app-fg);
    font-size: 14px;
  }

  :global(path.connector, path.connector-end) {
    stroke: var(--theme-app-fg);
  }

  :global(path.connector-end) {
    fill: var(--theme-app-fg);
  }

  :global(text.annotation-note-label, text.legend-title, .legend-item text) {
    fill: var(--theme-app-fg);
    stroke: none;
  }

  :global(.xyframe-area > path) {
    stroke: var(--theme-app-fg);
  }

  :global(.axis-baseline) {
    stroke-opacity: 0.25;
    stroke: var(--theme-app-fg);
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
