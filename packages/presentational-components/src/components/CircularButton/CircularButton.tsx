import React, { HTMLAttributes } from "react";

import classnames from "classnames";
import { ProgressRing } from "./ProgressRing";

export interface Props extends HTMLAttributes<HTMLButtonElement> {
  showPercent?: boolean;
  percent?: number;
  children?: React.ReactNode | React.ReactNodeArray;
  buttonRef?: any;
}

export class CircularButton extends React.PureComponent<Props> {
  buttonRef: any;

  constructor(props: Props) {
    super(props);

    this.buttonRef = props.buttonRef || undefined;
  }

  render() {
    const {
      showPercent,
      percent,
      children,
      className: additionalClasses,
      buttonRef,
      ...props
    } = this.props;

    const classes = classnames(
      "circular-button",
      "mdl-button",
      "mdl-button-js",
      "mdl-button--fab",
      "mdl-button-js-ripple-effect",
      "mdl-button--colored",
      { progress: showPercent },
      additionalClasses
    );

    return (
      <button ref={this.buttonRef} className={classes} {...props}>
        {children}
        <ProgressRing radius={16} stroke={1} progress={percent || 0} />
      </button>
    );
  }
}
