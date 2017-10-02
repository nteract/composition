import React from "react";

import { mount } from "enzyme";

import Text from "../src/text";

describe("Text", () => {
  it("renders plain text", () => {
    const wrapper = mount(<Text data={"hey"} />);
    expect(wrapper.html()).toEqual("<code><span>hey</span></code>");

    const component = wrapper.instance();

    expect(component.shouldComponentUpdate()).toEqual(true);
  });
});
