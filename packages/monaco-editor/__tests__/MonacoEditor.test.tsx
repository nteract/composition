import * as React from "react";
import * as Monaco from "monaco-editor";
import { default as MonacoEditor, waitForLayoutsDone } from "../src/MonacoEditor";
import { mount } from "enzyme";

// Common Props required to instantiate MonacoEditor View, shared by all tests.
const monacoEditorCommonProps = {
  id: "foo",
  contentRef: "bar",
  editorType: "monaco",
  theme: "vs",
  value: "test_value",
  enableCompletion: true,
  language: "python",
  onCursorPositionChange: () => {},
};

describe("MonacoEditor component is rendering correctly", () => {
  it("Should render MonacoEditor component", () => {
    const editorWrapper = mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={false}
      />
    );
    expect(editorWrapper).not.toBeNull();
  });
});

// Setup items shared by all tests in this block
// Mock out the common API methods so that private function calls don't fail
const mockEditor = {
  onDidContentSizeChange: jest.fn(),
  onDidChangeModelContent: jest.fn(),
  onDidFocusEditorText: jest.fn(),
  onDidBlurEditorText: jest.fn(),
  onDidChangeCursorSelection: jest.fn(),
  onDidBlurEditorWidget: jest.fn(),
  onMouseMove: jest.fn(),
  updateOptions: jest.fn(),
  getValue: jest.fn(),
  setValue: jest.fn(),
  getConfiguration: jest.fn(),
  layout: jest.fn(),
  getModel: jest.fn(),
  getSelection: jest.fn(),
  focus: jest.fn(),
  hasTextFocus: jest.fn(),
  addCommand: jest.fn(),
  changeViewZones: jest.fn(),
};

const mockEditorModel = {
  updateOptions: jest.fn(),
};
const mockCreateEditor = jest.fn().mockReturnValue(mockEditor);
Monaco.editor.create = mockCreateEditor;
Monaco.editor.createModel = jest.fn().mockReturnValue(mockEditorModel);
MonacoEditor.prototype.calculateHeight = jest.fn();
MonacoEditor.prototype.registerDefaultCompletionProvider = jest.fn();

describe("MonacoEditor default completion provider", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should call registerDefaultCompletionProvider method when registerCompletionUsingDefault is set to true", () => {
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={true}
        enableCompletion={true}
        shouldRegisterDefaultCompletion={true}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    expect(
      MonacoEditor.prototype.registerDefaultCompletionProvider
    ).toHaveBeenCalledTimes(1);
  });

  it("Should not call registerDefaultCompletionProvider method when registerCompletionUsingDefault is set to false", () => {
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={true}
        enableCompletion={true}
        shouldRegisterDefaultCompletion={false}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    expect(
      MonacoEditor.prototype.registerDefaultCompletionProvider
    ).toHaveBeenCalledTimes(0);
  });
});

describe("MonacoEditor lifeCycle methods set up", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should call calculateHeight method before rendering editor", () => {
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={true}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    expect(MonacoEditor.prototype.calculateHeight).toHaveBeenCalledTimes(1);
  });

  it("Should set editor's focus on render if editorFocused prop is set and editor does not have focus", () => {
    mockEditor.hasTextFocus = jest.fn().mockReturnValue(false);
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={true}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    expect(mockEditor.focus).toHaveBeenCalledTimes(1);
  });

  it("Should not set editor's focus on render if editorFocused prop is set but editor already has focus", () => {
    mockEditor.hasTextFocus = jest.fn().mockReturnValue(true);
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={true}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    expect(mockEditor.focus).toHaveBeenCalledTimes(0);
  });

  it("Should not set editor's focus on render if editorFocused prop is false", () => {
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={false}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    expect(mockEditor.focus).toHaveBeenCalledTimes(0);
  });

  it("Should call editor setValue when value prop has changed on componentDidUpdate.", () => {
    mockEditor.setValue = jest.fn();
    const editorWrapper = mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        value="initial_value"
      />
    );
    editorWrapper.setProps({ value: "different_value" });

    // We expect setValue is called twice. First on componentDidMount and second on componentDidUpdate 
    // when the props.value has new different value.
    expect(mockEditor.setValue).toHaveBeenCalledTimes(2);
  });

  it("Should not call editor setValue when value prop has not changed on componentDidUpdate.", () => {
    mockEditor.setValue = jest.fn();
    const editorWrapper = mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        value="initial_value"
      />
    );
    editorWrapper.setProps({ value: "initial_value" });
    
    // We expect setValue is called once on componentDidMount when the props.value does not have different value.
    expect(mockEditor.setValue).toHaveBeenCalledTimes(1);
  });
});

