import React from 'react';

export default class TextDisplay extends React.Component {
  static propTypes = {
    data: React.PropTypes.string,
  }

  render() {
    return (
      <pre>{this.props.data}</pre>
    );
  }
}
