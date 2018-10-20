import React from "react";

import { shallow } from "enzyme";

import MarkdownDisplay from "../src/markdown";

describe("MarkdownDisplay", () => {
  it("renders some markdown", () => {
    const component = shallow(<MarkdownDisplay data={"# DO\nit."} />);

    const instance = component.instance();

    expect(
      instance.shouldComponentUpdate({
        data: "# DO\nit."
      })
    ).toEqual(false);
    expect(instance.shouldComponentUpdate({ data: "#WOO" })).toEqual(true);
  });
});
