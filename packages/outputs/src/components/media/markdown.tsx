import MarkdownComponent from "@nteract/markdown";
import * as React from "react";

interface Props {
  /**
   * Markdown text.
   */
  data: string;
  /**
   * Media type. Defaults to `text/markdown`.
   * For more on media types, see: https://www.w3.org/TR/CSS21/media.html%23media-types.
   */
  mediaType: "text/markdown";
}

export class Markdown extends React.PureComponent<Props> {
  static defaultProps = {
    data: "",
    mediaType: "text/markdown"
  };

  render() {
    return <MarkdownComponent source={this.props.data} />;
  }
}

export default Markdown;
