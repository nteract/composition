import * as React from "react";

interface CellProps {
  /**
   * Indicates if a cell is selected
   */
  isSelected: boolean,
  /**
   * Indicates if hovering over a cell
   */
  _hovered: boolean,
  /**
   * Style children when a cell is selected or hovered over
   */
  children?: React.ReactNode
};

/** @component */
export const Cell = (props: CellProps): React.ReactNode => {
  const children = props.children;

  return (
    <div className={`cell ${props.isSelected ? "focused" : ""} ${
        props._hovered ? "overrideHover" : ""
      }`}
    >
      <style jsx>{`
        .cell {
          position: relative;
          background: var(--theme-cell-bg, white);
          transition: all 0.1s ease-in-out;
        }

        .cell.overrideHover,
        .cell:hover {
          box-shadow: var(
            --theme-cell-shadow-hover,
            1px 1px 3px rgba(0, 0, 0, 0.12),
            -1px -1px 3px rgba(0, 0, 0, 0.12)
          );
        }

        .cell.focused {
          box-shadow: var(
            --theme-cell-shadow-focus,
            3px 3px 9px rgba(0, 0, 0, 0.12),
            -3px -3px 9px rgba(0, 0, 0, 0.12)
          );
        }

        .cell.overrideHover :global(.prompt),
        .cell:hover :global(.prompt),
        .cell:active :global(.prompt) {
          background-color: var(--theme-cell-prompt-bg-hover, hsl(0, 0%, 94%));
          color: var(--theme-cell-prompt-fg-hover, hsl(0, 0%, 15%));
        }

        .cell:focus :global(.prompt),
        .cell.focused :global(.prompt) {
          background-color: var(--theme-cell-prompt-bg-focus, hsl(0, 0%, 90%));
          color: var(--theme-cell-prompt-fg-focus, hsl(0, 0%, 51%));
        }

        .cell.focused :global(.outputs) {
          overflow-y: auto;
        }
      `}</style>
      {children}
    </div>
  );
};

Cell.defaultProps = {
  isSelected: false,
  _hovered: false,
  children: null
};
