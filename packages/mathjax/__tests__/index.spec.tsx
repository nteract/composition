import { mount } from "enzyme";
import toJson from "enzyme-to-json";
import * as React from "react";

jest.mock("load-script");
import loadScript from "load-script";
import { Node, Provider, Text } from "../src";

const mathJaxUrl =
  "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.1/MathJax.js?config=TeX-MML-AM_CHTML";

describe("MathJax", () => {
  test("Node can be renderered without provider", () => {
    const wrapper = mount(<Node>x^2 + y = 3</Node>);
    expect(loadScript).toHaveBeenLastCalledWith(
      mathJaxUrl,
      expect.any(Function)
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test("Nodes use existing provider", () => {
    const wrapper = mount(
      <Provider src="script-src">
        <Node>x^2 + y = 3</Node>
        <Node>x^3 + y = 2</Node>
      </Provider>
    );
    expect(loadScript).toHaveBeenLastCalledWith(
      "script-src",
      expect.any(Function)
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  test("Text node renders LaTeX text", () => {
    const wrapper = mount(<Text>This is a LaTeX equation $x^2 + y = 3$</Text>);
    expect(loadScript).toHaveBeenLastCalledWith(
      mathJaxUrl,
      expect.any(Function)
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
