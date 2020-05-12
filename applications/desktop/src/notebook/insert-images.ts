import { actions } from "@nteract/core";
import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { Store } from "redux";
import * as path from "path";
import * as fs from 'fs';

interface InsertImagesParameters {
  imagePaths: Array<string>;
  copyImagesToNotebookDirectory: bool;
  contentRef: ContentRef;
  store: DesktopStore;
};

export function insertImages({
  imagePaths,
  copyImagesToNotebookDirectory,
  contentRef,
  store
}: InsertImagesParameters) {

  const notebookPath = path.dirname(selectors.filepath(store.getState(), {contentRef: contentRef}));

  if (copyImagesToNotebookDirectory) {
    let destinationImagePaths = []
    for (let sourceImagePath of imagePaths) {
      let imageBaseName = path.basename(sourceImagePath);
      let destinationImagePath = `${notebookPath}/${imageBaseName}`;
      destinationImagePaths.push(destinationImagePath);
      if (! fs.existsSync(destinationImagePath)) {
        fs.copyFile(sourceImagePath, destinationImagePath, () => {});
      } else {
        // TODO: Can we have some kind of warning banner here?
      }
    }
    imagePaths = destinationImagePaths;
  }

  // For image files that are within the notebook directory, only use relative paths,
  // for all other files, use the full path.
  imagePaths = imagePaths.map(imagePath => {
    let relativePath = path.relative(notebookPath, imagePath);
    if (relativePath.startsWith("../")) {
      return imagePath;
    } else {
      return relativePath;
    }
  });

  if (imagePaths.length > 0) {
    store.dispatch(
      actions.createCellBelow({ // FIXME: I would like to insert the cell above, but `createCellBelow` appears to ignore the `source` argument.
        cellType: "markdown",
        contentRef: contentRef,
        source: imagePaths.map((path) => `<img src=\"${path}\">`).join("\n")
      })
    );
  }

};