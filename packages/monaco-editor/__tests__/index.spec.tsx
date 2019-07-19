import { mount } from "enzyme";
import React from "react";
const Monaco = require("../src/");
import { empty, Subject } from "rxjs";

console.log(Monaco);
describe("Language", () => {

    it("renders", () => {

        const MonacoEditor = Monaco.default;
        expect(MonacoEditor).toBeTruthy();
        const monacoEditorInstance = mount(<MonacoEditor theme="vscode" value="alert('js')" language="javascript"/>);
        expect(monacoEditorInstance).toBeTruthy();

    });
});
