import React from "react";

import { ContentRef, AppState, selectors } from "@nteract/core";
import { connect } from "react-redux";

interface ComponentProps {
  children: React.ReactNode;
  id: string;
  contentRef: ContentRef;
}

interface StateProps {
  hidden: boolean;
}

export class Input extends React.Component<ComponentProps & StateProps> {
  render() {
    if (this.props.hidden) {
      return null;
    }

    return <div className="nteract-input">{this.props.children}</div>;
  }
}

const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
) => {
  const mapStateToProps = (state: AppState) => {
    const { contentRef, id } = ownProps;
    const model = selectors.model(state, { contentRef });

    let hidden = false;

    if (model && model.type == "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        hidden = cell.getIn(["metadata", "inputHidden"]);
      }
    }

    return {
      hidden
    };
  };
  return mapStateToProps;
};

export default connect<StateProps, void, ComponentProps, AppState>(
  makeMapStateToProps
)(Input);
