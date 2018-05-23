# nteract on jupyter

nteract as an extension to the jupyter notebook server

## Installation

Install `nteract_on_jupyter` with `pip`:

```
pip install nteract_on_jupyter
```

## Usage

Run

and you're running nteract on jupyter!

You can run `jupyter nteract` just like you would run `jupyter notebook`.

## Development

All code snippets assume you're starting from the root of the nteract/nteract monorepo.

### 1. Install the `nteract` monorepo (JS)

At the base directory of the `nteract` repo install the monorepo's dependencies:

```
npm install
```

You will also want to install `lerna` globally so you can run `lerna` from anywhere in the nteract repo. The rest of the instructions assume you have done this.

```
npm install -g lerna
```

For more details see the instructions in the [base README](../../README.md#set-the-monorepo-up-in-dev-mode)

### 2. Install/enable `nteract_on_jupyter` (Python)

Install the python package locally from the `nteract/applications/jupyter-extension/` directory (you should see a `setup.py` here).

```
cd applications/jupyter-extension
pip install -e .
jupyter serverextension enable nteract_on_jupyter
```

### 3. Build assets and run the Jupyter server

We have two more steps:

1. build the javascript and html assets with `webpack`
2. run the Jupyter server

In all the ways we describe below, the jupyter server may start before the assets are done building. That means that the first page you'll land on will be blank. **Don't worry**. All you need to do is to wait until the assets have been built and manually refresh the page.

Look on your console for a log message like

```
nteract-on-jupyter: [0] ℹ ｢wdm｣: Compiled successfully.
```

to indicate that the assets are done building.

We recommend running a webpack server for "hot reloading" the javascript and html assets. This will recompile the javascript so that any changes that you make locally will be reflected on the website without you needing to refresh the page or restart the server.

Unfortunately, any changes you make on the Python side will require that you restart the server for them to take effect.

#### 3.1. All-in-one w/ hot reloading

You can run both with a single command if you run

```
jupyter nteract --dev
```

This will run two servers, a webpack server for live reloading javascript and html assets and Jupyter server.

Once the assets have been built, you won't need to refresh the page, but you may need to manually refresh the page if it loads before the assets are built.


#### 3.2 Separate commands w/ hot reloading 

First we need to run the webpack server to live reload javascript and html assets. Anywhere in the nteract repository, run

```
lerna run hot --scope nteract-on-jupyter --stream
```

In another terminal, go to the directory that you want to run notebooks from and run

```
jupyter nteract --NteractConfig.asset_url="http://localhost:8080/"
```

The ``--NteractConfig.asset_url`` flag tells the Jupyter server where the webpack server will be serving the assets.

If you wait until the assets are built, you won't need to manually reload the Jupyter webpage. If you start the server before the assets have been built, you will need to manually refresh the page once before live reloading

#### 3.2 Separate commands w/o hot reloading

If you don't want to run the webpack server, you will still need to build the assets once (to start). You will need rebuild assets and refresh the page in order for changes to take effect.  

To create an optimized build that will run faster in the browser but will take more time to complete, (in the `nteract` repo) run:

```
lerna run build --scope nteract-on-jupyter --stream
```

If you want the build to go as quickly as possible and don't want optimized javascript, (in the `nteract` repo) you can run:

```
lerna run build:asap --scope nteract-on-jupyter --stream
```

Then you will want to use the `jupyter nteract` command.

**Note** Do not use the `--dev` flag, or your assets will never load, since there is no webpack server to serve those assets.

### Configuration for deploying nteract_on_jupyter

When you launch the Jupyter notebook server, there is a new `NteractConfig` that allows setting a number of things. In particular it allows setting:

* `asset_url` - Where to load nteract js from
* `ga_code` - Google Analytics code to track usage


Example:

```
jupyter nteract --NteractConfig.asset_url="http://localhost:8080/" --NteractConfig.ga_code="GA-SOME-NUMBERS"
```
