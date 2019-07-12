
The [Monaco Editor](https://microsoft.github.io/monaco-editor/ "Monaco Editor Homepage") component facilitates the use of the Monaco Editor within code cells. 
The Monaco Editor provides a robust editing experience similar to that of VS Code. 

The Monaco Editor includes syntax highlighting:
```javascript
    const MonacoEditor = require(".");
    <MonacoEditor.default
      theme="vscode"
      value="function hello() {\n\tlet x = 10;\n\tlet y = 'world';\n\talert('Hello World');\n}"
      language="javascript"
    />
    
```
It also works across languages.

```javascript
    const MonacoEditor = require(".");
    <MonacoEditor.default
      theme="vscode"
      value={"print('This is python.')\nx = 2\ny = 3\nif x == 2:\n\tprint('3')\nelse:\n\tprint('2')"}
      language="python"
    />
    
```