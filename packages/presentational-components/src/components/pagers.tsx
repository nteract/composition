import * as React from "react";

import { Outputs } from "./outputs";

/**
 * Description
 */

interface PagersProps {
  children: React.ReactNode[],
  hidden: boolean
};

export class Pagers extends React.Component<PagersProps> {
  static defaultProps = {
    children: null,
    hidden: false
  };

  render() {
    if (
      this.props.hidden ||
      this.props.children === null ||
      React.Children.count(this.props.children) === 0
    ) {
      return null;
    }
    return (
      <div className="pagers">
        {/*
        Implementation wise, the CSS _is_ the same as the outputs even
        if these aren't actually outputs.

        One noted difference is the background color of the pagers though
        */}
        <Outputs>{this.props.children}</Outputs>
        <style jsx>{`
          .pagers {
            background-color: var(--theme-pager-bg, #fafafa);
          }
        `}</style>
      </div>
    );
  }
}
