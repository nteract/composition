import React from "react";
import { shallow } from "enzyme";

import MarkdownDisplay from "../src/markdown";

describe("MarkdownDisplay", () => {
  it("renders direct markdown", () => {
    const component = shallow(<MarkdownDisplay data={"# DO\nit."} />);
    expect(component.html()).toEqual("<h1>DO</h1><p>it.</p>");
  });
});
