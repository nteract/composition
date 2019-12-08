import React from "react";
import { connect } from "react-redux";

import { ContentRef, AppState, selectors } from "@nteract/core";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children: React.ReactNode;
}

interface StateProps {
  status?: string;
  executionCount?: number;
}

export class Prompt extends React.Component<ComponentProps, StateProps> {
  render() {
    const { children } = this.props;
    return (
      <div className="nteract-cell-prompt">
        {React.cloneElement(children, this.props)}
      </div>
    );
  }
}

const makeMapStateToProps = (
  state: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const mapStateToProps = (state: AppState) => {
    const { contentRef, id } = ownProps;
    const model = selectors.model(state, { contentRef });

    let status;
    let executionCount;

    if (model && model.type == "notebook") {
      status = model.transient.getIn(["cellMap", id, "status"]);
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        executionCount = cell.get("execution_count", undefined);
      }
    }

    return {
      status,
      executionCount
    };
  };
  return mapStateToProps;
};

export default connect<StateProps, void, ComponentProps, AppState>(
  makeMapStateToProps
)(Prompt);
