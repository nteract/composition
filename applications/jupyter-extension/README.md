# nteract on jupyter

nteract as an extension to the jupyter notebook server

## Installation

```
pip install nteract_on_jupyter
jupyter serverextension enable nteract_on_jupyter
```

## Development

Make sure you've done the `npm install` at the base of the nteract/nteract monorepo, then within this package:

```
pip install -e .
jupyter serverextension enable nteract_on_jupyter
```

Now, `cd` into `nteract_on_jupyter` and run:

```
npm run build:watch
```

## ROADMAP(ish)

* In development mode, have a clean webpack build locally
* In production, be able to toggle an endpoint to get the bundle from
