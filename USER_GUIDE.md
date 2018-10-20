# nteract

nteract is a literate coding environment that supports Python, R, JavaScript and other [Jupyter kernels](https://github.com/ipython/ipython/wiki/IPython-kernels-for-other-languages). It wraps up the best of the web based Jupyter notebook and embeds it as a desktop application. Now, you can open notebooks natively on your system. Double-click on a .ipynb file to open and begin using the notebook. It Just Works™

## Installation

To get started, download the latest [release](https://github.com/nteract/nteract/releases) for your OS.

## Authoring Notebook Files (.ipynb)

### Create a New Notebook

A new notebook can be created by accessing the menu,

```
  File
    ⮑  New
         ⮑  <Language Kernel> (e.g. Python 3, R, Julia etc.)
```

### Opening a Notebook

There are several ways to open a notebook in nteract:

* From the menu:

```
  File
    ⮑  Open
```

Keyboard shortcut `⌘ O` on macOS and `Ctrl O` on Windows/Linux

* Double-click a notebook file :tada: **_Note: currently this works only in macOS_**

* From the Command Line (assuming you have shell commands installed), run `nteract notebook.ipynb`:

### Saving a Notebook

A notebook can be saved in the following ways:

* _Save_:
    ```
      File
        ⮑  Save
    ```

    Keyboard shortcut: `⌘ S` on macOS and `Ctrl S` on Windows/Linux

* _Save As_:
  ```
    File
      ⮑  Save As
  ```

  Keyboard shortcut: `Shift ⌘ S` on macOS and `Shift Ctrl S` on Windows/Linux

## Notebook Cells

### Adding a Cell

* Code Cells:
    A code cell can be created by accessing the menu,

    ```
      Edit
        ⮑  Insert Code Cell Above
        ⮑  Insert Code Cell Below
    ```

    A code cell can also be created by clicking <> on the cell hover menu.

* Text Cells
    A text cell can be created by accessing the menu,

    ```
      Edit
        ⮑  New Text Cell
    ```

    A text cell can also be created by clicking **M** on the cell hover menu.

    Text cells support the [commonmark spec](http://commonmark.org/) along with
    inline mathematics, block mathematics, and tables.

### Running a Cell

A cell can be run from the keyboard by pressing `Shift ⏎` or by selecting the ▶︎ button from the cell toolbar.

**_N.B. To run all cells at once, access the menu:_**

```
  Cell
    ⮑  Run All
```

### Moving a Cell

A cell can be moved anywhere in the notebook by clicking and dragging to desired position.

### Cell Shortcuts

Command | macOS | Windows/Linux
---|---|---
Insert Cell Above | `Shift ⌘ A` | `Shift Ctrl A`
Insert Cell Below | `Shift ⌘ B` | `Shift Ctrl B`
Delete Cell | `Shift ⌘ D` | `Shift Ctrl D`
Change Cell Type to Markdown | `Shift ⌘ M` | `Shift Ctrl M`
Change Cell Type to Code | `Shift ⌘ Y` | `Shift Ctrl Y`
Copy Cell | `Shift ⌘ C` | `Shift Ctrl C`
Paste Cell | `Shift ⌘ V` | `Shift Ctrl V`
Cut Cell | `Shift ⌘ X` | `Shift Ctrl X`

## General Shortcuts

* Autocomplete Suggestions: `Ctrl Space`
* Documentation/Tips Expansion: `Ctrl Period(.)` (on Windows/Linux) or `⌘ Period(.)` (on MacOS)
