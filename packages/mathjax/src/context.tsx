import * as React from "react";

export interface MathJaxObject {
  Hub: {
    Register: {
      StartupHook(str: string, cb: () => void): void;
      MessageHook(str: string, cb: (msg: string) => void): void;
    };
    processSectionDelay: number;
    getJaxFor(node: HTMLElement): any;
    Config(options: object): void;
    Queue(elements: any[], onRender?: () => void): void;
  };
}

export interface MathJaxContextValue {
  MathJax?: MathJaxObject;
  input: "tex" | "ascii";
  // Allow detecting if there's a <Provider> above a <Consumer>
  hasProviderAbove?: boolean;
}

const contextValue: MathJaxContextValue = {
  MathJax: undefined,
  input: "tex",
  hasProviderAbove: undefined
};

const MathJaxContext: React.Context<MathJaxContextValue> = React.createContext(
  contextValue
);

export default MathJaxContext;
