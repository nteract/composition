import React from "react";
import styled from "styled-components";

interface Props {
  data: string;
  mediaType: "image/png" | "image/jpeg" | "image/gif";
  metadata: { height?: number; width?: number };
}

const ImageStyle = styled.img`
  display: block;
  max-width: 100%;
`;

export function Image(props: Partial<Props>) {
  let size = {};

  if (props.metadata) {
    const { width, height } = props.metadata;
    size = { width, height };
  }

  return (
    <ImageStyle
      alt=""
      src={`data:${props.mediaType};base64,${props.data}`}
      {...size}
    />
  );
}

Image.defaultProps = {
  data: "",
  mediaType: "image/jpeg"
};

export default Image;
