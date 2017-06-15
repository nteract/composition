import { protocol, BrowserWindow, app } from "electron";

const path = require("path");
const url = require("url");

const fs = require("fs");

const baseAppDirectory = path.resolve(path.join(__dirname, "..", ".."));

const node_modules = path.join(baseAppDirectory, "node_modules");

const mime = require("mime");

const BASE_PATH = app.getAppPath();

function renderTemplate(dirpath) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <link rel="stylesheet" href="file://${node_modules}/normalize.css/normalize.css"/>
        <link rel="stylesheet" href="file://${node_modules}/codemirror/lib/codemirror.css"/>
        <link rel="stylesheet" href="file://${node_modules}/codemirror/addon/hint/show-hint.css"/>
        <link rel="stylesheet" href="file://${node_modules}/codemirror/addon/dialog/dialog.css"/>
        <link rel="stylesheet" href="file://${node_modules}/nteract-assets/fonts/source-sans-pro/source-sans-pro.css"/>
        <link rel="stylesheet" href="file://${node_modules}/nteract-assets/fonts/source-code-pro/source-code-pro.css"/>
        <link rel="stylesheet" href="file://${node_modules}/nteract-assets/fonts/octicons/octicons.css"/>
        <link rel="stylesheet" href="file://${BASE_PATH}/static/styles/main.css" />
        <link rel="stylesheet" href="file://${BASE_PATH}/static/styles/theme-light.css" />
        <script type="text/javascript" src="file://${node_modules}/mathjax-electron/resources/MathJax/MathJax.js?config=electron"></script>
        <base href="file://${dirpath}" />
      </head>
      <body>
        <div id="app">
          Loading...
        </div>
        <script>
          window.onload = function deferredLoad() {
            if (process.env.NODE_ENV === 'development') {
                var rdev = require('electron-react-devtools');
                rdev.install();
            } else {
                // Force production by default for the sake of packaging
                process.env.NODE_ENV = 'production';
            }
            try {
              require('${path.join(baseAppDirectory, "lib", "vendor")}')
              require('${path.join(
                baseAppDirectory,
                "lib",
                "webpacked-notebook"
              )}')
            } catch(err) {
              const el = document.querySelector('body');
              el.innerHTML = '';

              const headerEl = document.createElement('h3');
              const msgContainer = document.createElement('div');

              headerEl.textContent = err.message;

              switch(err.code) {
                case 'MODULE_NOT_FOUND':
                  const msgEl = document.createElement('pre');
                  msgEl.textContent = 'Do you need to npm install any new packages?';
                  msgContainer.appendChild(msgEl);
                  break;
                default:
                  if(/Module version mismatch/.test(err.message)) {
                    msgContainer.innerHTML = '<p>the native modules mismatch, try running <a href="https://github.com/nteract/nteract#troubleshooting"><pre>npm install</pre></a> from the root of the git clone</p>';
                  }
              }
              el.appendChild(headerEl);
              el.appendChild(msgContainer);
              console.dir(err);
            }
          };
        </script>
      </body>
    </html>
    `;
}

const SCHEME = "nteract";
const SCHEME_PREFIX_LENGTH = SCHEME.length + ":/".length;

protocol.registerStandardSchemes(["nteract"]);

/**
 * Registers the nteract protocol
 * NOTE: Protocols have to be registered after the `app` fires the 'ready' event.
 */
export function registerProtocol() {
  protocol.registerBufferProtocol(
    "nteract",
    (request, callback) => {
      console.log(request);

      const pathname = request.url.substr(SCHEME_PREFIX_LENGTH);
      console.log("PATHNAME ", pathname);
      const extension = path.extname(pathname);

      if (extension === ".ipynb") {
        // Custom render
        callback({
          mimeType: "text/html",
          data: new Buffer(renderTemplate(pathname))
        });
        return;
      }

      // Now we pass through to default read.
      callback({
        mimeType: mime.lookup(extension),
        // TODO: Async yo
        data: fs.readFileSync(pathname)
      });
    },
    error => {
      if (error) console.error("Failed to register protocol");
    }
  );
}
