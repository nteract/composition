|Feature | Jupyter Lab Default Binding | Notebook Default Binding | nteract Desktop Default Binding | Notes |
|--------|-----------------------------|--------------------------|---------------------------------|-------|
|Auto-complete | Tab | Tab | Ctrl + Space |  |
|Save | Accel+S | S | Ctrl+S |  |
|Save As | Accel+Shift+S |  | Ctrl+Shift+S |  |
|editmenu:redo | Ctrl+Shift+Z |  | Ctrl+Shift+Z |  |
|editmenu:undo | Ctrl+Z |  | Ctrl+Z |  |
|notebook:undo-cell-action | Z | Z |  | This can undo cell-level actions like a cell delete. Existing github issue - https://github.com/nteract/nteract/issues/1038 |
| |  |  |  | nteract seems to lack this type of undo. |
|help:toggle | Ctrl+Shift+H |  |  |  |
| |  |  |  |  |
|notebook:move-cursor-down-1 | ArrowDown |  | ArrowDown |  |
|notebook:move-cursor-down-2 | J | J |  |  |
|notebook:move-cursor-up-1 | ArrowUp |  | ArrowUp |  |
|notebook:move-cursor-up-2 | K | K |  |  |
| |  |  |  |  |
|notebook:run-cell | Ctrl+Enter | Ctrl+Enter | Ctrl+Enter |  |
|notebook:run-cell-and-insert-below | Alt+Enter | Alt+Enter |  | nteract's Ctrl+Enter will do this but only in the last cell otherwise it just does "Run Cell and Select Next". Not sure if this is intentionally trying to improve on Jupyter or an accident. |
|Run Cell and Select Next | Shift+Enter | Shift+Enter | Shift+Enter |  |
|runmenu:run-all |  |  | Alt+R, A |  |
| |  |  |  |  |
|In this section nteract requires multi-keystroke nav through the menus rather than a single shortcut key. In many cases we could add the shortcut key though value feels very marginal. |
|Interrupt Kernel | I, I | I, I | Alt+R, I | Not sure this works w/ Almond |
|Shutdown Kernel |  |  | Alt+R, K | Could add Ctrl+K. But Jupyter doesn't have a default binding here so only makes sense if we're doing the whole menu for consistency. Then we end up eating up a bunch of bindings that might be more useful for other things in the future (TBC, long term, would love to see user/admin-configurable bindings, but we aren't there yet). |
|Restart Kernel | 0, 0 (zero, zero) | 0, 0 (zero, zero) | Alt+R, R | Lab and Notebook prompt user to confirm; they do not instantly restart. Could add Ctrl+R. Currently that does a Chromium page reload; would need to ask Kyle if that's important to any of his dev workflows in the desktop app. |
|Restart Kernel and Clear |  |  | Alt+R, C | Ctrl+C can't be used here (copies text to clipboard); so maybe need this whole section of items to use Ctrl+Shift instead? Again there's no Jupyter binding here. |
|Restart Kernel and Run All |  |  | Alt+R, A | There's no Jupyter default here, only included because my users want one. |
| |  |  |  |  |
|notebook:change-cell-to-code | Y | Y | Ctrl+Shift+Y |  |
|notebook:change-cell-to-markdown | M | M | Ctrl+Shift+M |  |
|notebook:change-cell-to-raw | R | R |  |  |
|notebook:change-to-cell-heading-1 | 1 | 1 |  | This changes the Markdown header level (###) |
|notebook:change-to-cell-heading-2 | 2 | 2 |  |  |
|notebook:change-to-cell-heading-3 | 3 | 3 |  |  |
|notebook:change-to-cell-heading-4 | 4 | 4 |  |  |
|notebook:change-to-cell-heading-5 | 5 | 5 |  |  |
|notebook:change-to-cell-heading-6 | 6 | 6 |  |  |
| |  |  |  |  |
|notebook:copy-cell | C | C | Ctrl+Shift+C | nteract can also drag/drop cells |
|notebook:cut-cell | X | X | Ctrl+Shift+X |  |
|notebook:delete-cell | D, D | D, D | Ctrl+Shift+D |  |
|Paste Cell(s) Above |  | Shift+V |  |  |
|Paste Cell(s) Below | V | V | Ctrl+Shift+V |  |
| |  |  |  |  |
|notebook:enter-command-mode-1 | Escape | Escape |  | nteract lacks "command mode"|
|notebook:enter-command-mode-2 | Ctrl+M |  |  | nteract lacks "command mode" |
|notebook:enter-edit-mode | Enter | Enter |  | nteract lacks "command mode" |
| |  |  |  |  |
|notebook:extend-marked-cells-above-1 | Shift+ArrowUp | Shift+ArrowUp |  | This is for selecting ranges of cells. |
|notebook:extend-marked-cells-above-2 | Shift+K |  |  | This is for selecting ranges of cells. |
|notebook:extend-marked-cells-below-1 | Shift+ArrowDown | Shift+ArrowDown |  | This is for selecting ranges of cells. |
|notebook:extend-marked-cells-below-2 | Shift+J |  |  | This is for selecting ranges of cells. |
| |  |  |  |  |
|notebook:merge-cells | Shift+M | Shift+M |  | nteract used to have this feature, found its UX confusing, and dropped it. Some people interested in bringing it back. |
|notebook:split-cell-at-cursor | Ctrl+Shift+- (minus) | Ctrl+Shift+- (minus) |  |  |
| |  |  |  |  |
|notebook:insert-cell-above | A | A | Ctrl+Shift+A |  |
|notebook:insert-cell-below | B | B | Ctrl+Shift+B |  |
| |  |  |  |  |
|toggle-cell-output-collapsed | MOUSE: Right click cell, enable/disable scrolling | O (letter o) | MOUSE: Cell drop down | I can imagine this becoming a future request for users. I also struggle to tell which mode my cells are in, but maybe it's my nteract dark theme. Would mostly just wait for users to weigh in on importance. |
|toggle-cell-output-scrolled | MOUSE: Right click cell, enable/disable scrolling | Shift+O | MOUSE: Cell drop down |  |
| |  |  |  |  |
|notebook:toggle-all-cell-line-numbers |  | Shift+L | nteract doesn't offer this; doesn't seem that useful to me. | These are line number inside cells. Not to be confused w/ execution counters like `[3]:` |
|notebook:toggle-cell-line-numbers | L | L |  |  |
| |  |  |  |  |
|Select All Cells | Accel A |  |  |  |
| |  |  |  |  |
|scroll-notebook-up |  | Shift+Space |  |  |
|scroll-notebook-down |  | Space |  |  |
|show-keyboard-shortcuts |  | H |  |  |
|