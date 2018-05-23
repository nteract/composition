import React from "react";

import { shallow, mount } from "enzyme";

import { Vega2, Vega3, VegaLite1, VegaLite2, VegaEmbed } from "../src/";

const cars = require("../data/cars.json");

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

describe("Vega2", () => {
  it("renders VegaEmbed with embedMode vega", () => {
    const wrapper = shallow(<Vega2 data={spec} />);

    expect(wrapper.name()).toEqual("VegaEmbed");
    expect(wrapper.props().embedMode).toEqual("vega");
    expect(wrapper.props().version).toEqual("vega2");
  });
});

describe("Vega3", () => {
  it("renders VegaEmbed with embedMode vega", () => {
    const wrapper = shallow(<Vega3 data={spec} />);

    expect(wrapper.name()).toEqual("VegaEmbed");
    expect(wrapper.props().embedMode).toEqual("vega");
    expect(wrapper.props().version).toEqual("vega3");
  });
});

describe("VegaLite1", () => {
  it("renders VegaEmbed with embedMode vega-lite", () => {
    const wrapper = shallow(<VegaLite1 data={spec} />);

    expect(wrapper.name()).toEqual("VegaEmbed");
    expect(wrapper.props().embedMode).toEqual("vega-lite");
    expect(wrapper.props().version).toEqual("vega2");
  });
});

describe("VegaLite2", () => {
  it("renders VegaEmbed with embedMode vega-lite", () => {
    const wrapper = shallow(<VegaLite2 data={spec} />);

    expect(wrapper.name()).toEqual("VegaEmbed");
    expect(wrapper.props().embedMode).toEqual("vega-lite");
    expect(wrapper.props().version).toEqual("vega3");
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
