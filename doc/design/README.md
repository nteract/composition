# A Design Document for nteract

_Following the lead in [A Design Doc for Design Docs](https://medium.com/@cramforce/design-docs-a-design-doc-a152f4484c6b), this is the beginning of documentation on the software design of nteract._

**Status:** DRAFT

There are multiple facets to our design, from software to intent to the look-and-feel of our applications.

## High Level Vision

**Mission**: to build great experiences for interacting with compute + data

We kicked this mission off originally by creating a desktop application that worked well for students and analysts, especially those that were more keyboard driven. We still have more to do to make that a deeper reality.

As we've expanded our scope to include web applications that assist people with collaborating with each other more easily (commuter) or getting fast feedback ([play](https://play.nteract.io)), so too has our library and application design changed.

## Designing for Maintenance

nteract originally started out with many many repos for each individual module and component we wanted to build. This proved to be extremely painstaking for both us and collaborators when we wanted to publish and upgrade any given dependency that other packages were relying on. Fast forward to now, we now keep both packages and applications managed in a [Monorepo](./monorepo).

`packages/` includes all libraries and components (that aren't app specific)
`applications/` includes the desktop app, the jupyter extension, play, and commuter

## Frontend Architecture

### Central Store

Much of the complexity in a frontend application is handling asynchronous code and events. One way that people have been managing this is with Redux, which forces several principles:

* Central state tree, encapsulated in a store
* The next state is based on an event (action) and the previous state (called a reducer)
* All events go through the same dispatch function

#### Managing Asynchronous Resources

To manage external asynchronous APIs (websockets, REST APIs, TCP sockets, etc.), we use [redux-observable](https://redux-observable.js.org/) and by extension [RxJS](http://github.com/ReactiveX/RxJS). The core primitive we use is an `epic` which has the signature

```
(action$, state$) => action$
```

Given a stream of actions and state, we compute new actions for the central store to consume. Anything that passes through the central dispatch also passes through the `action$`.

The way in which we approach [building epics is in its own separate document](./epics).

### Immutable state

Each state is an immutable object. We've chosen to use immutable data structures for these reasons:

* Minimizes the need to copy or cache data
* Comparison between immutable objects is fast
* Enforces strict contracts between functions (keep them pure, no side effects on state)

We've chosen to use [Immutable.JS](http://facebook.github.io/immutable-js/docs/#/) for our immutable data structures.

### The Core State

This document attempts to specify the goal for an nteract core package that can
provide generic/core state management to all notebook-y applications. Right now
this is focused on these apps:

* `ref` - an internal _reference_ to an entity upon _recognition_, e.g. kernels, hosts, kernelspec collections, etc.
* `id` - likely an external identifier, e.g. with /api/kernels/9092, 9092 is the id

We use the term _recognition_ over _creation_ because we want to have a way to
reference an entity _before_ we get a response from some api. A good example is
having a _ref_ for an active kernel before the kernel has been launched with a
jupyter notebook server. Since there will be a proliferation of id-strings, the
internal ones are called `ref`s and they are only meant for use inside the
application--i.e., they have no meaning externally. The external id-string that
will typically be found is called `id`.

#### Flattened Structure, Database Like Feeling

Stemming from the Redux docs'
[Normalizing State Shape](https://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html),
we setup our application to be collections of entries built in a relational
fashion. We have been doing something similar with `cellMap` (map of cell id to cell)
and `cellOrder` (list of cell ids). This takes it to the next level.

At a high level,

```javascript
type core = {
  // The core state is meant to be document-centric. So, we basically use the
  // currently selected document to set the context for the rest of the app.
  // This model may need to change when we have things like split panes and
  // support objects in core that are not really considered *documents*.
  selectedContentRef: Ref

  // These are the actual data that we get back from
  //   * API Calls
  //   * User input
  //   * Kernel output
  entities: {
    // Each host implementation has a set of kernels which may be activated
    // The way to run the kernel, the "spec", is called a kernelspec
    kernelspecs: {
      byRef: {
        [ref: Ref]: {
          defaultKernelName: string,
          hostRef: Ref,
          byName: {
            [name: string]: {
              argv: Array<string>,
              displayName: string,
              env: Object,
              language: string,
              interruptMode: string,
              resources: Object
            }
          },
        }
      },
      refs: List<KernelspecsRef>
    },

    hosts: {
      // On desktop we have the one built-in local host that connects to
      // zeromq directly. On jupyterhub backed apps, you should be able to switch to
      // different hosts.
      byRef: {
        [ref: Ref]: {
          id: string,
          type: ("local" | "jupyter"),
          token: string,
          serverUrl: string,
          crossDomain: boolean
        }
      }
      refs: Array<Ref>
    },

    // A notebook may have one active kernel (but we allow multiple to allow smooth
    // transitions between switching kernels). This also allows us to have multiple kernels
    // on the page if we ever expand scope to allow it.
    kernels: {
      byRef: {
        [ref: Ref]: {
          type: ("local" | "jupyter"), // same as server, literal, unchanging
          hostRef: HostRef,
          name: string,
          lastActivity: Date,
          channels: rxjs$Subject,
          status: string,
          id: Id, // jupyter only
          spawn: ChildProcess, // local only
          connectionFile: string, // local only
          cwd: string, // current working directory, absolute on local, relative to server on jupyter
        }
      }
    },

    sessions: {
      byRef: {
        [ref: Ref]: {
          id: Id,
          name: string, // This is just a display name.
          type: string, // TODO: this should be an enum.
          kernelRef: Ref
        }
      },
      refs: Array<Ref>
    },

    contents: {
      byRef: {
        [ref: Ref]: {
          type: "directory" | "notebook" | "file",
          mimetype: ?string, // file-type only.
          path: string,
          name: string,
          created: Date,
          lastSaved: Date,
          modified: boolean,
          writable: bool,
          format: null | "json" | "text" | "base64", // "json" for dir / nb
          // The model is a little confusing. Think of it as the in-memory, app
          // version of the content string that you get back from the contents
          // api. So, for a plain file, which we don't necessarily know how to
          // handle, the model will just be a string still. However, for a
          // notebook, we basically flesh out all the references to cells in
          // here.
          model: ?Object, // null | DirectoryModel | NotebookModel | FileModel

          // The sessionRef is nullable here because we don't necessarily need
          // the session to be running to display the document. This allows us
          // to render a document and start up a session in parallel.
          sessionRef: ?SessionRef
        }
      }
    },
    notifications: {
      byRef: {
        [ref: Ref]: {
          message: string,
          // TODO: Figure out our structure here
        },
      refs: Array<Ref>
      }
    }
  }
}
```

### React

We've chosen React as our core library for building and sharing components. It's declarative, easy to use, [highly used](http://www.npmtrends.com/@angular/core-vs-angular-vs-react-vs-vue-vs-@webcomponents/webcomponentsjs).

TODO: Fill this in 😊
