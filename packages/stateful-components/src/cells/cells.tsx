import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";

import { AppState, ContentRef, selectors } from "@nteract/core";

import Cell from "./cell";
import RawCell from "./raw-cell";
import MarkdownCell from "./markdown-cell";
import CodeCell from "./code-cell";

interface ComponentProps {
  contentRef: ContentRef;
  children?: React.ReactNode;
}

interface StateProps {
  cellOrder: Immutable.List<string>;
}

export class Cells extends React.Component<StateProps & ComponentProps> {
  render() {
    const { cellOrder, contentRef, children } = this.props;
    return (
      <div className="nteract-cells">
        {cellOrder.map((id: string) =>
          children ? (
            React.cloneElement(children, { id, contentRef })
          ) : (
            <Cell id={id} contentRef={contentRef} key={id}>
              <MarkdownCell id={id} contentRef={contentRef} />
              <RawCell id={id} contentRef={contentRef} />
              <CodeCell id={id} contentRef={contentRef} />
            </Cell>
          )
        )}
      </div>
    );
  }
}

export const makeMapStateToProps = (
  state: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const mapStateToProps = (state: AppState) => {
    const { contentRef } = ownProps;
    const model = selectors.model(state, { contentRef });

    let cellOrder = Immutable.List();

    if (model && model.type === "notebook") {
      cellOrder = model.notebook.cellOrder;
    }

    return {
      cellOrder
    };
  };
  return mapStateToProps;
};

export default connect<StateProps, void, ComponentProps, AppState>(
  makeMapStateToProps
)(Cells);
