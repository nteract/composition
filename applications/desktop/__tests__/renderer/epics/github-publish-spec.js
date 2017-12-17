import { ActionsObservable } from "redux-observable";

import { dummyStore, dummyCommutable } from "@nteract/core/lib/dummy";

import { toArray } from "rxjs/operators";

import { PUBLISH_USER_GIST } from "@nteract/core/constants";
import {
  publishNotebookObservable,
  createGistCallback,
  handleGistAction,
  notifyUser,
  publishEpic
} from "../../../src/notebook/epics/github-publish";

const GitHub = () => ({
  authenticate: () => {},
  gists: {
    edit: (request, callback) => {
      callback(null, { data: { id: 123, html_url: "foo" } });
    },
    create: (request, callback) => {
      callback(null, { data: { id: 123, html_url: "foo" } });
    }
  },
  users: {
    get: (request, callback) => callback(null, { data: { login: "jdetle" } })
  }
});

const createNotificationSystem = () => ({
  addNotification: () => {},
  render: () => null
});

describe("handleGistAction", () => {
  test("returns an observable from User Action", () => {
    const publishUserAction = { type: "PUBLISH_USER_GIST" };
    const store = dummyStore();
    const handleGist = handleGistAction(store, publishUserAction);
    expect(handleGist.subscribe).not.toBeNull();
  });
  test("returns an observable from anonymous Action", () => {
    const publishAnonymousAction = { type: "PUBLISH_ANONYMOUS_GIST" };
    const store = dummyStore();
    const handleGist = handleGistAction(store, publishAnonymousAction);
    expect(handleGist.subscribe).not.toBeNull();
  });
});

describe("publishNotebookObservable", () => {
  test("returns an observable", () => {
    const store = dummyStore();
    const notificationSystem = createNotificationSystem();
    const publishNotebookObs = publishNotebookObservable(
      GitHub(),
      dummyCommutable,
      "./test.ipynb",
      notificationSystem,
      false,
      store
    );
    expect(publishNotebookObs.subscribe).not.toBeNull();
  });

  test("renders a notification popup", done => {
    const store = dummyStore();
    const notificationSystem = createNotificationSystem();
    const publishNotebookObs = publishNotebookObservable(
      GitHub(),
      dummyCommutable,
      "./test.ipynb",
      notificationSystem,
      false,
      store
    );

    notificationSystem.addNotification = jest.fn();
    publishNotebookObs.subscribe(() => {}, done.fail, () => {
      expect(notificationSystem.addNotification).toHaveBeenCalled();
      done();
    });
  });

  test("calls create gist", done => {
    const github = GitHub();
    const store = dummyStore();
    const notificationSystem = createNotificationSystem();
    const publishNotebookObs = publishNotebookObservable(
      github,
      dummyCommutable,
      "./test.ipynb",
      notificationSystem,
      false,
      store
    );
    const create = jest.spyOn(github.gists, "create");
    publishNotebookObs.subscribe(() => {}, done.fail, () => {
      expect(create).toHaveBeenCalled();
      done();
    });
  });
  test("edits gist that is already made", done => {
    const github = GitHub();
    const store = dummyStore();
    const notebook = dummyCommutable.setIn(["metadata", "gist_id"], "ID123");
    const notificationSystem = createNotificationSystem();
    const publishNotebookObs = publishNotebookObservable(
      github,
      notebook,
      "./test.ipynb",
      notificationSystem,
      false,
      store
    );
    const edit = jest.spyOn(github.gists, "edit");
    publishNotebookObs.subscribe(
      x => {
        expect(x.type).toBe("OVERWRITE_METADATA_FIELD");
      },
      done.fail,
      () => {
        expect(edit).toHaveBeenCalled();
        done();
      }
    );
  });
});

describe("createGistCallback", () => {
  test("returns a function", () => {
    const store = dummyStore();
    const github = GitHub();
    const notificationSystem = createNotificationSystem();
    const publishNotebookObs = publishNotebookObservable(
      github,
      dummyCommutable,
      "./test.ipynb",
      notificationSystem,
      false,
      store
    );
    const callback = createGistCallback(
      store,
      publishNotebookObs,
      "./test.ipynb",
      notificationSystem
    );
    expect(typeof callback).toBe("function");
  });
});

describe("notifyUser", () => {
  test("notifies a user that gist has been uploaded", () => {
    const store = dummyStore();
    const notificationSystem = store.getState().app.notificationSystem;

    notificationSystem.addNotification = jest.fn();

    notifyUser("filename", "gistID", notificationSystem);
    expect(notificationSystem.addNotification).toBeCalledWith(
      expect.objectContaining({
        title: "Gist uploaded",
        message: "filename is ready",
        dismissible: true,
        position: "tr",
        level: "success"
      })
    );
  });
});
