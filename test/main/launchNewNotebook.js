import { expect } from "chai";

import { launchNewNotebook } from "../../src/main/launch";

const ipc = require("electron").ipcMain;

describe("launchNewNotebook", () => {
  it("launches a kernel", done => {
    // Note that we can't use => functions because we need `this` to be mocha's
    this.timeout(10000);

    let win;
    ipc.on("nteract:ping:kernel", (event, kernel) => {
      win.close();
      expect(kernel).to.equal("inodejs");
      done();
    });

    win = launchNewNotebook("inodejs");
    win.hide(); // To make it nicer to run locally

    setTimeout(() => {
      expect.fail(
        "nteract:ping:kernel",
        null,
        "Expected nteract:ping:kernel to be sent from frontend"
      );
      done();
    }, 8000);
  });
});
