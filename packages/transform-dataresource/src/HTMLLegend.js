/* @flow */
import * as React from "react";

import PalettePicker from "./PalettePicker";

type HTMLLegendProps = {
  values: Array<string>,
  colorHash: Object,
  valueHash: Object,
  colors?: Array<string>,
  setColor?: Function
};

const HTMLLegend = ({
  values,
  colorHash,
  valueHash,
  colors = [],
  setColor
}: HTMLLegendProps) => (
  <div style={{ marginTop: "20px" }}>
    {(values.length > 18
      ? //limit the displayed values to the top 18 and bin everything else into Other
        [...values.filter((d, index) => index < 18), "Other"]
      : values
    ).map(
      (value, index) =>
        colorHash[value] && (
          <span
            style={{ display: "inline-block", minWidth: "80px", margin: "5px" }}
            key={`legend-item-${index}`}
          >
            <span
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "20px",
                marginBottom: "-5px",
                background: colorHash[value]
              }}
            />
            <span className="html-legend-item">{value}</span>
            {(valueHash[value] &&
              valueHash[value] > 1 &&
              `(${valueHash[value]})`) ||
              ""}
          </span>
        )
    )}
    {setColor && (
      <PalettePicker
        colors={colors}
        updateColor={newColorArray => {
          setColor(newColorArray);
        }}
      />
    )}
  </div>
);

export default HTMLLegend;
