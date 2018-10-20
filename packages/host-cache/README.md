# Host Cache

> Come one, come all. Step right up and get a host!

This package allows you to get and store a host configuration from binder, "caching" it via [LocalStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage).

## Host Component

NOTE: Requires React 16.3

```jsx
import { Host } from "@mybinder/host-cache";

() => (
  <Host repo="nteract/vdom">
    <h1>Let's get a host</h1>
    <p>
      Wherever we need it deep within this compoent tree, we can use
      Host.Consumer
    </p>
    <Host.Consumer>
      {host => (
        <pre>
          Endpoint: {host.endpoint}
          Token: {host.token}
        </pre>
      )}
    </Host.Consumer>
  </Host>
);
```

## LocalHostStorage Class

```js
import { LocalHostStorage } from "@mybinder/host-cache";

const lhs = new LocalHostStorage();

// Allocate returns a Promise<HostConfig>, ensuring the host is up too
const host = await lhs.allocate({ repo: "nteract/vdom" });

console.log("Endpoint: ", host.endpoint);
console.log("Token: ", host.token);

// If you call allocate with the same params and the host is still active, you'll get the same host
const host2 = await lhs.allocate({ repo: "nteract/vdom" });

console.log(
  "Same?",
  host.endpoint === host2.endpoint && host.token === host2.token
);

// You're not limited to mybinder.org. If you have your own binderhub deployed, use it!

const ownHost = await lhs.allocate({
  repo: "nteract/vdom",
  ref: "master",
  binderURL: "https://example.com"
})
```
