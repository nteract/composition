/* @flow strict */
import shellEnv from "shell-env";

import { from } from "rxjs";
import { first, tap, publishReplay } from "rxjs/operators";

// Bring in the current user's environment variables from running a shell session so that
// launchctl on the mac and the windows process manager propagate the proper values for the
// user
//
// TODO: This should be cased off for when the user is already in a proper shell session (possibly launched
//       from the nteract CLI
const env$ = from(shellEnv()).pipe(
  first(),
  tap(env => {
    // no need to change the env if started from the terminal on Mac
    if (
      process.platform !== "darwin" ||
      (process.env != null && process.env.TERM == null)
    ) {
      Object.assign(process.env, env);
    }
  }),
  publishReplay(1)
);

env$.connect();

export default env$;
