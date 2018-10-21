/* @flow */
import * as React from "react";
import { ChromePicker } from "react-color";

import PaletteColorBox from './PaletteColorBox'
import paletteStyle from "./css/palette-picker";

type Props = {
  colors: Array<string>,
  updateColor: Function
};

type State = {
  colors: string,
  selectedColor: string,
  open: boolean,
  selectedPosition: number
};

class PalettePicker extends React.Component<Props, State> {
  static defaultProps = {
    metadata: {},
    height: 500
  };

  constructor(props: Props) {
    super(props);
    this.state = {
      open: false,
      selectedColor: props.colors[0],
      selectedPosition: 0,
      colors: props.colors.join(",\n")
    };
  }

  openClose = () => {
    this.setState({
      open: !this.state.open,
      colors: this.props.colors.join(",\n")
    });
  };

  handleChange = (color: string, position: number) => {
    this.setState({ selectedColor: color, selectedPosition: position });
  };

  handleKeyPress = (e: Object) => {
    if (e.keyCode === 13) {
      this.openClose();
    }
  };

  pickerChange = (color: Object) => {
    const { colors } = this.props;
    colors[this.state.selectedPosition] = color.hex;
    this.props.updateColor(colors);
    this.setState({ selectedColor: color.hex, colors: colors.join(",\n") });
  };

  colorsFromTextarea = () => {
    const parsedTextValue = this.state.colors
      .replace(/\"/g, "")
      .replace(/ /g, "")
      .replace(/\[/g, "")
      .replace(/\]/g, "")
      .replace(/\r?\n|\r/g, "")
      .split(",");

    this.props.updateColor(parsedTextValue);
  };

  updateTextArea = (e: Object) => {
    this.setState({ colors: e.target.value });
  };

  render() {
    if (!this.state.open) {
      return (
        <div style={{ display: "inline-block" }}>
          <button onClick={this.openClose}>Adjust Palette</button>
          <style jsx>{paletteStyle}</style>
        </div>
      );
    }

    const { colors } = this.props;

    return (
      <div className="wrapper">
        <div
          className="close"
          role="button"
          tabIndex="0"
          onClick={this.openClose}
          onKeyPress={this.handleKeyPress}
        >
          ×
        </div>
        <div className="grid-wrapper">
          <div>
            <h3>Select Color</h3>
            {colors.map((d, i) => (
              <PaletteColorBox
                color={d}
                index={i}
                key={i}
                onChange={this.handleChange}
              />
            ))}
          </div>
          <div>
            <h3>Adjust Color</h3>
            <div style={{ width: "225px" }}>
              <ChromePicker
                color={this.state.selectedColor}
                onChangeComplete={this.pickerChange}
              />
            </div>
          </div>
          <div>
            <h3>Paste New Colors</h3>
            <textarea
              value={this.state.colors}
              onChange={this.updateTextArea}
            />
            <button onClick={this.colorsFromTextarea}>Update Colors</button>
          </div>
        </div>
        <div style={{ marginTop: "30px" }}>
          <a
            href={`http://projects.susielu.com/viz-palette?colors=[${colors
              .map(d => `"${d}"`)
              .join(",")}]&backgroundColor="white"&fontColor="black"`}
          >
            Evaluate This Palette with VIZ PALETTE
          </a>
        </div>
        <style jsx>{paletteStyle}</style>
      </div>
    );
  }
}

export default PalettePicker;
