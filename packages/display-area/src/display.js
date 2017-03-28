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

const DEFAULT_SCROLL_HEIGHT = 600;

export default class Display extends React.PureComponent {
  props: Props;
  recomputeStyle: () => void;
  el: HTMLElement;

  static defaultProps = {
    transforms,
    displayOrder,
    isHidden: false,
    expanded: false
  };

  constructor() {
    super();
    this.recomputeStyle = this.recomputeStyle.bind(this);
  }

  componentDidMount() {
    this.recomputeStyle();
  }

  componentDidUpdate() {
    this.recomputeStyle();
  }

  recomputeStyle(): void {
    if (!this.el) {
      return;
    }
    if (!this.props.expanded && this.el.scrollHeight > DEFAULT_SCROLL_HEIGHT) {
      this.el.style.height = `${DEFAULT_SCROLL_HEIGHT}px`;
      this.el.style.overflowY = "scroll";
      return;
    }

    this.el.style.height = "auto";
    this.el.style.overflowY = "overflow";
  }

  render() {
    const { isHidden, outputs, ...props } = this.props;

    if (!isHidden) {
      return (
        <div
          className="cell_display"
          ref={el => {
            this.el = el;
          }}
        >
          {outputs.map((output, index) => (
            <Output key={index} output={output} {...props} />
          ))}
        </div>
      );
    }
    return null;
  }
}
