import logo from "../images/code-book-logo-light-gray.svg";
import * as React from "react";

interface ThemedLogoProps {
  height?: number;
  theme?: "light" | "dark";
}

const ThemedLogo = (props: ThemedLogoProps): JSX.Element => (
  <img src={logo} alt="code-book logo" />
);

ThemedLogo.defaultProps = {
  height: 20.0,
  theme: "light"
};

export { ThemedLogo };
