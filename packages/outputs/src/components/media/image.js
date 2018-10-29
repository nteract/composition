/* @flow */
import React from "react";

type Props = {
  data: string,
  mediaType: "image/png" | "image/jpeg" | "image/gif",
  metadata: any
};

export function Image(props: Props): ?React$Element<any> {
  let size = {};

  if (props.metadata) {
    const { width, height } = props.metadata;
    size = { width, height };
  }

  return (
    <React.Fragment>
      <img
        alt=""
        src={`data:${props.mediaType};base64,${props.data}`}
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
