/* eslint jsx-a11y/no-static-element-interactions: 0 */
/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */

import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import * as React from "react";

import { DropdownContent, DropdownMenu, DropdownTrigger } from "../src";

describe("DropdownMenu", () => {
  test("clicking dropdown content triggers the items callback and closes the menu", () => {
    const clicky = jest.fn();
    const exampleDropdown = (
      <DropdownMenu>
        <DropdownTrigger>
          <div className="clickMe">Click me</div>
        </DropdownTrigger>
        <DropdownContent>
          <li className="alsoClickMe" onClick={clicky}>
            1
          </li>
        </DropdownContent>
      </DropdownMenu>
    );
    const wrapper = mount(exampleDropdown);

    expect(toJSON(wrapper)).toMatchSnapshot();
    // Trigger should be shown
    // Content should not be available yet
    expect(toJSON(wrapper)).toMatchSnapshot();
    expect(wrapper.find(".alsoClickMe").length).toEqual(0);

    // Content should now be shown
    wrapper.find(".clickMe").simulate("click");
    expect(toJSON(wrapper)).toMatchSnapshot();
    expect(wrapper.find(".alsoClickMe").length).toEqual(1);

    // Clicking the item should close the menu
    wrapper.find(".alsoClickMe").simulate("click");
    expect(wrapper.find(".alsoClickMe").length).toEqual(0);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
  test("pressing enter on dropdown content clicks the focused item", () => {
    const clicky = jest.fn();
    const exampleDropdown = (
      <DropdownMenu>
        <DropdownTrigger>
          <div className="clickMe">Click me</div>
        </DropdownTrigger>
        <DropdownContent>
          <li className="alsoClickMe" onClick={clicky}>
            1
          </li>
        </DropdownContent>
      </DropdownMenu>
    );
    const wrapper = mount(exampleDropdown);

    wrapper.find(".clickMe").simulate("click");
    wrapper.find(".alsoClickMe").simulate("keyup", { key: "Enter" });

    // We need a delay here to allow for the click events to propogate (since "Enter" simulates a click)
    setTimeout(() => {
      expect(clicky.mock.calls.length).toBe(1);
      expect(toJSON(wrapper)).toMatchSnapshot();
    }, 1000);
  });
  test("pressing escape on dropdown closes the menu", () => {
    const clicky = jest.fn();
    const exampleDropdown = (
      <DropdownMenu>
        <DropdownTrigger>
          <div className="clickMe">Click me</div>
        </DropdownTrigger>
        <DropdownContent>
          <li className="alsoClickMe" onClick={clicky}>
            1
          </li>
        </DropdownContent>
      </DropdownMenu>
    );
    const wrapper = mount(exampleDropdown);

    // Content should now be shown
    wrapper.find(".clickMe").simulate("click");
    expect(toJSON(wrapper)).toMatchSnapshot();
    expect(wrapper.find(".alsoClickMe").length).toEqual(1);

    // Pressing enter while the item is focused should close the menu
    wrapper.find(".alsoClickMe").simulate("keyup", { key: "Escape" });
    expect(wrapper.find(".alsoClickMe").length).toEqual(0);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });
  test("clicking dropdown trigger onDisplayChanged", () => {
    const expandedChanged = jest.fn();
    const exampleDropdown = (
      <DropdownMenu onDisplayChanged={expandedChanged}>
        <DropdownTrigger>
          <div className="clickMe">Click me</div>
        </DropdownTrigger>
        <DropdownContent>
          <li>1</li>
        </DropdownContent>
      </DropdownMenu>
    );
    const wrapper = mount(exampleDropdown);
    wrapper.find(".clickMe").simulate("click");
    setTimeout(() => {
      expect(expandedChanged.mock.calls.length).toBe(1);
    }, 1000);
  });
});
