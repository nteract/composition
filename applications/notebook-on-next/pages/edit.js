// @flow
import React from "react";
import { ConnectedNotebook } from "@nteract/core/lib/components/notebook";
import { ActionsObservable } from "redux-observable";
import fetch from "isomorphic-fetch";
import configureStore from "../store";
import { loadEpic } from "../epics/contents";
import withRedux from "next-redux-wrapper";
import { fromJS } from "@nteract/commutable";
import { Map } from "immutable";
import type { List } from "immutable";

class Edit extends React.Component<{ notebook: Object }> {
  static async getInitialProps({ store, query }) {
    const resultAction = await loadEpic(
      // $FlowFixMe
      ActionsObservable.of({ type: "LOAD", gistid: query.gistid }),
      store
    ).toPromise();
    store.dispatch(resultAction);
    return { notebook: resultAction.payload };
  }

  render() {
    if (!this.props.notebook) return <div>No notebook yet :(</div>;
    const notebook = fromJS(this.props.notebook);
    const language = notebook.getIn(
      ["metadata", "language_info", "codemirror_mode", "name"],
      notebook.getIn(
        ["metadata", "language_info", "codemirror_mode"],
        notebook.getIn(["metadata", "language_info", "name"], "text")
      )
    );
    const cellOrder = notebook.get("cellOrder");
    const cellMap = notebook.get("cellMap");
    return (
      <ConnectedNotebook
        cellOrder={cellOrder}
        cellMap={cellMap}
        cellPagers={Map()}
        stickyCells={Map()}
        transient={Map()}
        cellFocused={null}
        editorFocused={null}
        theme={"light"}
        lastSaved={new Date()}
        kernelSpecDisplayName={"python"}
        executionState={"idle"}
        models={Map()}
        language={language}
      />
    );
  }
}
export default withRedux({
  createStore: () => configureStore({}),
  debug: true
})(Edit);
