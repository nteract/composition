# nteract records

Philosophy: create very flat records for core data types used in nteract, to be used across applications.

> Wait, what about commutable?

Commutable has been _awesome_ and should be borrowed from to build this up. However, commutable relied heavily on
Immutable.Map()'s. These lose all the benefits of flow typing, defaults, and direct property access that records have.

> Could we add these directly to commutable?

I'd love to. However, I didn't want to make a refactor that required refactoring all the apps that use them, as well as any external usage (Hydrogen included) that would have to adapt to new interfaces.

> Where should I start in helping with this effort?

Look over how `src/outputs/stream.js` and `src/outputs/index.js` sets up the base types. Implement the other output types in a similar fashion.

- [x] stream
- [ ] display_data
- [ ] execute_result
- [ ] error

## References

- [nbformat v4](https://raw.githubusercontent.com/jupyter/nbformat/master/nbformat/v4/nbformat.v4.schema.json)
- [Jupyter Message Format](http://jupyter-client.readthedocs.io/en/stable/messaging.html#general-message-format)
- [commutable's implementation](../commutable/src/v4.js) -- `packages/commutable/src/v4.js`

## Testing

Run

```
npm t -- records --watch
```

to run the tests locally while watching to all changes in the records setup.

## Types!

If your editor isn't already helping you with this, use

```
npm run flow
```

## Documentation

To help figure out where we _might_ end up with documentation for nteract libraries (as opposed to components, which use react-docgen / react-styleguidist ), use [documentation.js](https://github.com/documentationjs/documentation) to run docs for this library.

```
npm install -g documentation
documentation serve --watch packages/records/src
```

I have a feeling we'll end up having to do some custom things with our monorepo to make this more palatable.
