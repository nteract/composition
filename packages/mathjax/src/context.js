/* @flow */
import * as React from "react";

export type MathJaxContextValue = {
  MathJax: ?Object,
  registerNode: () => void
};

const MathJaxContext: React.Context<MathJaxContextValue> = React.createContext({
  MathJax: null,
  registerNode: () => {}
});

export default MathJaxContext;
