import React from "react";
import { shallow } from "enzyme";
import toJson from "enzyme-to-json";

import LaTeXDisplay from "../src/latex";

describe("LaTeXDisplay", () => {
  it("processes basic LaTeX", () => {
    const wrapper = shallow(<LaTeXDisplay data={"x^2 + y = 3"} />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});
