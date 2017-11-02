import React from "react";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import Editor from "../../src/providers/editor";
import { dummyStore } from "../../__mocks__/utils";
import { UPDATE_CELL_SOURCE, FOCUS_CELL_EDITOR } from "../../src/constants";

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
        expect(action.id).toBe("test");
        expect(action.value).toBe("i love nteract");
        expect(action.type).toBe("SET_IN_CELL");
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
        expect(action.id).toBe("test");
        expect(action.type).toBe(FOCUS_CELL_EDITOR);
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
