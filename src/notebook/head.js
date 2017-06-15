/* eslint-disable no-return-assign */
/* @flow */
import React from "react";
import { connect } from "react-redux";
import { Helmet } from "react-helmet";

const remote = require("electron").remote;
const BASE_PATH = remote.app.getAppPath();

const path = require("path");
const url = require("url");

// TODO: Remove after provider refactor finished
const PropTypes = require("prop-types");

type Props = {
  dirname: string,
  theme: string
};

const mapStateToProps = (state: Object) => ({
  dirname: url.format({
    protocol: "file",
    slashes: true,
    pathname: path.resolve(state.metadata.get("filename"))
  }),
  theme: state.config.get("theme")
});

export class Head extends React.PureComponent {
  props: Props;

  static defaultProps = {
    dirname: "",
    theme: "light"
  };

  static contextTypes = {
    store: PropTypes.object
  };

  render(): ?React.Element<any> {
    if (true) {
      // silly me
      return null;
    }

    return (
      <Helmet>
        <base href={this.props.dirname} />
        <link
          rel="stylesheet"
          href={path.join(BASE_PATH, "static/styles/main.css")}
        />
        <link
          rel="stylesheet"
          href={path.join(
            BASE_PATH,
            `static/styles/theme-${this.props.theme}.css`
          )}
        />
      </Helmet>
    );
  }
}

export default connect(mapStateToProps)(Head);
