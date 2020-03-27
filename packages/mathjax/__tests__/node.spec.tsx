import { mount } from "enzyme";
import React from "react";

import { MathJaxNode_ } from "../src/node";

jest.useFakeTimers();

const MathJaxContextMock = {
  Hub: {
    Queue: jest.fn(),
    getJaxFor: jest.fn()
  }
};

describe("MathJaxNode_", () => {
  it("typesets when mounted", () => {
    const typeset = jest.spyOn(MathJaxNode_.prototype, "typeset");
    const component = mount(
      <MathJaxNode_ inline MathJax={MathJaxContextMock}>
        $x^2 + y = 3$
      </MathJaxNode_>
    );
    jest.runAllTimers();
    component.update();

    expect(typeset).toBeCalled();
  });
  it("clears typesetting when unmounted", () => {
    const clear = jest.spyOn(MathJaxNode_.prototype, "clear");
    const component = mount(
      <MathJaxNode_ inline MathJax={MathJaxContextMock}>
        $x^2 + y = 3$
      </MathJaxNode_>
    );
    jest.runAllTimers();
    component.update();
    component.unmount();

    expect(clear).toBeCalled();
  });
  it("typesets with force update when props change", () => {
    const typeset = jest.spyOn(MathJaxNode_.prototype, "typeset");
    const component = mount(
      <MathJaxNode_ inline MathJax={MathJaxContextMock}>
        $x^2 + y = 3$
      </MathJaxNode_>
    );
    jest.runAllTimers();
    component.setProps({ inline: false });

    expect(typeset).toBeCalledWith(true);
  });
});