describe("MonacoEditor lineNumbers configuration", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should set lineNumbers on editor when set in props", () => {
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={false}
        lineNumbers={true}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    // Get the second arg to Monaco.editor.create call
    const editorCreateArgs = mockCreateEditor.mock.calls[0][1];
    expect(editorCreateArgs).toHaveProperty("lineNumbers");
    expect(editorCreateArgs.lineNumbers).toEqual("on");
  });

  it("Should not set lineNumbers on editor when set to false in props", () => {
    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={false}
        lineNumbers={false}
      />
    );
    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    // Get the second arg to Monaco.editor.create call
    const editorCreateArgs = mockCreateEditor.mock.calls[0][1];
    expect(editorCreateArgs).toHaveProperty("lineNumbers");
    expect(editorCreateArgs.lineNumbers).toEqual("off");
  });
});

describe("MonacoEditor resize handler when window size changes", () => {
  beforeAll(() => {
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
  });
  it("Should not call resize handler at all when window is not resized", () => {
    // Create a new editor instance with the mock layout
    const mockEditorLayout = jest.fn();
    const newMockEditor = {...mockEditor};
    newMockEditor.layout = mockEditorLayout;
    mockCreateEditor.mockReturnValue(newMockEditor);
    // We spy on the resize handler calls without changing the implementation
    const resizeHandlerSpy = jest.spyOn(MonacoEditor.prototype, "resize");

    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={false}
      />
    );

    expect(mockCreateEditor).toHaveBeenCalledTimes(1);
    // Resize handler should be called
    expect(resizeHandlerSpy).toHaveBeenCalledTimes(0);
    // editor.layout should not be called
    expect(mockEditorLayout).toHaveBeenCalledTimes(0);

    // Restore spy
    resizeHandlerSpy.mockRestore();
  });

  it("Resize handler should not trigger editor.layout when it is not focused", () => {
    // This is a perf optimization to reduce layout calls for unfocussed editors

    // Create a new editor instance with the mock layout
    const mockEditorLayout = jest.fn();
    const newMockEditor = {...mockEditor};
    newMockEditor.layout = mockEditorLayout;
    mockCreateEditor.mockReturnValue(newMockEditor);
    // We spy on the resize handler calls without changing the implementation
    const resizeHandlerSpy = jest.spyOn(MonacoEditor.prototype, "resize");

    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={false}
      />
    );
    (window as any).innerWidth = 500;
    window.dispatchEvent(new Event('resize'));

    // Resize handler should be called
    expect(resizeHandlerSpy).toHaveBeenCalledTimes(1);
    // editor.layout should not be called
    expect(mockEditorLayout).toHaveBeenCalledTimes(0);

    // Restore spy
    resizeHandlerSpy.mockRestore();
  });

  it("Resize handler should trigger an editor.layout call for a focused editor", async () => {
    // Create a new editor instance with the mock layout
    const mockEditorLayout = jest.fn();
    const newMockEditor = {...mockEditor};
    newMockEditor.layout = mockEditorLayout;
    mockCreateEditor.mockReturnValue(newMockEditor);
    // We spy on the resize handler calls without changing the implementation
    const resizeHandlerSpy = jest.spyOn(MonacoEditor.prototype, "resize");;

    mount(
      <MonacoEditor
        {...monacoEditorCommonProps}
        channels={undefined}
        onChange={jest.fn()}
        onFocusChange={jest.fn()}
        editorFocused={true}
      />
    );
    (window as any).innerWidth = 500;
    window.dispatchEvent(new Event('resize'));
    
    await waitForLayoutsDone();
    expect(resizeHandlerSpy).toHaveBeenCalledTimes(1);
    expect(mockEditorLayout).toHaveBeenCalledTimes(1);

    // Restore spy
    resizeHandlerSpy.mockRestore();
  });
});