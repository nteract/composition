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
      ? [...values.filter((d, i) => i < 18), "Other"]
      : values
    ).map(
      (v, vi) =>
        colorHash[v] && (
          <span
            style={{ display: "inline-block", minWidth: "80px", margin: "5px" }}
            key={`legend-item-${vi}`}
          >
            <span
              style={{
                display: "inline-block",
                width: "20px",
                height: "20px",
                marginRight: "5px",
                borderRadius: "20px",
                marginBottom: "-5px",
                background: colorHash[v]
              }}
            />
            {v}
            {(valueHash[v] && valueHash[v] > 1 && `(${valueHash[v]})`) || ""}
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
