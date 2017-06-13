/* @flow */

import React from "react";
import { mount } from "enzyme";

import { HTMLTransform } from "../src/";

describe("HTMLTransform", () => {
  it("renders direct HTML", () => {
    const component = mount(<HTMLTransform data={"<b>woo</b>"} />);
    expect(component.html()).toEqual("<div><b>woo</b></div>");
  });
  it("correctly chooses to update with data changing", () => {
    const wrapper = mount(<HTMLTransform data={"<b>woo</b>"} />);

    const component = wrapper.instance();
    expect(component.shouldComponentUpdate({ data: "<b>woo</b>" })).toBeFalsy();
    expect(
      component.shouldComponentUpdate({ data: "<b>womp</b>" })
    ).toBeTruthy();
  });
  it("updates the underlying HTML when data changes", () => {
    const wrapper = mount(<HTMLTransform data={"<b>woo</b>"} />);
    expect(wrapper.html()).toEqual("<div><b>woo</b></div>");

    wrapper.setProps({ data: "<b>womp</b>" });

    expect(wrapper.html()).toEqual("<div><b>womp</b></div>");
  });
});
