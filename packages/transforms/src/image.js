/* @flow */
import React from "react";

type TopProps = {
  data: string,
  mimetype: string,
  metadata: any
};

type ImageProps = {
  data: string,
  metadata: string
};

export default function ImageDisplay(props: TopProps): ?React$Element<any> {
  let size = {};

  if (props.metadata) {
    const { width, height } = props.metadata;
    size = { width, height };
  }

  return (
    <img alt="" src={`data:${props.mimetype};base64,${props.data}`} {...size} />
  );
}

export class PNGDisplay extends React.Component<ImageProps> {
  static MIMETYPE = "image/png";
  render() {
    return <ImageDisplay mimetype="image/png" {...this.props} />;
  }
}

export class JPEGDisplay extends React.Component<ImageProps> {
  static MIMETYPE = "image/jpeg";
  render() {
    return <ImageDisplay mimetype="image/jpeg" {...this.props} />;
  }
}

export class GIFDisplay extends React.Component<ImageProps> {
  static MIMETYPE = "image/gif";
  render() {
    return <ImageDisplay mimetype="image/gif" {...this.props} />;
  }
}
