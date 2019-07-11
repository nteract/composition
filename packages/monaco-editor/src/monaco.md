
The Monaco Editor component facilitates the use of the Monaco Editor within code cells. 
The Monaco Editor provides a more robust editing experience though rich intellisense and
validation. It is popularized by it's use in the popular code editor, Visual Studio Code. 

```js
   monaco.editor.create(document.getElementById("container"), {
	value: "function hello() {\n\talert('Hello world!');\n}",
	language: "javascript"
});
```

The monaco editor includes type colorization:
```javascript
    const MonacoEditor = require(".");
    console.log(MonacoEditor);
    console.log(MonacoEditor.default);
    <MonacoEditor.default
      theme="vscode"
      value="function hello() {\n\tlet x = 10;\n\tvar y = 'word';\n\talert('Hello world!');\n}"
      language="javascript"
    />
    
```