/* @flow */
import React from 'react';

type TopProps = {
  data: string,
  mimetype: string,
  metadata: any,
};

type ImageProps = {
  data: string,
  metadata: string,
}

export default function ImageDisplay(props: TopProps): ?React.Element<any> {
  let size = {};

  if (props.metadata) {
    const { width, height } = props.metadata;
    size = { width, height };
  }

  return (
    <img role="presentation" src={`data:${props.mimetype};base64,${props.data}`} {...size} />
  );
}

export function PNGDisplay(props: ImageProps): ?React.Element<any> {
  return (
    <ImageDisplay mimetype="image/png" {...props} />
  );
}

export function JPEGDisplay(props: ImageProps): ?React.Element<any> {
  return (
    <ImageDisplay mimetype="image/jpeg" {...props} />
  );
}

export function GIFDisplay(props: ImageProps): ?React.Element<any> {
  return (
    <ImageDisplay mimetype="image/gif" {...props} />
  );
}
