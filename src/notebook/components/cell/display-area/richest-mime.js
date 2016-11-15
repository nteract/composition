// @flow
import React from 'react';
import { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { richestMimetype, transforms, displayOrder } from '../../transforms';

type Props = {
  displayOrder: ImmutableList<string>,
  transforms: ImmutableMap<string, any>,
  bundle: ImmutableMap<string, any>,
  metadata: ImmutableMap<string, any>,
  theme: string,
};

export default class RichestMime extends React.Component {
  props: Props;

  static defaultProps = {
    transforms,
    displayOrder,
    theme: 'light',
    metadata: new ImmutableMap(),
    bundle: new ImmutableMap(),
  };

  shouldComponentUpdate(nextProps: Props): boolean {  // eslint-disable-line class-methods-use-this
    if (nextProps && nextProps.theme && this.props && nextProps.theme !== this.props.theme) {
      return true;
    }
    // return false;
    return true;
  }

  render(): ?React.Element<any>|null {
    const mimetype = richestMimetype(
      this.props.bundle,
      this.props.displayOrder,
      this.props.transforms
    );

    if (!mimetype) {
      // If no mimetype is supported, don't return a component
      return null;
    }

    const Transform = this.props.transforms.get(mimetype);
    const data = this.props.bundle.get(mimetype);
    const metadata = this.props.metadata.get(mimetype);
    return <Transform data={data} metadata={metadata} theme={this.props.theme} />;
  }
}
