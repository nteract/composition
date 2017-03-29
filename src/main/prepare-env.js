import shellEnv from "shell-env";
import Rx from "rxjs/Rx";

const env$ = Rx.Observable
  .fromPromise(shellEnv())
  .first()
  .do(env => {
    Object.assign(process.env, env);
  })
  .publishReplay(1);

env$.connect();

export default env$;
