// @flow

import type {
  KernelspecRecord,
  KernelspecProps,
  AppState,
  JupyterHostRecord
} from "@nteract/core";

import { selectors, actions } from "@nteract/core";

// TODO: Make a proper epic
import { contents, sessions } from "rx-jupyter";

import { first, map, mergeMap } from "rxjs/operators";
import { forkJoin } from "rxjs/observable/forkJoin";

const urljoin = require("url-join");

export function openNotebook(
  host: JupyterHostRecord,
  ks: KernelspecRecord | KernelspecProps,
  props: { appVersion: string, baseDir: string, appPath: string }
) {
  const serverConfig = selectors.serverConfig(host);

  // The notebook they get to start with
  const notebook = {
    cells: [
      {
        cell_type: "code",
        execution_count: null,
        metadata: {},
        outputs: [],
        source: []
      }
    ],
    metadata: {
      kernelspec: {
        display_name: ks.displayName,
        language: ks.language,
        name: ks.name
      },
      nteract: {
        version: props.appVersion
      }
    },
    nbformat: 4,
    nbformat_minor: 2
  };

  // NOTE: For the sake of expediency, all the logic to launch a new is
  //       happening here instead of an epic
  contents
    // Create UntitledXYZ.ipynb by letting the server do it
    .create(serverConfig, props.baseDir, {
      type: "notebook"
      // NOTE: The contents API appears to ignore the content field for new
      // notebook creation.
      //
      // It would be nice if it could take it. Instead we'll create a new
      // notebook for the user and redirect them after we've put in the
      // content we want.
      //
      // Amusingly, this could be used for more general templates to, as
      // well as introduction notebooks.
    })
    .pipe(
      // We only expect one response, it's ajax and we want this subscription
      // to finish so we don't have to unsubscribe
      first(),
      mergeMap(({ response, status }) => {
        const filepath = response.path;

        const sessionPayload = {
          kernel: {
            id: null,
            name: ks.name
          },
          name: "",
          path: filepath,
          type: "notebook"
        };

        return forkJoin(
          // Get their kernel started up
          sessions.create(serverConfig, sessionPayload),
          // Save the initial notebook document
          contents.save(serverConfig, filepath, {
            type: "notebook",
            content: notebook
          })
        );
      }),
      first(),
      map(([session, content]) => {
        const { response, status } = content;

        const url = urljoin(
          // User path
          props.appPath,
          // nteract edit path
          "/nteract/edit",
          // Actual file
          response.path
        );

        // Always open new notebooks in new windows
        const win = window.open(url, "_blank");

        // If they block pop-ups, then we weren't allowed to open the window
        if (win === null) {
          // TODO: Show a link at the top to let the user open the notebook directly
          window.location = url;
        }
      })
    )
    .subscribe();
}
