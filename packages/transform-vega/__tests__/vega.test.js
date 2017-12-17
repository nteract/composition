import React from "react";

import { shallow, mount } from "enzyme";

import { Vega, VegaLite, VegaEmbed } from "../src/";

const cars = require("vega-lite/data/cars.json");

const spec = {
  description: "A scatterplot showing horsepower and miles per gallons.",
  data: {
    values: cars
  },
  mark: "point",
  encoding: {
    x: { field: "Horsepower", type: "quantitative" },
    y: { field: "Miles_per_Gallon", type: "quantitative" },
    color: { field: "Origin", type: "nominal" },
    shape: { field: "Origin", type: "nominal" }
  }
};

describe("Vega", () => {
  it("renders VegaEmbed with embedMode vega", () => {
    const wrapper = shallow(<Vega data={spec} />);

    expect(wrapper.name()).toEqual("VegaEmbed");
    expect(wrapper.props().embedMode).toEqual("vega");
  });
});

describe("VegaLite", () => {
  it("renders VegaEmbed with embedMode vega-lite", () => {
    const wrapper = shallow(<VegaLite data={spec} />);

    expect(wrapper.name()).toEqual("VegaEmbed");
    expect(wrapper.props().embedMode).toEqual("vega-lite");
  });
});

describe("VegaEmbed", () => {
  it("embeds vega", () => {
    const spy = jest.fn();
    const wrapper = mount(
      <VegaEmbed data={spec} embedMode="vega-lite" renderedCallback={spy} />
    );

    const element = wrapper.instance();

    expect(element.shouldComponentUpdate({ data: "324" })).toEqual(true);
  });

  it("embeds vega and handles updates", () => {
    const spy = jest.fn();
    const wrapper = mount(
      <VegaEmbed data={spec} embedMode="vega-lite" renderedCallback={spy} />
    );
    wrapper.render();

    const spy2 = jest.fn();

    wrapper.setProps({
      data: {
        data: {
          values: cars
        },
        mark: "circle",
        encoding: {
          x: { field: "Horsepower", type: "quantitative" },
          y: { field: "Miles_per_Gallon", type: "quantitative" }
        }
      },
      renderedCallback: spy2
    });
  });
});
