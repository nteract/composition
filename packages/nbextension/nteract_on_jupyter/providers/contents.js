// @flow
import React, { Component } from "react";
import { connect } from "react-redux";

import ContentsView from "../views/contents";

type ContentsProps = {
  contents: Object
};

// TODO: Declare state type
function mapStateToProps(state: Object): ContentsProps {
  return {
    contents: state.contents
  };
}

class Contents extends Component<ContentsProps> {
  render(): React$Element<*> {
    const props = {
      ...this.props
    };

    return <ContentsView {...props} />;
  }
}

export default connect(mapStateToProps)(Contents);
