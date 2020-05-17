import { actions } from "@nteract/core";
import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { Store } from "redux";
import { sendNotification } from "@nteract/mythic-notifications";
import * as path from "path";
import * as fs from 'fs';

interface InsertImagesParameters {
  imagePaths: Array<string>;
  base64ImageSource: string;
  embedImagesInNotebook: bool;
  linkImagesAndKeepAtOriginalPath: bool;
  copyImagesToNotebookDirectory: bool;
  contentRef: ContentRef;
  store: DesktopStore;
};

export function insertImages({
  imagePaths,
  base64ImageSource,
  embedImagesInNotebook,
  linkImagesAndKeepAtOriginalPath,
  copyImagesToNotebookDirectory,
  contentRef,
  store
}: InsertImagesParameters) {

  const notebookDirectory = path.dirname(selectors.filepath(store.getState(), {contentRef: contentRef}));

  if (embedImagesInNotebook) {
    if (base64ImageSource) {
      createMarkdownCellWithImages({imageSources: [base64ImageSource], store: store, contentRef: contentRef});
    } else {
      for (let imagePath of imagePaths) {
        let fileExtension = path.extname(imagePath).slice(1);
        let imageHash = fs.readFileSync(imagePath).toString('base64');
        let imageSource = `data:image/${fileExtension};base64,${imageHash}`;
        createMarkdownCellWithImages({imageSources: [imageSource], store: store, contentRef: contentRef});
      }
    }
  }

  if (copyImagesToNotebookDirectory || linkImagesAndKeepAtOriginalPath) {
    if (copyImagesToNotebookDirectory) {
      imagePaths = copyImagesToDirectoryAndReturnNewPaths({
        imagePaths: imagePaths,
        destinationDirectory: notebookDirectory,
        store: store,
        contentRef: contentRef
      })
    }

    imagePaths = makePathsRelativeWithinDirectory({
      imagePaths: imagePaths,
      directory: notebookDirectory
    });

    createMarkdownCellWithImages({
      imageSources: imagePaths,
      store: store,
      contentRef: contentRef
    });
  }
};

function createMarkdownCellWithImages({
  imageSources,
  store,
  contentRef
})
{
  store.dispatch(
    actions.createCellBelow({ // FIXME: I would like to insert the cell above, but `createCellBelow` appears to ignore the `source` argument.
      cellType: "markdown",
      contentRef: contentRef,
      source: imageSources.map((src) => `<img src=\"${src}\" />`).join("\n")
    })
  );
}

function copyImagesToDirectoryAndReturnNewPaths({
  imagePaths,
  destinationDirectory,
  store,
  contentRef
})
{
  let destinationImagePaths = []
  for (let sourceImagePath of imagePaths) {
    let imageBaseName = path.basename(sourceImagePath);
    let destinationImagePath = `${destinationDirectory}/${imageBaseName}`;
    destinationImagePaths.push(destinationImagePath);
    let performCopy = () => { fs.copyFile(sourceImagePath, destinationImagePath, () => {}) };
    if (! fs.existsSync(destinationImagePath)) {
      performCopy()
    } else {
      store.dispatch(
        sendNotification.create({
          key: `insert-images-file-${imageBaseName}-already-exists`,
          title: "File already exists",
          message: `The image ${destinationImagePath} already exists.`,
          level: "warning",
          action: {
            label: "Replace",
            callback: () => performCopy()
          }
        })
      );
    }
  }
  return destinationImagePaths;
}

// For all image paths within the given directory, use relative paths,
// for image paths outside the directory, use absolute paths.
//
function makePathsRelativeWithinDirectory({
  imagePaths,
  directory
})
{
  return imagePaths.map(imagePath => {
    let relativePath = path.relative(directory, imagePath);
    if (relativePath.startsWith("../")) {
      return imagePath;
    } else {
      return relativePath;
    }
  });
}


