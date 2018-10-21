// @flow
import { toArray } from "rxjs/operators";

const { binder, formBinderURL } = require("../src");

test("formBinderURL has default values with empty options", () => {
  expect(formBinderURL()).toEqual(
    "https://mybinder.org/build/gh/jupyter/notebook/master"
  );

  expect(formBinderURL({})).toEqual(
    "https://mybinder.org/build/gh/jupyter/notebook/master"
  );
});

test("formBinderURL correctly creates a full binder URL", () => {
  expect(
    formBinderURL({
      repo: "nteract/vdom",
      ref: "0.5"
    })
  ).toEqual("https://mybinder.org/build/gh/nteract/vdom/0.5");

  expect(
    formBinderURL({
      repo: "nteract/vdom",
      ref: "0.5",
      binderURL: "https://binder.nteract.io"
    })
  ).toEqual("https://binder.nteract.io/build/gh/nteract/vdom/0.5");
});

test("binder", () => {
  const sources = {};

  class PretendEventSource {
    constructor(url) {
      sources[url] = this;
      this.close = jest.fn();
    }
  }

  const messagesPromise = binder({ repo: "nteract/vdom" }, PretendEventSource)
    .pipe(toArray())
    .toPromise();

  const messages = [
    {
      phase: "built",
      imageName:
        "gcr.io/binder-prod/prod-v4-1-nteract-vdom:78fa2b549f67afc3525543b0bccfb08a9e06b006",
      message: "Found built image, launching...\n"
    },
    { phase: "launching", message: "Launching server...\n" },
    {
      phase: "ready",
      message:
        "server running at https://hub.mybinder.org/user/nteract-vdom-r115e00y/\n",
      url: "https://hub.mybinder.org/user/nteract-vdom-r115e00y/",
      token: "tocwpFakeToken"
    }
  ];

  const liveSource =
    sources["https://mybinder.org/build/gh/nteract/vdom/master"];

  for (var message of messages) {
    liveSource.onmessage({
      data: JSON.stringify(message)
    });
  }

  return messagesPromise.then(pumpedMessages => {
    expect(pumpedMessages).toEqual(messages);
    expect(liveSource.close).toHaveBeenCalledTimes(1);
  });
});
