This document attempts to specify the goal for an nteract core package that can
provide generic/core state management to all notebook-y applications. Right now
this is focused on these apps:

* Desktop
* nteract on jupyter
* `@nteract/play`
* notebook on next

This describes a pretty far and wide overhaul of our core logic, including the
notebook itself.

## Core concepts

* `ref` - an internal _reference_ to an entity upon _recognition_, e.g. kernels, hosts, kernelspec collections, etc.
* `id` - likely an external identifier, e.g. with /api/kernels/9092, 9092 is the id

We use the term _recognition_ over _creation_ because we want to have a way to
reference an entity _before_ we get a response from some api. A good example is
having a _ref_ for an active kernel before the kernel has been launched with a
jupyter notebook server. Since there will be a proliferation of id-strings, the
internal ones are called _ref_s and they are only meant for use inside the
application--i.e., they have no meaning externally. The external id-string that
will typically be found is called `id`.

---

Side note -- In flow, this would be typed as:

```js
opaque type Id = string;
opaque type Ref = string;
```

Which can also help us enforce we are using the right ids and refs amongst disparate entities:

```js
opaque type KernelId = Id;
```

---

## Flattened Structure, Database Like Feeling

Stemming from the Redux docs'
[Normalizing State Shape](https://redux.js.org/docs/recipes/reducers/NormalizingStateShape.html),
we setup our application to be collections of entries built in a relational
fashion. We were doing something similar with `cellMap` (map of cell id to cell)
and `cellOrder` (list of cell ids). We're taking it to the next level here.

## The Proposed Structure

```flow js
opaque type Id = string;
opaque type Ref = string;

type core = {

  // The core state is meant to be document-centric. So, we basically use the
  // currently selected document to set the context for the rest of the app.
  // This model may need to change when twe have things like split panes and
  // support objects in core that are not really considered *documents*.
  selectedContentRef: Ref

  // The piece of state that allows the ui to show loading/error indicators.
  // This is split apart from the entities definitions because the two parts of
  // state serve very different purposes.
  communication: {
    preferences: {
      loading: boolean,
      saving: boolean,
      error: ?Object
    },
    
    // TODO: what's this doing again?
    hostSpec: {
      loading: boolean,
      error: ?Object
    },
    hosts: {
      byRef: {
        [ref: Ref]: {
          loading: boolean,
          error: ?Object
        }
      }
    },
    sessions: {
      byRef: {
        [ref: Ref]: {
          loading: boolean,
          error: ?Object
        }
      }
    },
    kernels: {
      byRef: {
        [ref: Ref]: {
          loading: boolean,
          error: ?Object
        }
      }
    },
    kernelspecs: {
      byRef: {
        [ref: Ref]: {
          loading: boolean,
          error: ?Object
        }
      }
    },
    contents: {
      byRef: {
        [ref: Ref]: {
          loading: boolean,
          saving: boolean,
          error: ?Object
        }
      }
    }
  },

  // These are the actual data that we get back from
  //   * API Calls
  //   * User input
  //   * Kernel output
  entities: {    
    preferences: {
      lastSaved: Date,
      theme: "light" | "dark"
    },
    outputs: {
      byRef: {
        [ref: Ref]: {
          data: Object,
          metadata: Object,
          transient: Object,
          type: string // TODO: should be enummed
        }
      },

      // For capturing the display ID mappings (aliases)
      displayIdToOutputRefs: {
        [id: Id]: Array<Ref>
      }
    },

    cells: {
      byRef: {
        [ref: Ref]: {
          type: "code" | "markdown" | "raw",
          source: string,
          metadata: Object,

          // NOTE: the following fields are only on code cells
          outputRefs: Array<Ref>,
          executionState: "finished" | "executing" | "queued" | "dirty",
          executionCount: ?number,
          lastExecuteMessage: JupyterMessage
        }
      },
      refs: Array<Ref>
    },

    hostSpec: {
      // TODO: is this something that's going to be hard-coded into an app? Or,
      // is it something that we'll indeed need to request from some api? See
      // related hostSpec in the `communication` state hunk.

      // Else, should this be sorta top-level alongside the `notebook` hunk
      // of state?
    },


    // Each host implementation has a set of kernels which may be activated.
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
      // On desktop we'll have the one built-in local host that connects to
      // zeromq directly. On jupyterhub backed apps, you'll be able to switch to
      // different hosts.
      byRef: {
        [ref: Ref]: {
          id: string,
          type: ("local" | "jupyter"),
          kernelIds: Array<Id>, // the list of *active* kernels for a host.
          token: string,
          serverUrl: string,
          crossDomain: boolean,
          
          // TODO: I think we're attempting to split apart host and document.
          //   1. what was the purpose of this?
          //   2. can it be provided in some other way?
          rootContentRef: Ref,
          messages: Array<string> // binder only
        }
      }
      refs: Array<Ref>
    },

    // A host may have one active kernel (but we allow multiple to allow smooth
    // transitions between switching kernels).
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
