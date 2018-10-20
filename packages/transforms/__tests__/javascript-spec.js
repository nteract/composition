import React from "react";
import { mount } from "enzyme";

import JavascriptDisplay, { runCodeHere } from "../src/javascript";

describe("JavascriptDisplay", () => {
  it("renders contextual div tag", () => {
    const component = mount(<JavascriptDisplay data={""} />);
    expect(component.html()).toEqual("<div></div>");
  });
  it("executes the Javascript", () => {
    mount(<JavascriptDisplay data={"window._test_variable = 5;"} />);
    expect(window._test_variable).toEqual(5);
  });

  it("creates a nice little error area", () => {
    const component = mount(<JavascriptDisplay data={'throw "a fit"'} />);
    const instance = component.instance();
    expect(instance.el.firstChild.localName).toEqual("pre");
    expect(instance.el.firstChild.textContent).toEqual("a fit");
  });

  it("creates a nice little error area with a stack", () => {
    const component = mount(
      <JavascriptDisplay data={'throw new Error("a fit")'} />
    );
    const instance = component.instance();
    expect(instance.el.firstChild.localName).toEqual("pre");
    expect(instance.el.firstChild.textContent).toContain("Error: a fit");
  });

  it("handles updates by running again", () => {
    global.x = 0;
    const component = mount(<JavascriptDisplay data={"x = 1"} />);
    component.setProps({ data: "x = x + 1" });
    expect(global.x).toEqual(2);
    delete global.x;
  });
});

describe("runCodeHere", () => {
  it("runs code with `element` available", () => {
    const el = document.createElement("div");
    const element = runCodeHere(el, "element");
    expect(el).toEqual(element);
  });
});
