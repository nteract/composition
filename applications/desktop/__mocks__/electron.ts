module.exports = {
  require: jest.fn(),
  match: jest.fn(),
  app: jest.fn(),
  remote: {
    BrowserWindow: () => {
      return {
        show: jest.fn(),
        getURL: jest.fn(() => {
          return "";
        }),
        webContents: {
          on: jest.fn((s, callback) => {
            callback();
          })
        },
        loadURL: jest.fn(),
        getAllWindows: () => [],
      };
    },
    app: {
      getPath: (key: string) => {
        if (key === "home") {
          return "/home/home/on/the/range";
        }
        throw Error("not mocked");
      },
      getVersion: () => "1.4.0"
    },
    dialog: {
      showSaveDialog: jest.fn(),
      showMessageBox: jest.fn()
    },
    getCurrentWindow: () => {
      return {
        webContents: {
          printToPDF: (options: object, callback: Function) =>
            callback(null, null)
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
    on: (message: string, callback: Function) => {
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
