// @flow
import React from "react";
import { List as ImmutableList, Map as ImmutableMap } from "immutable";

import { transforms, displayOrder } from "@nteract/transforms";

import Output from "./output";

type Props = {
  displayOrder: ImmutableList<string>,
  outputs: ImmutableList<any>,
  transforms: ImmutableMap<string, any>,
  theme: string,
  expanded: boolean,
  isHidden: boolean,
  models: ImmutableMap<string, any>
};

export const DEFAULT_SCROLL_HEIGHT = 600;

export default class Display extends React.PureComponent {
  props: Props;
  el: HTMLElement;
  recomputeStyle: () => void;

  static defaultProps = {
    transforms,
    displayOrder,
    isHidden: false,
    expanded: false
  };

  render() {
    const { isHidden, outputs, ...props } = this.props;

    if (!isHidden) {
      return (
        <div
          className="cell_display"
          ref={el => {
            this.el = el;
          }}
          style={{
            maxHeight: props.expanded ? "100%" : `${DEFAULT_SCROLL_HEIGHT}px`,
            overflowY: "auto"
          }}
        >
          {outputs
            ? outputs.map((output, index) => (
                <Output key={index} output={output} {...props} />
              ))
            : null}
        </div>
      );
    }
    return null;
  }
}
