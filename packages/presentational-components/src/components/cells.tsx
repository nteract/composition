import * as React from "react";

interface CellsProps {
  children: React.ReactNode;
};

export const Cells = (props: CellsProps) => {
  return (
    <React.Fragment>
      <div className="cells">{props.children}</div>
      <style jsx>{`
        .cells > :global(*) {
          margin: 20px 0;
        }

        .cells {
          font-family: "Source Sans Pro", Helvetica Neue, Helvetica, sans-serif;
          font-size: 16px;
          background-color: var(--theme-app-bg);
          color: var(--theme-app-fg);

          padding-bottom: 10px;
        }
      `}</style>
    </React.Fragment>
  );
};

Cells.defaultProps = {
  children: []
};
