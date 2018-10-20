/* @flow strict */
import * as React from "react";

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

export { ThemedLogo };
