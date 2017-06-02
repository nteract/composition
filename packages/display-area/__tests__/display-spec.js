import React from "react";

import { shallow, mount } from "enzyme";
import Immutable from "immutable";

import { displayOrder, transforms } from "@nteract/transforms";
import { Display } from "../";
import { DEFAULT_SCROLL_HEIGHT } from "../src/display";

describe("Display", () => {
  it("does not display when status is hidden", () => {
    const outputs = [
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ];
    const component = shallow(
      <Display
        outputs={outputs}
        isHidden={true}
        theme={"light"}
        displayOrder={displayOrder}
        transforms={transforms}
      />
    );
    expect(component.find("div.cell_display")).toHaveLength(0);
  });
  it("displays status when it is not hidden", () => {
    const outputs = [
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ];
    const component = shallow(
      <Display
        outputs={outputs}
        isHidden={false}
        theme={"light"}
        displayOrder={displayOrder}
        transforms={transforms}
      />
    );
    expect(component.find("div.cell_display")).toHaveLength(1);
  });
  it("sets expanded cell style correctly", () => {
    const outputs = [
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ];
    const component = shallow(
      <Display
        outputs={outputs}
        isHidden={false}
        theme={"light"}
        displayOrder={displayOrder}
        transforms={transforms}
        expanded={true}
      />
    );

    const props = component.props();
    expect(props.style.overflowY).toEqual("auto");
    expect(props.style.maxHeight).toEqual("100%");
  });
  it("sets non expanded cell style correctly", () => {
    const outputs = [
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ];
    const component = shallow(
      <Display
        outputs={outputs}
        isHidden={false}
        theme={"light"}
        displayOrder={displayOrder}
        transforms={transforms}
        expanded={false}
      />
    );

    const props = component.props();
    expect(props.style.overflowY).toEqual("auto");
    expect(props.style.maxHeight).toEqual(`${DEFAULT_SCROLL_HEIGHT}px`);
  });
});
