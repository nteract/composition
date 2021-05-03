import React, { FC, HTMLAttributes } from "react";
import classnames from "classnames";

export interface ToolbarItemProps extends HTMLAttributes<HTMLDivElement> {
  image: React.ReactNode;
  text: string;
  showText?: boolean;
  showButton?: boolean;
  onClick: () => void;
  buttonClassName?: string;
}

export const ToolbarItem: FC<ToolbarItemProps> = ({
  image,
  text,
  showText = true,
  showButton = true,
  onClick,
  buttonClassName,
}) => {
  const className = classnames("toolbar-item", "mdl-button", buttonClassName, {
    hidden: !showButton,
  });
  return (
    <button onClick={onClick} className={className}>
      {image}
      <span className={classnames({ display: showText })}>{text}</span>
    </button>
  );
};
