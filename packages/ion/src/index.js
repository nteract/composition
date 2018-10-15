// @flow
import * as React from "react";

import blueprintCSS from "./vendor/blueprint.css.js";

import * as Blueprint from "@blueprintjs/core";

// Takes in a blueprint component, wraps it with styled-jsx
function provideStyle<Props>(
  Component: React.ComponentType<Props>
): React.ComponentType<Props> {
  return (props: Props) => (
    <React.Fragment>
      <Component {...props} />
      <style jsx>{blueprintCSS}</style>
    </React.Fragment>
  );
}

export const H1 = provideStyle(Blueprint.H1);
export const Tag = provideStyle(Blueprint.Tag);
export const EditableText = provideStyle(Blueprint.EditableText);
export const Button = provideStyle(Blueprint.Button);
export const Tooltip = provideStyle(Blueprint.Tooltip);

// non-React components, don't need style injected
export const Position = Blueprint.Position;
