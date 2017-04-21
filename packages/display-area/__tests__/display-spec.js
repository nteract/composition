import React from "react";

import { shallow, mount } from "enzyme";
import Immutable from "immutable";

import { displayOrder, transforms } from "@nteract/transforms";
import { Display } from "../";
import { DEFAULT_SCROLL_HEIGHT } from "../src/display";

describe("Display", () => {
  it("does not display when status is hidden", () => {
    const outputs = Immutable.fromJS([
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ]);
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
    const outputs = Immutable.fromJS([
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ]);
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
    const outputs = Immutable.fromJS([
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ]);
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

    let ci = component.instance();

    // Cannot new an HTMLElement without global document reference
    ci.el = { scrollHeight: 100, style: {} };
    ci.recomputeStyle();
    expect(ci.el.style.overflowY).toEqual("auto");
    expect(ci.el.style.height).toEqual("auto");

    // Simulate scrollHeight changing
    ci.el.scrollHeight = DEFAULT_SCROLL_HEIGHT + 1;
    ci.recomputeStyle();
    expect(ci.el.style.overflowY).toEqual("auto");
    expect(ci.el.style.height).toEqual("auto");

    // Simulate scrollHeight changing.
    ci.el.scrollHeight = DEFAULT_SCROLL_HEIGHT;
    ci.recomputeStyle();
    expect(ci.el.style.overflowY).toEqual("auto");
    expect(ci.el.style.height).toEqual("auto");
  });
  it("sets non expanded cell style correctly", () => {
    const outputs = Immutable.fromJS([
      {
        output_type: "display_data",
        data: {
          "text/html": "Test content"
        }
      }
    ]);
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

    let ci = component.instance();

    //Cannot new an HTMLElement without global document reference
    ci.el = { scrollHeight: 100, style: {} };
    ci.recomputeStyle();
    expect(ci.el.style.overflowY).toEqual("auto");
    expect(ci.el.style.height).toEqual("auto");

    //Simulate scrollHeight changing
    ci.el.scrollHeight = DEFAULT_SCROLL_HEIGHT + 1;
    ci.recomputeStyle();
    expect(ci.el.style.overflowY).toEqual("scroll");
    expect(ci.el.style.height).toEqual(`${DEFAULT_SCROLL_HEIGHT}px`);

    // Simulate scrollHeight changing.
    ci.el.scrollHeight = DEFAULT_SCROLL_HEIGHT;
    ci.recomputeStyle();
    expect(ci.el.style.overflowY).toEqual("auto");
    expect(ci.el.style.height).toEqual("auto");
  });
});
