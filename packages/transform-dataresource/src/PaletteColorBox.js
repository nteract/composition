/* @flow */
import * as React from "react";

type Props = {
  color: string,
  index: number,
  onChange: Function
};

export default class PaletteColorBox extends React.Component<Props, null> {
  handleKeyPress = (e: Object) => {
    if (e.keyCode === 13) {
      this.handleClick();
    }
  }
  handleClick = () => {
    const {color, index, onChange} = this.props;
    onChange(color, index);
  }

  render() {
    const {color} = this.props;
    return (
        <div
            className="box"
            style={{ background: color }}
            role="button"
            tabIndex="0"
            onKeyPress={this.handleKeyPress}
            onClick={this.handleClick}
        />
    );
  }
}
