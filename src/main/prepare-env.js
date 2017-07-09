import shellEnv from "shell-env";

import { Observable } from "rxjs/Observable";
import "rxjs/add/observable/fromPromise";

import "rxjs/add/operator/first";
import "rxjs/add/operator/do";
import "rxjs/add/operator/publishReplay";

const env$ = Observable.fromPromise(shellEnv())
  .first()
  .do(env => {
    Object.assign(process.env, env);
  })
  .publishReplay(1);

env$.connect();

export default env$;
