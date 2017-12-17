module.exports = {
  require: jest.fn(),
  match: jest.fn(),
  app: jest.fn(),
  remote: {
    app: {
      getPath: key => {
        if (key === "home") {
          return "/home/home/on/the/range";
        }
        throw Error("not mocked");
      },
      getVersion: () => "1.4.0"
    },
    dialog: {
      showSaveDialog: jest.fn()
    },
    getCurrentWindow: () => {
      return {
        webContents: {
          printToPDF: (options, callback) => callback(null, null)
        }
      };
    }
  },
  webFrame: {
    setZoomLevel: jest.fn(),
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
  },
  dialog: {
    showSaveDialog: jest.fn()
  }
};
