"use strict";
import React from "react";
import renderer from "react-test-renderer";

import { shallow } from "enzyme";

import * as ion from "../src";

describe("ion", () => {
  it("has a higher order component that provides styles", () => {
    const BareComponent = props => (
      <div>
        <h1>{props.title}</h1>
        <p>{props.description}</p>
      </div>
    );

    const StylishComponent = ion.provideStyle(BareComponent);

    const component = renderer.create(
      <StylishComponent
        title="Testing Higher Order Components"
        description="This seemed reasonable, though there may be a better way"
      />
    );

    const children = component.root.children;

    // Make sure our component got passed through and that it got the props
    expect(children[0].type).toEqual(BareComponent);
    expect(children[0].props).toEqual({
      title: "Testing Higher Order Components",
      description: "This seemed reasonable, though there may be a better way"
    });

    // Ensure we got our styles
    expect(children[1].props.css.toString()).toEqual(
      ion.blueprintCSS.toString()
    );
  });
});
