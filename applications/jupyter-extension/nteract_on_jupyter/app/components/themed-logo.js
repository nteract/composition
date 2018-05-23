// @flow
import * as React from "react";

import { selectors } from "@nteract/core";
import type { AppState } from "@nteract/core";

import { WideLogo } from "@nteract/logos";

type ThemedLogoProps = {
  height: number,
  theme: "light" | "dark"
};

const ThemedLogo = (props: ThemedLogoProps) => (
  <WideLogo height={props.height} theme={props.theme} />
);

ThemedLogo.defaultProps = {
  height: 20,
  theme: "light"
};

const mapStateToProps = (
  state: AppState,
  ownProps: { height: ?number }
): * => ({
  height: ownProps.height,
  theme: selectors.currentTheme(state)
});

export { ThemedLogo };
