import React from "react";
import { mount } from "enzyme";

import LaTeXDisplay from "../src/latex";

describe("LaTeXDisplay", () => {
  it("processes basic LaTeX", () => {
    const component = mount(<LaTeXDisplay data={"x^2 + y = 3"} />);

    const rendered = component.render();
    expect(rendered.html()).toEqual("x^2 + y = 3");
  });
  it("updates the LaTeX", () => {
    const component = mount(<LaTeXDisplay data={"x^2 + y = 3"} />);
    let rendered = component.render();

    component.setProps({ data: "x^6 + z = 55" });

    rendered = component.render();
    expect(rendered.html()).toEqual("x^6 + z = 55");
  });
});
