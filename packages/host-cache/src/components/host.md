The `Host` component is a provider component that allows you to connect to a [Binder](https://mybinder.org/) instance and access its context in all child components. You'll probably want to use this component when connecting your Jupyter front-end to remote compute provided by a Binder instance.

The `Host` component takes a `repo` component, which you can use to provide the location of a git-backed repository containing Jupyter notebooks that you would like to open in your Binder-backed instance. You can also provide the path to a particular notebook within a repository.

The `gitRef` prop allows you to determine which branch, tag, or commit you would to reference within the repository that you provide.

Finally, the `binderUrl` prop allows you to specify the URL of the Binder instance that you would like to use. It defaults to the public Binder instance at https://mybinder.org, but you can provide your own BinderHub deployment.

The configuration details for the Binder instance that you can connect to are persisted to LocalStorage. Take a look at the source below and see how we can use the `Host.Consumer` component to retrieve the information stored in LocalStorage.

```
<Host repo="nteract/examples" gitRef="master" binderURL="https://mybinder.org">
  <p>We've connected to a Binder instance within this context.</p>
  <p>
    But now we need to retrieve some information about the Binder context we are
    connected to.
  </p>
  <p>So let's use the "Host.Consumer" component!</p>
  <Host.Consumer>
    {host =>
      host ? (
        <pre>
          Endpoint: {host.endpoint}
          Token: {host.token}
        </pre>
      ) : null
    }
  </Host.Consumer>
</Host>
```

You can also see this information stored under the "@BinderKey@${props}` key in your browser's LocalStorage.

```jsx noeditor
<img
  alt="A screenshot of a browser's LocalStorage with Binder configuration data persisted"
  src="https://cldup.com/4KGoRjl7ZK.png"
  style={{ width: "100%" }}
/>
```