import React from "react";

import { mount } from "enzyme";

import Text from "../src/text";

describe("Text", () => {
  it("renders plain text", () => {
    const wrapper = mount(<Text data={"hey"} />);
    // TODO: This test should be replaced with jest snapshots
    expect(wrapper.html()).toEqual("<code><span>hey</span></code>");
  });
});
