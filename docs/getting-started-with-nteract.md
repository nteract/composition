# Getting started with nteract

Interactive notebooks are a great tool for data scientists, hobbyists, and programmers looking to document their code, experiment with models, generate visualizations, and prototype code. The Jupyter notebook format is one of the most popular interactive notebook formats and is supported by the nteract ecosystem. This user guide will help you get set up with the basics of the nteract notebook app.

### Setting up the nteract desktop application

The fastest way to get started with nteract is to download the desktop application to your machine. You can download the installer for your operating system on the [nteract homepage](https://nteract.io/desktop). Once you've downloaded and installed nteract, you can launch the program from the install directory. Note that this guide assumes you are using the nteract desktop application.

### Setting up using Snap

To install nteract desktop application using [Snapcraft](https://snapcraft.io), which should work with all the major Linux distros. If you are new to Snaps, you can learn more about it from [here](https://snapcraft.io/docs/getting-started), and download it for your distro from [here](https://snapcraft.io/docs/installing-snapd).

Once you have installed Snap, you can install `nteract` by:

```bash
$ sudo snap install nteract --edge
```

[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-white.svg)](https://snapcraft.io/nteract)

### Setting up the nteract web application

In addition to using nteract on the desktop, you can also use nteract within your web browser. To do so, you'll need to install the `nteract_on_jupyter` Python package using the following command.

```bash
$ pip install nteract_on_jupyter
```

Then, run Jupyter with the nteract extension installed using the following command.

```bash
$ jupyter nteract
```

Your default browser should open to the nteract web interface where you can open, create, and edit notebooks.  If you want to run the examples mentioned later, you will need to install them separately:  navigate to the directory (for example, in a Command Prompt window) and run the following

```
git clone https://github.com/nteract/examples
cd examples
```

### How to create a new notebook

The nteract app opens to a new, empty notebook by default. If you're comfortable with the command line, you can use the `nteract` command to create or open a notebook from the command line.

```
$ nteract --kernel ${insert kernel name here}
```

Alternatively, you can open a notebook by either double clicking on the notebook file anywhere on your machine or selecting File > Open from the nteract menubar.

### Writing code in interactive notebooks

Now that we've got the nteract application installed, we can create our first notebook. New notebooks in nteract launch with an empty code cell. You can use this code cell to write code that can be executed. Code must be written in the language of the kernel that you are connected to in order to execute. For example, the example below shows Python 3 code executing within an interactive notebook.

![Executing a Python code cell within a notebook](https://cldup.com/6RzV6bYyKa.gif)

### Writing documentation in interactive notebooks

In addition to code cells, you can also create textual cells that can provide documentation and narrative for your code. These textual cells are formatted using the [Markdown formatting language](https://daringfireball.net/projects/markdown/). There are two ways to create a new Markdown cell in the nteract application. You can hover over the space after a cell and click the Markdown icon (it resembles an M with a down arrow next to it). Alternatively, you can select Edit > Insert Text Cell Below from the menubar.

Once the new Markdown cell has been created, you can double click to edit the Markdown cell and write your formatted text content.

![Creating and editing a new Markdown cell in nteract Desktop](https://cldup.com/a2nH48tNPm.gif)

### Organizing cells within a notebook

Like any written document, the organization of the content matters. nteract allows you to rearrange the cells within a notebook using drag-and-drop. You can click on the left-hand side of a cell and drag it to the desired position.

![Using drag and drop to rearrange cells in a notebook](https://cldup.com/HgCrZl9zXW.gif)

### Speed things up with keyboard shortcuts

As you use notebooks more and more, you'll probably want to start taking advantage of some of the keyboard shortcuts that are provided within nteract. You can view [a full list of these keyboard shortcuts](https://docs.nteract.io/kbd-shortcuts/), and how they compare to those provided within the JupyterLab and classic Jupyter front ends to get started with these keyboard shortcuts.

We also have a list specific for [cell keyboard shortcuts](https://github.com/nteract/nteract/blob/master/USER_GUIDE.md#cell-shortcuts).

### Rendering rich media in interactive notebooks

One of the most powerful features of notebooks is the ability to render rich media, like images and maps, within the notebook. Let's try this out by exploring one of the example notebooks bundled with nteract. First, we'll need to install a dependency Navigate to File > Open Example Notebook > python > Gallery of Plotly Plots.

![A screenshot of a Plotly visualization rendered within nteract](https://cldup.com/KUFuj4P5_L.png)

### Creating visualizations with the nteract Data Explorer

The nteract Data Explorer is a built-in tool for visualizing pandas DataFrames within a notebook. To see an example of the Data Explorer in action, navigate to File > Open Example Notebook > python > Try the Data Explorer. By default, the Data Explorer renders the data in a rich, paginated table.

![Data rendered in a rich table within the nteract Data Explorer](https://cldup.com/-0UimYM3wH.png)

Using the buttons on the right of the Data Explorer, you can switch to different views of the same data. For example, here's the data from the table categorized and filtered into a bar plot.

![The nteract Data Explorer rendering a customized bar plot](https://cldup.com/54aF-NFjS3.png)

### Go forth and explore!

At this point, you're hopefully excited about all the notebooks you can create using nteract. You can view some of the example notebooks to view the possibilities that are available to you with nteract. You can open the example notebooks by selecting File > Open Example Notebook from the nteract menubar.
