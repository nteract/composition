import { mount } from "enzyme";
import React from "react";

import { MathJaxText_ } from "../src/text";

const MathJaxContextMock = {
  Hub: {
    Queue: jest.fn(),
    getJaxFor: jest.fn()
  }
};

describe("MathJaxText_", () => {
  it("typesets when mounted", () => {
    const typeset = jest.spyOn(MathJaxText_.prototype, "typeset");
    const component = mount(
      <MathJaxText_ MathJax={MathJaxContextMock}>$x^2 + y = 3$</MathJaxText_>
    );

    expect(typeset).toBeCalled();
  });
  it("typesets on component update", () => {
    const typeset = jest.spyOn(MathJaxText_.prototype, "typeset");
    const component = mount(
      <MathJaxText_ inline MathJax={MathJaxContextMock}>
        $x^2 + y = 3$
      </MathJaxText_>
    );
    jest.runAllTimers();
    component.update();

    expect(typeset).toBeCalledTimes(2);
  });
});
