import React from "react";
import _ from "lodash";

import { mount } from "enzyme";

import PlotlyTransform from "../src";

const plotly = require("@nteract/plotly");

function deepFreeze(obj) {
  // Retrieve the property names defined on obj
  const propNames = Object.getOwnPropertyNames(obj);

  // Freeze properties before freezing self
  propNames.forEach(name => {
    const prop = obj[name];

    // Freeze prop if it is an object
    if (typeof prop === "object" && prop !== null) {
      deepFreeze(prop);
    }
  });

  // Freeze self (no-op if already frozen)
  return Object.freeze(obj);
}

const figure = deepFreeze({
  data: [
    { x: [1999, 2000, 2001, 2002], y: [10, 15, 13, 17], type: "scatter" },
    { x: [1999, 2000, 2001, 2002], y: [16, 5, 11, 9], type: "scatter" }
  ],
  layout: {
    title: "Super Stuff",
    xaxis: { title: "Year", showgrid: false, zeroline: false },
    yaxis: { title: "Percent", showline: false },
    height: "100px"
  }
});

describe("PlotlyTransform", () => {
  it("plots some data from an object", () => {
    const plotComponent = mount(<PlotlyTransform data={figure} />);

    const instance = plotComponent.instance();

    expect(instance.shouldComponentUpdate({ data: "" })).toBeTruthy();
    expect(plotly.newPlot).lastCalledWith(
      instance.plotDiv,
      [
        { x: [1999, 2000, 2001, 2002], y: [10, 15, 13, 17], type: "scatter" },
        { x: [1999, 2000, 2001, 2002], y: [16, 5, 11, 9], type: "scatter" }
      ],
      {
        title: "Super Stuff",
        xaxis: { title: "Year", showgrid: false, zeroline: false },
        yaxis: { title: "Percent", showline: false },
        height: "100px"
      }
    );
  });

  it("plots some data from a JSON string", () => {
    const plotComponent = mount(
      <PlotlyTransform data={JSON.stringify(figure)} />
    );

    const instance = plotComponent.instance();

    expect(instance.shouldComponentUpdate({ data: "" })).toBeTruthy();
    expect(plotly.newPlot).lastCalledWith(
      instance.plotDiv,
      [
        { x: [1999, 2000, 2001, 2002], y: [10, 15, 13, 17], type: "scatter" },
        { x: [1999, 2000, 2001, 2002], y: [16, 5, 11, 9], type: "scatter" }
      ],
      {
        title: "Super Stuff",
        xaxis: { title: "Year", showgrid: false, zeroline: false },
        yaxis: { title: "Percent", showline: false },
        height: "100px"
      }
    );
  });

  it("processes updates", () => {
    const wrapper = mount(<PlotlyTransform data={figure} />);

    const instance = wrapper.instance();

    wrapper.setProps({
      data: _.set(_.cloneDeep(figure), ["data", 0, "type"], "bar")
    });

    expect(instance.plotDiv.data[0].type).toEqual("bar");

    expect(plotly.redraw).lastCalledWith(instance.plotDiv);
  });
});
