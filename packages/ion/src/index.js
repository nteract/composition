// @flow
import * as React from "react";
import blueprintCSS from "./vendor/blueprint.css.js";

export * from "@blueprintjs/core";

// Higher order component (https://reactjs.org/docs/higher-order-components.html)
// for providing the style to components used underneath
export function provideStyle<Props>(
  Component: React.ComponentType<Props>
): React.ComponentType<Props> {
  return (props: Props) => (
    <React.Fragment>
      <Component {...props} />
      <style jsx>{blueprintCSS}</style>
    </React.Fragment>
  );
}

export { blueprintCSS };
