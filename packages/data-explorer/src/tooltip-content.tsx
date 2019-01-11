import * as React from "react";

import styled from "styled-components";

type Props = {
  x: number;
  y: number;
};

// A little "mixin" for picking the :before on a tooltip
const beforeContent = (props: Props) => {
  if (props.x < 100) {
    return null;
  }
  if (props.y < 100) {
    return `
      border-left: inherit;
      border-top: inherit;
      top: -8px;
      left: calc(50% - 15px);
      background: inherit;
      content: "";
      padding: 0px;
      transform: rotate(45deg);
      width: 15px;
      height: 15px;
      position: absolute;
      z-index: 99;
    `;
  }

  return `
    border-right: inherit;
    border-bottom: inherit;
    bottom: -8px;
    left: calc(50% - 15px);
    background: inherit;
    content: "";
    padding: 0px;
    transform: rotate(45deg);
    width: 15px;
    height: 15px;
    position: absolute;
    z-index: 99;
  `;
};

const TooltipContent = styled.div`
  color: black;
  padding: 10px;
  z-index: 999999;
  min-width: 120px;
  background: white;
  border: 1px solid #888;
  border-radius: 5px;
  position: relative;

  transform: translate(
      ${(props: Props) => (props.x < 100 ? "0px" : "calc(-50% + 7px)")},
      ${(props: Props) => (props.y < 100 ? "10px" : "calc(-100% - 10px)")}
    )
    & p {
    font-size: 14px;
  }

  & h3 {
    margin: 0 0 10px;
  }

  &:before {
    ${beforeContent}
  }
`;
export default TooltipContent;
