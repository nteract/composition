import Immutable from "immutable";
import React from "react";
import { connect } from "react-redux";

import { selectors, AppState, ContentRef } from "@nteract/core";
import { RichMedia } from "@nteract/outputs";

interface ComponentProps {
  id: string;
  contentRef: ContentRef;
  children: React.ReactNode;
}

interface StateProps {
  pagers: Immutable.List<any>;
}

export class Pagers extends React.PureComponent<ComponentProps & StateProps> {
  render() {
    const { pagers, children } = this.props;
    return (
      <div className="nteract-pagers">
        {pagers.map(pager => (
          <RichMedia data={pager.data} metadata={pager.metadata}>
            {children}
          </RichMedia>
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
    let pagers = Immutable.List();

    const { contentRef, id } = ownProps;
    const model = selectors.model(state, { contentRef });

    if (model && model.type == "notebook") {
      const cell = selectors.notebook.cellById(model, { id });
      if (cell) {
        pagers = model.getIn(["cellPagers", id]) || Immutable.List();
      }
    }

    return { pagers };
  };
  return mapStateToProps;
};

export default connect<StateProps, void, ComponentProps, AppState>(
  makeMapStateToProps
)(Pagers);
