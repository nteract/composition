import { actions } from "@nteract/core";
import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { DesktopStore } from "./store";
import * as path from "path";
import * as fs from 'fs';
import { emptyMarkdownCell, emptyCodeCell, createImmutableOutput } from "@nteract/commutable";
import * as Immutable from "immutable";

interface InsertImagesParameters {
  imagePaths?: Array<string>;
  base64ImageSource?: string;
  embedImagesInNotebook?: boolean;
  linkImagesAndKeepAtOriginalPath?: boolean;
  copyImagesToNotebookDirectory?: boolean;
  contentRef: ContentRef;
  store: DesktopStore;
};

export function insertImages({
  imagePaths = [],
  base64ImageSource,
  embedImagesInNotebook,
  linkImagesAndKeepAtOriginalPath,
  copyImagesToNotebookDirectory,
  contentRef,
  store
}: InsertImagesParameters)
{
  if (embedImagesInNotebook) {
    if (base64ImageSource) {
      createMarkdownCellWithImages({imageSources: [base64ImageSource], store, contentRef});
    } else {
      for (let imagePath of imagePaths) {
        let fileExtension = path.extname(imagePath).slice(1);
        let base64Image = fs.readFileSync(imagePath).toString('base64');
        createCodeCellWithImageOutput({
          base64Image,
          imageType: `image/${fileExtension}`,
          imagePath,
          store,
          contentRef
        });
      }
    }
  }

  const notebookPath = selectors.filepath(store.getState(), {contentRef: contentRef});
  const notebookDirectory = (notebookPath) ? path.dirname(notebookPath) : null;

  if (copyImagesToNotebookDirectory || linkImagesAndKeepAtOriginalPath) {
    if (notebookDirectory) {
      if (copyImagesToNotebookDirectory) {
        imagePaths = copyImagesToDirectoryAndReturnNewPaths({
          imagePaths,
          destinationDirectory: notebookDirectory,
          store,
          contentRef
        })
      }

      imagePaths = makePathsRelativeWithinDirectory({
        imagePaths,
        directory: notebookDirectory
      });
    }

    createMarkdownCellWithImages({
      imageSources: imagePaths,
      store,
      contentRef
    });
  }
};

interface CreateMarkdownCellWithImagesParameters {
  imageSources: Array<string>;
  store: DesktopStore;
  contentRef: ContentRef;
}

function createMarkdownCellWithImages({
  imageSources,
  store,
  contentRef
}: CreateMarkdownCellWithImagesParameters)
{
  let newCell = emptyMarkdownCell.set("source",
    imageSources.map((src) => `<img src=\"${src}\" />`).join("\n")
  );

  store.dispatch(
    actions.createCellAbove({
      cellType: "markdown",
      contentRef,
      cell: newCell
    })
  );
}

interface CreateCodeCellWithImageOutputParameters {
  base64Image: string;
  imageType: string;
  imagePath: string;
  store: DesktopStore;
  contentRef: ContentRef;
}

function createCodeCellWithImageOutput({
  base64Image,
  imageType,
  imagePath,
  store,
  contentRef
}: CreateCodeCellWithImageOutputParameters) {

  let newCell = emptyCodeCell
    .set("outputs", Immutable.List([
      createImmutableOutput({
        "output_type": "display_data",
        "data": {
          [imageType]: [
            base64Image + "\n"
          ]
        },
        "metadata": {}
      })
    ]))
    .set("metadata", Immutable.fromJS({
      "collapsed": false,
      "jupyter": {
        "source_hidden": true,
        "output_hidden": false
      }
    }))
  ;

  store.dispatch(
    actions.createCellAbove({
      cellType: "code",
      contentRef,
      cell: newCell
    })
  );
}

interface CopyImagesToDirectoryAndReturnNewPathsParameters {
  imagePaths: Array<string>;
  destinationDirectory: string;
  store: DesktopStore;
  contentRef: ContentRef;
}

function copyImagesToDirectoryAndReturnNewPaths({
  imagePaths,
  destinationDirectory,
  store,
  contentRef
}: CopyImagesToDirectoryAndReturnNewPathsParameters)
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

interface MakePathsRelativeWithinDirectoryParameters {
  imagePaths: Array<string>;
  directory: string;
}

// For all image paths within the given directory, use relative paths,
// for image paths outside the directory, use absolute paths.
//
function makePathsRelativeWithinDirectory({
  imagePaths,
  directory
}: MakePathsRelativeWithinDirectoryParameters)
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
