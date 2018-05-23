import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import Editor from "../src/editor";
import { dummyStore } from "@nteract/core/dummy";
import { actionTypes } from "@nteract/core";

describe("EditorProvider", () => {
  const store = dummyStore();

  const setup = (id, cellFocused = true) =>
    mount(
      <Provider store={store}>
        <Editor id={id} cellFocused={cellFocused} />
      </Provider>
    );

  test("can be constructed", () => {
    const component = setup("test");
    expect(component).not.toBeNull();
  });
  test("onChange updates cell source", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.payload.id).toBe("test");
        expect(action.payload.value).toBe("i love nteract");
        expect(action.type).toBe(actionTypes.SET_IN_CELL);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup("test");
      const onChange = wrapper
        .findWhere(n => n.prop("onChange") !== undefined)
        .first()
        .prop("onChange");
      onChange("i love nteract");
    }));
  test("onFocusChange can update editor focus", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.payload.id).toBe("test");
        expect(action.type).toBe(actionTypes.FOCUS_CELL_EDITOR);
        resolve();
      };
      store.dispatch = dispatch;
      const wrapper = setup("test");
      const onFocusChange = wrapper
        .findWhere(n => n.prop("onFocusChange") !== undefined)
        .first()
        .prop("onFocusChange");
      onFocusChange(true);
    }));
});
