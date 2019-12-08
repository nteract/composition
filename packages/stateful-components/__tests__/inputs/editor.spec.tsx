import { selectors } from "@nteract/core";
import { mockAppState } from "@nteract/fixtures";

import { makeMapStateToProps } from "../../src/inputs/editor";

describe("makeMapStateToProps", () => {
  it("returns default values if input document is not a notebook", () => {
    const state = mockAppState();
    const ownProps = {
      contentRef: "anyContentRef",
      id: "nonExistantCell",
      children: []
    };
    const mapStateToProps = makeMapStateToProps(state, ownProps);
    expect(mapStateToProps(state)).toEqual({
      editorType: "codemirror",
      editorFocused: false,
      channels: null,
      kernelStatus: "not connected",
      value: ""
    });
  });
  it("returns kernel and channels if input cell is code cell", () => {
    const state = mockAppState({ codeCellCount: 1 });
    const contentRef = state.core.entities.contents.byRef.keySeq().first();
    const model = selectors.model(state, { contentRef });
    const id = selectors.notebook.cellOrder(model).first();
    const ownProps = {
      contentRef,
      id,
      children: []
    };
    const mapStateToProps = makeMapStateToProps(state, ownProps);
    expect(mapStateToProps(state).channels).not.toBeNull();
  });
});
