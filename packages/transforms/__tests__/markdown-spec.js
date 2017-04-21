import React from "react";

import { shallow } from "enzyme";

import MarkdownDisplay from "../src/markdown";

describe("MarkdownDisplay", () => {
  it("renders some markdown", () => {
    const component = shallow(<MarkdownDisplay data={"# DO\nit."} />);

    const instance = component.instance();

    // Slightly "testing" the library underneath, but it's still a decent litmus test
    expect(component.node.props.children[0].props.children[0]).toEqual("DO");
    expect(component.node.props.children[1].props.children[0]).toEqual("it.");

    expect(instance.shouldComponentUpdate({ data: "# DO\nit." })).toEqual(
      false
    );
    expect(instance.shouldComponentUpdate({ data: "#WOO" })).toEqual(true);
  });
});
