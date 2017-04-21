import React from "react";
import { expect } from "chai";
import { mount } from "enzyme";
import { Provider } from "react-redux";

import Editor from "../../../src/notebook/providers/editor";
import { dummyStore } from "../../utils";
import {
  UPDATE_CELL_SOURCE,
  FOCUS_CELL_EDITOR
} from "../../../src/notebook/constants";

describe("EditorProvider", () => {
  const store = dummyStore();

  const setup = (id, cellFocused = true) =>
    mount(
      <Provider store={store}>
        <Editor id={id} cellFocused={cellFocused} />
      </Provider>
    );

  it("can be constructed", () => {
    const component = setup("test");
    expect(component).to.not.be.null;
  });
  it("onChange updates cell source", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal("test");
        expect(action.source).to.equal("i love nteract");
        expect(action.type).to.equal(UPDATE_CELL_SOURCE);
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
  it("onFocusChange can update editor focus", () =>
    new Promise(resolve => {
      const dispatch = action => {
        expect(action.id).to.equal("test");
        expect(action.type).to.equal(FOCUS_CELL_EDITOR);
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
