// @flow
import React from 'react';
import { shouldComponentUpdate } from 'react-addons-pure-render-mixin';

type Props = {
  executionCount: any,
  running: boolean,
};

export default class Inputs extends React.Component {
  props: Props
  shouldComponentUpdate: (p: Props, s: void) => boolean;

  constructor(): void {
    super(...arguments);
    this.shouldComponentUpdate = shouldComponentUpdate.bind(this);
  }

  render(): ?React.Element<any> {
    const { executionCount, running } = this.props;
    const count = !executionCount ? ' ' : executionCount;
    const input = running ? '*' : count;
    return (
      <div className="prompt">
        [{input}]
      </div>
    );
  }
}
