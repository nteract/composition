import NotebookPreview from "@nteract/notebook-preview";
import { emptyNotebook, appendCellToNotebook } from "@nteract/commutable";

import {
  createCodeCell,
  createMarkdownCell
} from "@nteract/commutable/lib/structures";

const notebook = appendCellToNotebook(
  appendCellToNotebook(emptyNotebook, createCodeCell().set("source", "test")),
  createMarkdownCell().set("source", "# Markdown cells\nare **pretty cool**")
);

export default () => <NotebookPreview notebook={notebook} />;
