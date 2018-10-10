import React from "react";
import renderer from "react-test-renderer";

import { mount } from "enzyme";
import toJson from "enzyme-to-json";

import LaTeXDisplay from "../src/latex";

describe("LaTeXDisplay", () => {
  it("processes basic LaTeX", () => {
    const wrapper = mount(<LaTeXDisplay data={"Pseudo LaTeX $x^2 + y = 3$"} />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
