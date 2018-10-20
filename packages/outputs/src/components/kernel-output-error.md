The `<KernelOutputError />` component will render a Jupyter error with or without a traceback.

```jsx
<KernelOutputError ename="NameError" evalue="Yikes!" traceback={["Yikes, never heard of that one!"]} />
```

```jsx
<KernelOutputError ename="NameError" evalue="Yikes!" />
```