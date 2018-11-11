The `Kernel` component is a provider and consumer component set that allows you to connect to a kernel and use its context.

The `Kernel` component takes the same props (`repo`, `gitRef`, and `binderUrl`) as the [`Host`](#host) component. In fact, the `Kernel` component uses the `Host` component under the hood to connect to a remote Binder instance.

In addition to those props, the component also takes a `kernelName` prop that can be used provide the kernel you'd like to connect to. For example, `ir` for the R kernel or `python` for the Python kernel.

```
<Kernel repo="binder-examples/r" kernelName="ir">
  <Kernel.Consumer>
    {kernel =>
      kernel ? (
        <React.Fragment>
        <p>We have a kernel!</p>
        <p>Connected to {kernel.channels.source._config.url}.</p>
        </React.Fragment>
      ) : (
        <p>Allocating kernel...</p>
      )
    }
  </Kernel.Consumer>
</Kernel>
```
