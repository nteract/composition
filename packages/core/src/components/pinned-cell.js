// @flow
import * as React from "react";
import { LinkExternalOcticon } from "@nteract/octicons";

export const PinnedPlaceHolderCell = () => (
  <div className="cell-placeholder">
    <span className="octicon">
      <LinkExternalOcticon />
    </span>
    <style jsx>{`
      .cell-placeholder {
        text-align: center;
        color: var(--main-fg-color);
        padding: 10px;
        opacity: var(--cell-placeholder-opacity, 0.3);
      }

      .octicon {
        transition: color 0.5s;
      }
    `}</style>
  </div>
);
export class StickyCellContainer extends React.Component<*, *> {
  stickyCellsPlaceholder: ?HTMLElement;
  stickyCellContainer: ?HTMLElement;

  componentDidUpdate(prevProps: *): void {
    if (this.stickyCellsPlaceholder && this.stickyCellContainer) {
      // Make sure the document is vertically shifted so the top non-stickied
      // cell is always visible.
      this.stickyCellsPlaceholder.style.height = `${
        this.stickyCellContainer.clientHeight
      }px`;
    }
  }

  render() {
    if (
      !this.props.children ||
      React.Children.count(this.props.children) === 0
    ) {
      return null;
    }

    return (
      <div>
        <div
          className="sticky-cells-placeholder"
          ref={ref => {
            this.stickyCellsPlaceholder = ref;
          }}
        />
        <div
          className="sticky-cell-container"
          ref={ref => {
            this.stickyCellContainer = ref;
          }}
        >
          {this.props.children}
        </div>
        <style jsx>{`
          .sticky-cell-container {
            background: var(--main-bg-color, white);
            border-bottom: dashed var(--primary-border, #cbcbcb) 1px;

            top: 0px;
            position: fixed;
            z-index: 300;
            width: 100%;
            max-height: 50%;

            padding-left: 10px;
            padding-right: 10px;
            padding-bottom: 10px;
            padding-top: 20px;

            overflow: auto;
          }

          .sticky-cell-container:empty {
            display: none;
          }

          .sticky-cell-container > :global(*) {
            margin: 20px;
          }
        `}</style>
      </div>
    );
  }
}
