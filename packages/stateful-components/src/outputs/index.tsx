import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";

import { selectors, AppState, ContentRef } from "@nteract/core";
import { Output } from "@nteract/outputs";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
}

interface StateProps {
  hidden: boolean;
  expanded: boolean;
  outputs: Immutable.List<any>;
}

export class Outputs extends React.PureComponent<ComponentProps & StateProps> {
  render() {
    const { outputs, children, hidden, expanded } = this.props;
    return (
      <div
        className={`nteract-outputs ${hidden && "hidden"} ${expanded &&
          "expanded"}`}
      >
        {outputs.map((output, index) => (
          <Output output={output} index={index}>
            {children}
          </Output>
        ))}
      </div>
    );
  }
}

export const makeMapStateToProps = (
  initialState: AppState,
  ownProps: ComponentProps
): ((state: AppState) => StateProps) => {
  const mapStateToProps = (state: AppState): StateProps => {
    let outputs = Immutable.List();
    let hidden = false;
    let expanded = false;

    const { contentRef, id } = ownProps;
    const model = selectors.model(state, { contentRef });

    if (model && model.type == "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        outputs = cell.get("outputs", Immutable.List());
        hidden =
          cell.cell_type === "code" && cell.getIn(["metadata", "outputHidden"]);
        expanded =
          cell.cell_type === "code" &&
          cell.getIn(["metadata", "outputExpanded"]);
      }
    }

    return { outputs, hidden, expanded };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps, null)(Outputs);
