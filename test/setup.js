/* eslint-disable arrow-body-style, max-len */
// From https://github.com/airbnb/enzyme/blob/master/docs/guides/jsdom.md

const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const exposedProperties = ["window", "navigator", "document"];

const { window } = new JSDOM('<html><body><div id="app"></div></html>', {
  runScripts: "outside-only"
});

global.window = window;
global.document = window.document;

Object.keys(document.defaultView).forEach(property => {
  if (typeof global[property] === "undefined") {
    exposedProperties.push(property);
    global[property] = document.defaultView[property];
  }
});

// For some reason, these properties do not get set above.
global.Image = global.window.Image;
global.HTMLElement = global.window.HTMLElement;

// React assumes console.debug can/should be used when the userAgent matches Chrome
// For tests, we want these debug statements suppressed
global.console.debug = () => {};

global.navigator = {
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) nteract/0.0.12 Chrome/50.0.2661.102 Electron/1.1.3 Safari/537.36",
  platform: "MacIntel"
};

global.Range = function Range() {};

const createContextualFragment = html => {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.children[0]; // so hokey it's not even funny
};

Range.prototype.createContextualFragment = html =>
  createContextualFragment(html);

// HACK: Polyfil that allows codemirror to render in a JSDOM env.
global.window.document.createRange = function createRange() {
  return {
    setEnd: () => {},
    setStart: () => {},
    getBoundingClientRect: () => {
      return { right: 0 };
    },
    getClientRects: () => [],
    createContextualFragment
  };
};

// Mocks for tests
const mock = require("mock-require");

mock("electron-json-storage", {
  get: (key, callback) => {
    callback(null, { theme: "light" });
  },
  set: (key, json, callback) => {
    if (!json && !key) {
      callback(new Error("Must provide JSON and key"));
    }

    callback(null);
  }
});

mock("@nteract/plotly", {
  newPlot: () => {},
  redraw: () => {}
});

const enchannelZMQMock = {
  createControlSubject: () => {},
  createStdinSubject: () => {},
  createIOPubSubject: () => {},
  createShellSubject: () => {}
};

mock("enchannel-zmq-backend", enchannelZMQMock);
mock("packages/enchannel-zmq-backend", enchannelZMQMock);

mock("electron", {
  shell: {
    openExternal: () => {}
  },
  remote: {
    app: {
      getPath: key => {
        if (key === "home") {
          return "/home/home/on/the/range";
        }
        throw Error("not mocked");
      },
      getVersion: () => "0.1.0"
    },
    dialog: {
      showSaveDialog: () => {}
    },
    BrowserWindow: {
      getFocusedWindow: () => {
        return {
          setTitle: () => {}
        };
      }
    },
    getCurrentWindow: () => {
      return {
        setTitle: () => {},
        setDocumentEdited: () => {},
        setRepresentedFilename: () => {},
        webContents: {
          printToPDF: (options, callback) => callback(null, null)
        }
      };
    }
  },
  webFrame: {
    setZoomLevel: () => {},
    getZoomLevel: () => {
      return 1;
    }
  },
  ipcRenderer: {
    on: (message, callback) => {
      if (message === "kernel_specs_reply") {
        const specs = {
          python3: {
            name: "python3",
            spec: { argv: {}, display_name: "Python 3", language: "python" }
          }
        };
        callback(null, specs);
      }
    },
    send: () => {}
  }
});

/* eslint-disable prefer-arrow-callback */
mock("github", function github() {
  return {
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
  };
});
/* eslint-enable prefer-arrow-callback */

mock("react-notification-system", () => {
  return {
    addNotification: () => {},
    render: () => null
  };
});

const kernelspecsMock = {
  find: kernelName => Promise.resolve({ name: kernelName })
};

mock("kernelspecs", kernelspecsMock);
mock("packages/kernelspecs", kernelspecsMock);

const spawnteractMock = {
  launchSpec: kernelSpec => {
    function writeConnectionFile(config) {
      return new Promise((resolve, reject) => {
        try {
          resolve({ config, connectionFile: "connectionFile" });
        } catch (err) {
          reject(err);
        }
      });
    }
    return writeConnectionFile("config").then(c => {
      return {
        spawn: { on: () => {} },
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpec: kernelSpec.name
      };
    });
  },
  launch: kernelSpecName => {
    function writeConnectionFile(config) {
      return new Promise((resolve, reject) => {
        try {
          resolve({ config, connectionFile: "connectionFile" });
        } catch (err) {
          reject(err);
        }
      });
    }
    return writeConnectionFile("config").then(c => {
      return {
        spawn: "runningKernel",
        connectionFile: c.connectionFile,
        config: c.config,
        kernelSpecName
      };
    });
  }
};

mock("spawnteract", spawnteractMock);
mock("packages/spawnteract", kernelspecsMock);

mock("fs", {
  unlinkSync: () => {},
  unlink: () => {},
  existsSync: () => {},
  writeFile: (name, data, callback) => callback(null)
});
