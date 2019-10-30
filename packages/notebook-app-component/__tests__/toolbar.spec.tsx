import { fixtureStore } from "@nteract/fixtures";
import { ContentRecord, ContentRef } from "@nteract/types";
import { mount } from "enzyme";
import toJSON from "enzyme-to-json";
import * as Immutable from "immutable";
import * as React from "react";
import { Provider } from "react-redux";

import { CellToolbar } from "../src/toolbar";

const getContentFromStore = (store) => {
  const contents: Immutable.Map<ContentRef, ContentRecord> =
    store.getState().core.entities.contents.byRef;
  const contentRef = contents.keys().next().value;
  const contentRecord = contents.values().next().value.toJS();
  const cellID = contentRecord.model.notebook.cellOrder[0];
  const cellRecord = contentRecord.model.notebook.cellMap[cellID];

  return {
    contentRef,
    contentRecord,
    cellID,
    cellRecord,
  };
};

const makeToolbar = () => {
  const store = fixtureStore({codeCellCount: 1});
  const { contentRef, cellID } = getContentFromStore(store);
  const toolbar = mount(
    <Provider store={store}>
      <CellToolbar
        isCellFocused
        isSourceHidden={false}
        contentRef={contentRef}
        id={cellID}
      />
    </Provider>
  );

  return {
    toolbar,
    store,
  };
};

describe("Toolbar", () => {
  test("should be able to render a toolbar", () => {
    const { toolbar } = makeToolbar();
    expect(toJSON(toolbar.render())).toMatchSnapshot();
    toolbar.find(".toolbar-dropdown button").simulate("click");
    expect(toJSON(toolbar.render())).toMatchSnapshot();
  });

  test("can change cell type", () => {
    const { toolbar, store } = makeToolbar();
    const { cellRecord: cellPre } = getContentFromStore(store);
    toolbar.find(".toolbar-dropdown button").simulate("click");
    toolbar.find(".change-to-markdown").simulate("click");
    const { cellRecord: cellPost } = getContentFromStore(store);
    expect(cellPre.cell_type).toBe("code");
    expect(cellPost.cell_type).toBe("markdown");
  });

  test("can delete cell", () => {
    const { toolbar, store } = makeToolbar();
    const { cellRecord: cellPre } = getContentFromStore(store);
    toolbar.find(".delete-cell").simulate("click");
    const { cellRecord: cellPost } = getContentFromStore(store);
    expect(cellPre).toBeDefined();
    expect(cellPost).toBeUndefined();
  });
});
