import { actions } from "@nteract/core";
import { selectors } from "@nteract/core";
import { ContentRef } from "@nteract/core";
import { sendNotification } from "@nteract/mythic-notifications";
import { DesktopStore } from "./store";
import * as path from "path";
import * as fs from 'fs';
import { ImmutableCell, emptyMarkdownCell } from "@nteract/commutable";

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

  const notebookPath = selectors.filepath(store.getState(), {contentRef: contentRef});
  const notebookDirectory = (notebookPath) ? path.dirname(notebookPath) : null;

  if (copyImagesToNotebookDirectory || linkImagesAndKeepAtOriginalPath) {
    if (notebookDirectory) {
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
    }

    createMarkdownCellWithImages({
      imageSources: imagePaths,
      store: store,
      contentRef: contentRef
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
    actions.createCellBelow({ // FIXME: I would like to insert the cell above, but `createCellBelow` appears to ignore the `source` argument.
      cellType: "markdown",
      contentRef: contentRef,
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
