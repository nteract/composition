// @flow

/**
 * Local storage provider for commuter
 */

const fs = require("fs-extra");
const path = require("path");

export type DiskProviderOptions = {
  local: {
    baseDirectory: string
  }
};

/**
 * Convert a single dot or slash to ''
 *
 * This is for conforming to the Jupyter contents API for the `/` endpoint
 */
function cleanBaseDir(s: string) {
  if (s === "." || s === "/") {
    return "";
  }
  return s;
}

function createContentResponse(
  parsedFilePath: {
    root: string,
    dir: string,
    base: string,
    ext: string,
    name: string
  },
  // $FlowFixMe: fs-extra
  stat: fs.Stats
): JupyterApi$Content {
  const name = cleanBaseDir(parsedFilePath.base);
  const filePath = cleanBaseDir(
    path.join(parsedFilePath.dir, parsedFilePath.base)
  );
  // $FlowFixMe: fs-extra
  const writable = Boolean(fs.constants.W_OK & stat.mode);
  const created: Date = stat.birthtime;
  const last_modified = stat.mtime;

  if (stat.isDirectory()) {
    return {
      type: "directory",
      mimetype: null,
      format: "json",
      content: null,
      writable,
      name: name === "." ? "" : name,
      path: filePath === "." ? "" : filePath,
      created,
      last_modified
    };
  } else if (stat.isFile()) {
    // TODO: Handle notebook differently
    if (parsedFilePath.ext === ".ipynb") {
      return {
        type: "notebook",
        mimetype: null,
        format: "json",
        content: null,
        writable,
        name,
        path: filePath,
        created,
        last_modified
      };
    }

    // TODO: Mimetype detection
    return {
      type: "file",
      mimetype: null,
      format: "text",
      content: null,
      writable,
      name,
      path: filePath,
      created,
      last_modified
    };
  }

  throw new Error(
    "Content listings can not be created from something that isn't a file or directory"
  );
}

function createContentPromise(
  options: DiskProviderOptions,
  filePath: string
): Promise<JupyterApi$Content> {
  const fullPath = path.join(options.local.baseDirectory, filePath);
  const parsedFilePath = path.parse(filePath);
  return new Promise((resolve, reject) => {
    // perform a STAT call to create contents response
    fs.stat(fullPath, (err, stat) => {
      if (err) {
        // Could also resolve with an error, then filter it out
        // TODO: Decide on what to do in error case
        reject(err);
        return;
      }
      if (!(stat.isDirectory() || stat.isFile())) {
        // Mark non-directory and non-file as to be ignored
        reject(new Error(`${filePath} is not a directory or file`));
      }
      resolve(createContentResponse(parsedFilePath, stat));
    });
  });
}

export function sanitizeFilePath(unsafeFilePath: string): string {
  return path.join(
    path
      .normalize(unsafeFilePath)
      // Remove leading `..`
      .replace(/^(\.\.[\/\\])+/, "")
      // Remove leading '/'
      .replace(/^([\/\\])+/, "")
  );
}

export function get(
  options: DiskProviderOptions,
  unsafeFilePath: string
): Promise<JupyterApi$Content | JupyterApi$ContentError> {
  const filePath = sanitizeFilePath(unsafeFilePath);

  // TODO: filePath should be normalized
  const contentP = createContentPromise(options, filePath);
  return contentP.then(content => {
    if (content.type === "directory") {
      return getDirectory(options, content);
    }
    if (content.type === "file") {
      return getFile(options, content);
    }
    if (content.type === "notebook") {
      return getNotebook(options, content);
    }

    return {
      reason: "Unsupported content",
      message: `Unrecognized content type "${content.type}"`
    };
  });
}

export function post(
  options: DiskProviderOptions,
  unsafeFilePath: string,
  content: mixed
) {
  const filePath = path.join(
    options.local.baseDirectory,
    sanitizeFilePath(unsafeFilePath)
  );
  return fs.outputFile(filePath, JSON.stringify(content));
}

function getDirectory(
  options: DiskProviderOptions,
  directory: JupyterApi$DirectoryContent
): Promise<JupyterApi$DirectoryContent> {
  return new Promise((resolve, reject) => {
    fs.readdir(
      path.join(options.local.baseDirectory, directory.path),
      (err, listing) => {
        if (err) {
          reject(err);
          return;
        }
        // Perform a stat call on each file, creating a promise for each
        // return value
        const contentPromises = listing.map(
          // map across each file listed from the directory
          fname =>
            // creating a promise for each filename
            createContentPromise(
              options,
              path.join(directory.path, fname)
            ).catch(err => {
              // Not sure what our flow should be for errors
              // For now we'll log it since we want the rest of the directory to
              // show.
              // TODO: Verify how jupyter handles error cases on stat calls to files
              //       in the directory
              console.error(err);
              return null;
            })
        );

        Promise.all(contentPromises)
          // $FlowFixMe
          .then(contents =>
            contents.filter(x => !(x === null || x === undefined))
          )
          .then(contents => {
            resolve(Object.assign({}, directory, { content: contents }));
          });
      }
    );
  });
}

function getFile(
  options: DiskProviderOptions,
  file: JupyterApi$FileContent
): Promise<JupyterApi$FileContent> {
  return new Promise((resolve, reject) => {
    // TODO: Should we support a streaming interface or nah
    // $FlowFixMe: fs-extra
    fs.readFile(
      path.join(options.local.baseDirectory, file.path),
      (err, data) => {
        if (err) {
          reject(err);
        }
        let str = data.toString("utf-8");
        let format = file.format;
        for (let i = 0; i < str.length; ++i) {
          if (str.charCodeAt(i) === 65533) {
            // 65533 is the magic number for unknown character
            // We will not send the content, as the interface
            // currently doesn't render it.  But this is a bad
            // contract.
            //
            // We denote the format as null rather than some strange format since we need to
            // stay spec compliant with jupyter
            format = null;
            str = "";
            break;
          }
        }
        resolve(Object.assign({}, file, { content: str, format: format }));
      }
    );
  });
}

function getNotebook(
  options: DiskProviderOptions,
  notebook: JupyterApi$NotebookContent
): Promise<JupyterApi$NotebookContent> {
  return new Promise((resolve, reject) => {
    // TODO: Should we support a streaming interface or nah
    // $FlowFixMe: fs-extra
    fs.readFile(
      path.join(options.local.baseDirectory, notebook.path),
      (err, data) => {
        if (err) {
          reject(err);
        }
        try {
          const notebookJSON: Object = JSON.parse(data.toString());
          resolve(Object.assign({}, notebook, { content: notebookJSON }));
          return;
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}
