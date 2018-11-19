/* @flow */
import React from "react";

type Props = {
  data: string,
  metadata: any,
  mediaType: "image/png" | "image/jpeg" | "image/gif"
};

type ImageDisplayProps = Props & {
  mimetype?: "image/png" | "image/jpeg" | "image/gif"
};

export default function ImageDisplay(
  props: ImageDisplayProps
): ?React$Element<any> {
  let size = {};

  if (props.metadata) {
    const { width, height } = props.metadata;
    size = { width, height };
  }

  const mediaType = props.mediaType || props.mimetype;

  return (
    <React.Fragment>
      <img
        alt=""
        src={`data:${mediaType};base64,${props.data}`}
        {...size}
      />
      <style jsx>{`
        img {
          display: block;
          max-width: 100%;
        }
      `}</style>
    </React.Fragment>
  );
}

export class PNGDisplay extends React.PureComponent<Props> {
  static MIMETYPE = "image/png";

  static defaultProps = {
    data: "",
    mediaType: "image/png"
  };

  render() {
    return <ImageDisplay {...this.props} />;
  }
}

export class JPEGDisplay extends React.PureComponent<Props> {
  static MIMETYPE = "image/jpeg";

  static defaultProps = {
    data: "",
    mediaType: "image/jpeg"
  };

  render() {
    return <ImageDisplay {...this.props} />;
  }
}

export class GIFDisplay extends React.PureComponent<Props> {
  static MIMETYPE = "image/gif";

  static defaultProps = {
    data: "",
    mediaType: "image/gif"
  };

  render() {
    return <ImageDisplay {...this.props} />;
  }
}
