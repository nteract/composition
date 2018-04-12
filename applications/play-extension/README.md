# nteract on jupyter

nteract as an extension to the jupyter notebook server

## Installation

```
pip install play_on_jupyter
jupyter serverextension enable play_on_jupyter
```

## Development

All code snippets assume you're starting from the root of the nteract/nteract monorepo.

### 1. Install Monorepo (JS)

```
npm install
```

### 2. Install/enable jupyter-extension (Python)

Install the python package locally from here.

```
cd applications/jupyter-extension
pip install -e .
jupyter serverextension enable play_on_jupyter
```

### 3. Run notebook server (Python)

In one terminal, start up a notebook server.

```
cd applications/jupyter-extension
jupyter notebook
```

### 4. Run jupyter-extension (JS)

```
npm run app:play-extension
```

### 5. Visit a notebook page (Browser)

The default port is 8888, but that may be different for you.

http://localhost:8888/play/example.ipynb

### 6. Refresh browser page when you make changes

There isn't currently a trigger to refresh the browser when making changes, so
you have to manually do this when you update files in play_on_jupyter.
