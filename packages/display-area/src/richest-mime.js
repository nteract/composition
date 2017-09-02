// @flow
import React from "react";

import { richestMimetype, transforms, displayOrder } from "@nteract/transforms";

type Props = {
  expanded: boolean,
  displayOrder: Array<string>,
  transforms: Object,
  bundle: Object,
  metadata: Object,
  theme: string,
  models?: Object
};

export default class RichestMime extends React.Component<Props> {
  static defaultProps = {
    transforms,
    displayOrder,
    theme: "light",
    metadata: {},
    bundle: {},
    models: {}
  };

  shouldComponentUpdate(nextProps: Props): boolean {
    // eslint-disable-line class-methods-use-this
    if (
      nextProps &&
      nextProps.theme &&
      this.props &&
      nextProps.theme !== this.props.theme
    ) {
      return true;
    }
    // return false;
    return true;
  }

  render(): ?React$Element<any> | null {
    const mimetype = richestMimetype(
      this.props.bundle,
      this.props.displayOrder,
      this.props.transforms
    );

    if (!mimetype) {
      // If no mimetype is supported, don't return a component
      return null;
    }

    const Transform = this.props.transforms[mimetype];
    const data = this.props.bundle[mimetype];
    const metadata = this.props.metadata[mimetype];
    return (
      <Transform
        expanded={this.props.expanded}
        data={data}
        metadata={metadata}
        theme={this.props.theme}
        models={this.props.models}
      />
    );
  }
}
