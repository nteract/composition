import * as React from "react";
import JSONTree from "react-json-tree";

const defaultTheme = {
  base00: "transparent",
  base01: "#073642",
  base02: "#586e75",
  base03: "#657b83",
  base04: "#839496",
  base05: "#93a1a1",
  base06: "#eee8d5",
  base07: "#fdf6e3",
  base08: "#dc322f",
  base09: "#cb4b16",
  base0A: "#b58900",
  base0B: "#66BB6A",
  base0C: "#2aa198",
  base0D: "#268bd2",
  base0E: "#6c71c4",
  base0F: "#d33682"
};

const darkTheme = Object.assign({}, defaultTheme, { base0B: "#EDF3F7" });

interface Props {
  data: object;
  mediaType: "application/json";
  theme: string;
  metadata: { expanded: boolean };
}

/** @component */
export class Json extends React.PureComponent<Props> {
  static defaultProps = {
    data: null,
    mediaType: "application/json",
    theme: "light",
    metadata: { expanded: true }
  };

  //   #3435
  shouldExpandNode = (): boolean => {
    if (this.props.metadata && this.props.metadata.expanded) {
      return true;
    }
    return false;
  };

  render() {
    const theme = this.props.theme === "dark" ? darkTheme : defaultTheme;
    return (
      <JSONTree
        data={this.props.data}
        theme={theme}
        invertTheme={false}
        hideRoot
        shouldExpandNode={this.shouldExpandNode}
      />
    );
  }
}

export default Json;
