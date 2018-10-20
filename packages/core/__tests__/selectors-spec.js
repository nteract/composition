import Immutable from "immutable";
import { dummyCommutable } from "../src/dummy";
import * as selectors from "../src/selectors";
import * as stateModule from "../src/state";

describe("codeMirrorMode", () => {
  test("determines the right mode from the notebook metadata", () => {
    const mode = selectors.notebook.codeMirrorMode(
      stateModule.makeDocumentRecord({
        notebook: dummyCommutable
      })
    );
    expect(mode).toEqual(Immutable.fromJS({ name: "ipython", version: 3 }));

    const lang2 = selectors.notebook.codeMirrorMode(
      stateModule.makeDocumentRecord({
        notebook: dummyCommutable.setIn(
          ["metadata", "language_info", "codemirror_mode", "name"],
          "r"
        )
      })
    );
    expect(lang2).toEqual(Immutable.fromJS({ name: "r", version: 3 }));
  });
});
