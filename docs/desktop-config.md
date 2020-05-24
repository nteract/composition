# Configuring the nteract desktop app

The nteract desktop app can be configured using an JSON-based `nteract.json` file. The `nteract.json` file should be stored in the Jupyter config directory. To find the location of the Jupyter config directory on your system, run the `jupyter --paths` command.

```
$ jupyter --paths
    /Users/me/.jupyter
    /usr/local/etc/jupyter
    /etc/jupyter
```

Create the JSON file like so:

```
$ touch /Users/me/.jupyter/nteract.json
```

## Configurable options

The nteract desktop application supports the following configuration options.

| Config Option      | Example                                  | Description                                                                                   |
| ------------------ | ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| "theme"            | `"theme": "dark"`                        | Sets the default theme of the nteract desktop app, can be `light` or `dark`. Default is light |
| "autoSaveInterval" | `"autoSaveInterval": "1000"`             | How often to save the notebook document in milliseconds. Set to 0 to disable autoSave.        |
| "codeMirror"       | `"codeMirror": { "lineNumbers" : true }` | A set of options for configuring the CodeMirror editor in the nteract desktop app             |

## Example configurations

This is an example of an `nteract.json` file that sets the default theme to the `dark` theme and disables auto-save.

```
{
    "theme": "dark",
    "autoSaveInterval": 0
}
```

Here's another example of a configuration that customizes the CodeMirror editor in the nteract desktop app.

```
{
    "codeMirror": {
        "matchBrackets": true,
        "autoCloseBrackets": 4,
        "cursorBlinkRate" 500
    }

}
```
