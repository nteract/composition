import React, { FC } from "react";

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
}

// Based on https://css-tricks.com/building-progress-ring-quickly/
export const ProgressRing: FC<ProgressRingProps> = ({
  radius,
  stroke,
  progress,
}) => {
  const normalizedRadius = radius - stroke;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <svg height={radius * 2} width={radius * 2} className="progress-ring"
         style={{position: "relative", top: "-32px"}}>
      <circle
        stroke="#FFF"
        fill="transparent"
        strokeWidth={stroke}
        strokeDasharray={`${circumference} ${circumference}`}
        style={{ strokeDashoffset }}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
    </svg>
  );
};
