import { theme } from "@nteract/mythic-configuration";
import React from "react";
import { connect } from "react-redux";

import { AppState, selectors } from "@nteract/core";
import { LightTheme, DarkTheme } from "@nteract/presentational-components";

interface ComponentProps {
  children: React.ReactNode;
}

interface StateProps {
  theme: string;
}

export class Themer extends React.Component<ComponentProps & StateProps> {
  render() {
    if (this.props.theme === "dark") {
      return (
        <React.Fragment>
          {this.props.children}
          <DarkTheme />
        </React.Fragment>
      );
    } else {
      return (
        <React.Fragment>
          {this.props.children}
          <LightTheme />
        </React.Fragment>
      );
    }
  }
}

const makeMapStateToProps = (initialState: AppState) => {
  const mapStateToProps = (state: AppState) => {
    return {
      theme: theme(state)
    };
  };
  return mapStateToProps;
};

export default connect(makeMapStateToProps)(Themer);
