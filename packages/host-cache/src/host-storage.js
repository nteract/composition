// @flow

import { binder } from "rx-binder";
import { kernels } from "rx-jupyter";

import { tap, map, catchError, filter } from "rxjs/operators";
import { of } from "rxjs/observable/of";

export opaque type BinderKey = string;

type BinderOptions = {
  repo: string,
  ref?: string,
  binderURL?: string
};

export type ServerConfig = {
  endpoint: string,
  token: string,
  // Assume always cross domain
  crossDomain: true
};

export const PROVISIONING = "PROVISIONING";
type IsItUpHost = {
  type: "PROVISIONING"
};

export const UP = "HOST_UP";
type UpHost = {
  type: "HOST_UP",
  config: ServerConfig
};

function makeHost({
  endpoint,
  token
}: {
  endpoint: string,
  token: string
}): UpHost {
  return {
    type: UP,
    config: {
      crossDomain: true,
      endpoint,
      token
    }
  };
}

type HostRecord = UpHost | IsItUpHost;

class LocalForage<K: string, V> {
  set(key: K, value: V) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  get(key: K, default_?: ?V = null): ?V {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(default_));
  }
}

const prefix = "@BinderKey@";

const mybinderURL = "https://mybinder.org";

function sleep(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export class LocalHostStorage {
  localForage: LocalForage<BinderKey, HostRecord>;

  constructor() {
    this.localForage = new LocalForage();
    window.addEventListener("storage", this.handleStorageEvent);
  }

  // Developer has to call this to cleanup :(
  close() {
    window.removeEventListener("storage", this.handleStorageEvent);
  }

  // TODO: Not yet implemented
  handleStorageEvent(event: {
    key: string,
    oldValue: string,
    newValue: string
  }) {
    const { key, newValue } = event;

    // It must be our local storage data if it has our prefix
    if (event.key.startsWith(prefix)) {
      console.warn(
        "Handling storage updates is not implemented. It would be super fantastic to let subscribers know about changes."
      );

      // Attempt to extract the binder options
      // We'll emit
      const binderOpts = JSON.parse(key.slice(prefix.length));
      console.log(binderOpts);
      console.log(newValue);
    }
  }

  createKey({
    repo = "jupyter/notebook",
    ref = "master",
    binderURL = mybinderURL
  }: BinderOptions): BinderKey {
    return `${prefix}${JSON.stringify({ repo, ref, binderURL })}`;
  }

  async checkUp(host: HostRecord): Promise<boolean> {
    if (host.type === PROVISIONING) {
      return false;
    }

    return kernels
      .list(host.config)
      .pipe(
        map(xhr => {
          console.log(xhr);
          return true;
        }),
        catchError(err => {
          console.error("error listing kernels on server", err);
          return of(false);
        })
      )
      .toPromise();
  }

  async allocate(binderOpts: BinderOptions): Promise<ServerConfig> {
    let original = this.get(binderOpts);

    if (!original || !original.config) {
      original = { type: PROVISIONING };
      this.set(binderOpts, original);
      // Fall through, don't return as we allocate below
    } else if (original.type === UP) {
      // TODO: Check if really up
      const isUp = await this.checkUp(original);
      if (isUp) {
        return original.config;
      }
      // If it wasn't up, launch a new one
    } else if (original.type === PROVISIONING) {
      // TODO: Do we wait on a prior to eventually come up or kick off a new one
      // Could do coordination here by recording timestamps in the GETTING_UP type

      while (!original && original.type !== UP) {
        await sleep(1000);
        original = this.get(binderOpts);
        if (original && original.type === UP) {
          return original.config;
        }
      }
    }

    const host = await binder(binderOpts)
      .pipe(
        tap(x => {
          // Log binder messages to the console for debuggability
          console.log("%c BINDER MESSAGE", "color: rgb(87, 154, 202)");
          console.log(x);
        }),
        filter(msg => msg.phase === "ready"),
        map(msg => makeHost({ endpoint: msg.url, token: msg.token }))
      )
      .toPromise();

    if (
      !host.config ||
      !host.config.endpoint ||
      !host.config.token ||
      !host.config.crossDomain
    ) {
      throw new Error(`Bad host created: ${JSON.stringify(host, null, 2)}`);
    }

    this.set(binderOpts, host);

    return host.config;
  }

  get(opts: BinderOptions): ?HostRecord {
    const key = this.createKey(opts);
    return this.localForage.get(key);
  }

  set(opts: BinderOptions, host: HostRecord) {
    const key = this.createKey(opts);
    this.localForage.set(key, host);
  }
}
