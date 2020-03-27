The Media.JavaScript component allows you to execute JavaScript in the context of the current document.

```jsx
<JavaScript
  data={`
console.log('%cWelcome to the nteract.io component docs!', "color: #3d3d3d; font-size: 24px;");
console.log("%cThe developer console is a lovely place, isn't it?", "color: #3d3d3d; font-size: 16px;");
console.log('Join us! https://github.com/nteract/nteract.');
window.el = element;
element.innerText = 'Check your devtools!'
`}
/>
```

Because of this, you can declare variables in the scope of the current window context. For example, view the source code for the component below.

```

<JavaScript data={`
window.this_is_our_special_variable = 10;
element.innerText = \`Our variable is ${this_is_our_special_variable}\`
`}/>
```

Then navigate to your browser's developer console and print out the value of the variable `this_is_our_special_variable` like so.

```plaintext
console.log(this_is_our_special_variable);
> 10
```

If you're familiar with the Jupyter ecosystem, note that this component executes JavaScript in a manner identical to Jupyter Notebook's JavaScript evaluation. The code you execute using this component will _not_ persist through reloads, so it's a good place to test and iterate on scripts.

The `Media.JavaScript` component can also help you when things go wrong by printing an error trace. For example, here's what happens when you attempt to log invoke an undefined function.

```
<JavaScript data={"there_is_no_way_this_function_exists_right_now(and_takes_this_parameter)"}/>
```

Under the hood, this component executes the JavaScript string passed to `data` using `eval`. As such, be sure that whatever `data` you are passing to the component is coming from a trusted source.
