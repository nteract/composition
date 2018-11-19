import { binder } from "rx-binder";
import { kernels } from "rx-jupyter";
import { of } from "rxjs";
import { tap, map, catchError, filter } from "rxjs/operators";

// NOTE: The old flow type for BinderKey was an opaque type so that you couldn't use _any_ string,
// it had to use our special Binder key type from this module.
//
// export opaque type BinderKey = string;

// For TypeScript we can get the same behavior with the unknown type
type BinderKey = string;

type BinderOptions = {
  repo: string;
  ref?: string;
  binderURL?: string;
};

export type ServerConfig = {
  endpoint: string;
  token: string;
  // Assume always cross domain
  crossDomain: true;
};

export const PROVISIONING = "PROVISIONING";
type IsItUpHost = {
  type: "PROVISIONING";
};

export const UP = "HOST_UP";
type UpHost = {
  type: "HOST_UP";
  config: ServerConfig;
};

export const NOHOST = "NOHOST";
type NoHost = {
  type: "NOHOST";
};

function makeHost({
  endpoint,
  token
}: {
  endpoint: string;
  token: string;
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

type HostRecord = UpHost | IsItUpHost | NoHost;

const prefix = "@BinderKey@";

const mybinderURL = "https://mybinder.org";

function sleep(duration: number) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

export class LocalHostStorage {
  constructor() {
    this.handleStorageEvent = this.handleStorageEvent.bind(this);

    window.addEventListener("storage", this.handleStorageEvent);
  }

  // Developer has to call this to cleanup :(
  close() {
    window.removeEventListener("storage", this.handleStorageEvent);
  }

  // TODO: Not yet implemented
  handleStorageEvent(event: StorageEvent) {
    const { key, newValue } = event;

    if (typeof key !== "string") {
      return;
    }

    // It must be our local storage data if it has our prefix
    if (key.startsWith(prefix)) {
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
    if (host.type !== UP) {
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

    switch (original.type) {
      case UP:
        // cache hit with an UP server, check if it's really up
        const isUp = await this.checkUp(original);
        if (isUp) {
          // It is so we can plow forward
          return original.config;
        }
        // Otherwise we need to make a new server
        break;
      case NOHOST:
        // Definitely need to launch
        break;
      case PROVISIONING:
        // Wait for the provisioning server to get up
        while (original.type !== UP) {
          await sleep(1000);
          // NOTE: Could do coordination here by recording timestamps in the PROVISIONING type
          // At the very least there should come a point we time out at
          original = this.get(binderOpts);
        }

        if (original && original.type === UP) {
          return original.config;
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

  get(opts: BinderOptions): HostRecord {
    const default_ = {
      type: "NOHOST"
    };
    const key = this.createKey(opts);

    return JSON.parse(localStorage.getItem(key) || JSON.stringify(default_));
  }

  set(opts: BinderOptions, host: HostRecord) {
    const key = this.createKey(opts);
    localStorage.setItem(key, JSON.stringify(host));
  }
}
