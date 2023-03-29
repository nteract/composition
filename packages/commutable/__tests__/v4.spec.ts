import * as Immutable from "immutable";
import { makeDisplayData, makeErrorOutput, makeExecuteResult, makeStreamOutput, OnDiskStreamOutput } from "../src/outputs";
import * as primitives from "../src/primitives";
import { createCodeCell, createMarkdownCell, makeNotebookRecord } from "../src/structures";
import { cellToJS, fromJS, NotebookV4, outputToJS, toJS } from "../src/v4";

describe("cellToJS", () => {
  it("throws an error for unkown cell types", () => {
    const cell = Immutable.Map({
      cell_type: "not_real"
    });

    // @ts-ignore supposed to fail
    const invocation = () => cellToJS(cell);

    expect(invocation).toThrowError("Cell type unknown at runtime");
  });
  it("process known cell types", () => {
    const codeCell = createCodeCell();
    const markdownCell = createMarkdownCell();
    expect(cellToJS(codeCell).cell_type).toBe("code");
    expect(cellToJS(markdownCell).cell_type).toBe("markdown");
  });
  it("can create and convert a markdown cell with attachments", () => {
    const markdownCell = createMarkdownCell({
      attachments: Immutable.Map({
        "4e9a85bc-16ff-4d09-a23d-b3f731a5cc16.jpg": {
          "image/jpeg": 
          "<base64-string>"
        }
      })
    });
    const markdownCellAsJs = cellToJS(markdownCell);
    expect(markdownCellAsJs.attachments).toBeDefined();
    expect(markdownCellAsJs.attachments).toHaveProperty(["4e9a85bc-16ff-4d09-a23d-b3f731a5cc16.jpg", "image/jpeg"], "<base64-string>");
  })
});

describe("outputToJS", () => {
  it("can process all output types", () => {
    const executeResultOutput = makeExecuteResult();
    const displayDataOutput = makeDisplayData();
    const streamOutput = makeStreamOutput();
    const errorOutput = makeErrorOutput();

    expect(outputToJS(executeResultOutput).output_type).toEqual(
      "execute_result"
    );
    expect(outputToJS(displayDataOutput).output_type).toEqual("display_data");
    expect(outputToJS(streamOutput).output_type).toEqual("stream");
    expect(outputToJS(errorOutput).output_type).toEqual("error");
  });

  it("stream output does not reformat multiline string", () => {
    const text = "line1\r\nline2\rline3\nline4\n\n\r\n\r\r\n";
    const streamOutput = makeStreamOutput().set("text", text)
    const outputJS = outputToJS(streamOutput) as OnDiskStreamOutput;
    expect(outputJS.text).toEqual(text);
  });
});

describe("cell ids", () => {
  let originalCreateCellId = undefined;

  type NotebookParameters = {
    cells?: any;
    minorVersion?: number;
  };

  const initial = createCodeCell().toJS();

  // Obtains a notebook for the following tests
  // allows overriding cells collection and minor version
  const getNotebook = ({
    cells = undefined,
    minorVersion = 5
  }: NotebookParameters = {}) => {
    const notebook: NotebookV4 = {
      cells: cells || [
        {
          ...initial,
          id: "test-cell-id"
        }
      ],
      metadata: {},
      nbformat: 4,
      nbformat_minor: minorVersion || 5
    };

    return notebook;
  };

  beforeAll(() => {
    // Keep track of the original createCellId method
    originalCreateCellId = primitives.createCellId;

    // Manually mock out the create cell
    (primitives as any).createCellId = () => "one-two-three";
  });

  afterAll(() => {
    // Restore the original createCellId method
    (primitives as any).createCellId = originalCreateCellId;
  });

  describe("fromJS", () => {
    it("uses provided cell id when v4.5", () => {
      const notebook = getNotebook();
      const immNotebook = fromJS(notebook);

      // ensure we're using the provided id for the cell order and cell map
      expect(immNotebook.get("cellOrder").toJSON()).toEqual(["test-cell-id"]);
      expect(immNotebook.getIn(["cellMap", "test-cell-id"]).toJS()).toEqual(
        initial
      );
    });

    it("uses generated cell id when v4.4 (or prior)", () => {
      // override createCellId

      const notebook = getNotebook({ minorVersion: 4 });
      const immNotebook = fromJS(notebook);

      // ensure we're using the provided id for the cell order and cell map
      expect(immNotebook.get("cellOrder").toJSON()).toEqual(["one-two-three"]);
      expect(immNotebook.getIn(["cellMap", "one-two-three"]).toJS()).toEqual(
        initial
      );
    });

    it("uses generated cell id when cell id not present", () => {
      const notebook = getNotebook({
        cells: [
          {
            ...initial
          }
        ]
      });

      const immNotebook = fromJS(notebook);

      // ensure we're using the provided id for the cell order and cell map
      expect(immNotebook.get("cellOrder").toJSON()).toEqual(["one-two-three"]);
      expect(immNotebook.getIn(["cellMap", "one-two-three"]).toJS()).toEqual(
        initial
      );
    });
    it("can read notebook containing a markdown cell with attachments", () => {
      const sampleMarkdownCell = createMarkdownCell({
        attachments: Immutable.Map({
          "foo.gif": {
            "image/gif": ["<mulitline-base64", "-string>"]
          }
        })
      }).toJS();
      const notebook = getNotebook({
        cells: [
          {
            ...sampleMarkdownCell,
            id: "markdown-test-cell"
          }
        ]
      });
      const immNotebook = fromJS(notebook);
      const markdownCell = immNotebook.getIn(["cellMap", "markdown-test-cell"]).toJS();

      expect(markdownCell).toHaveProperty(["attachments", "foo.gif", "image/gif"], "<mulitline-base64-string>");
    });
  });

  describe("toJS", () => {
    const getCell = () => {
      return createCodeCell({
        id: "this-cell-id",
        cell_type: "code",
        execution_count: null,
        source: ""
      });
    };

    it("includes cell id when version 4.5+", () => {
      const cell = getCell();
      const notebook = makeNotebookRecord({
        nbformat: 4,
        nbformat_minor: 5,
        cellOrder: Immutable.List(["one-two-three"]),
        cellMap: Immutable.Map({
          "one-two-three": cell
        })
      });

      const out = toJS(notebook);
      expect(out.cells[0].id).toEqual("one-two-three");
    });

    it("does not include notebook when version 4.4 or lower", () => {
      const cell = getCell();
      const notebook = makeNotebookRecord({
        nbformat: 4,
        nbformat_minor: 4,
        cellOrder: Immutable.List(["one-two-three"]),
        cellMap: Immutable.Map({
          "one-two-three": cell
        })
      });

      const out = toJS(notebook);
      expect(out.cells[0].hasOwnProperty("id")).toBe(false);
    });
  });
});
