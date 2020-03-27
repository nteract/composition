# An Overview of Outputs in nteract

## What are outputs?

When a user connects to a Jupyter kernel and executes code, the kernel responds back with a JSON payload that represents the output of the execution. There are four different types of outputs that a kernel can return.

- `stream`
- `error`
- `display_data`
- `execute_result`

Let's dive into each of these output types one-by-one.

### stream

`stream` outputs are returned when a programs executions outputs something to standard out or standard error. For example, printing out a string using Python's print function...

```python
print("This is a stream output")
```

...will return a `stream` output.

```json
{
  "header": {
    "msg_id": "70d5a868-32ab31c51f0a6f59ef7ae31b",
    "msg_type": "stream",
    "username": "jovyan",
    "session": "2c9cc318-a9de7a828cb72082a25e021e",
    "date": "2020-01-20T17:48:14.040265Z",
    "version": "5.3"
  },
  "msg_id": "70d5a868-32ab31c51f0a6f59ef7ae31b",
  "msg_type": "stream",
  "parent_header": {
    "msg_id": "e554b829ced3492cb5af2c3cca12359e",
    "username": "username",
    "session": "f99df3a00a7647b48a31e095bb186dfb",
    "msg_type": "execute_request",
    "version": "5.2",
    "date": "2020-01-20T17:48:14.035150Z"
  },
  "metadata": {},
  "content": { "name": "stdout", "text": "This is a stream output\n" },
  "buffers": [],
  "channel": "iopub"
}
```

Executing a command line method using the `!` operator...

```
!pwd
```

...will also return a stream output.

```json
{
  "header": {
    "msg_id": "8e818c63-851893589050b90014b5f89a",
    "msg_type": "stream",
    "username": "jovyan",
    "session": "2c9cc318-a9de7a828cb72082a25e021e",
    "date": "2020-01-20T17:49:35.315712Z",
    "version": "5.3"
  },
  "msg_id": "8e818c63-851893589050b90014b5f89a",
  "msg_type": "stream",
  "parent_header": {
    "msg_id": "62d2674f18ed411d8e280f64171a7000",
    "username": "username",
    "session": "f99df3a00a7647b48a31e095bb186dfb",
    "msg_type": "execute_request",
    "version": "5.2",
    "date": "2020-01-20T17:49:34.721649Z"
  },
  "metadata": {},
  "content": { "name": "stdout", "text": "/home/jovyan\r\n" },
  "buffers": [],
  "channel": "iopub"
}
```

### error

`error` outputs are returned whenever the executed code raised a runtime exception. This will often happen if there is a syntax error or a referenced to an undefined variable in the code. For example, executing the following code...

```python
print("I want to print an undefined variable: ", never_defined)
```

...will return the following JSON response from the kernel.

```json
{
  "header": {
    "msg_id": "f6b6909d-9695100a8b8bec8920a314a1",
    "msg_type": "error",
    "username": "jovyan",
    "session": "2c9cc318-a9de7a828cb72082a25e021e",
    "date": "2020-01-20T17:54:18.907444Z",
    "version": "5.3"
  },
  "msg_id": "f6b6909d-9695100a8b8bec8920a314a1",
  "msg_type": "error",
  "parent_header": {
    "msg_id": "9dfcbd997057474ca7ba743847783b22",
    "username": "username",
    "session": "f99df3a00a7647b48a31e095bb186dfb",
    "msg_type": "execute_request",
    "version": "5.2",
    "date": "2020-01-20T17:54:18.830166Z"
  },
  "metadata": {},
  "content": {
    "traceback": [
      "\u001b[0;31m---------------------------------------------------------------------------\u001b[0m",
      "\u001b[0;31mNameError\u001b[0m                                 Traceback (most recent call last)",
      "\u001b[0;32m<ipython-input-3-84e3ac9791e4>\u001b[0m in \u001b[0;36m<module>\u001b[0;34m\u001b[0m\n\u001b[0;32m----> 1\u001b[0;31m \u001b[0mprint\u001b[0m\u001b[0;34m(\u001b[0m\u001b[0;34m\"I want to print an undefined variable: \"\u001b[0m\u001b[0;34m,\u001b[0m \u001b[0mnever_defined\u001b[0m\u001b[0;34m)\u001b[0m\u001b[0;34m\u001b[0m\u001b[0;34m\u001b[0m\u001b[0m\n\u001b[0m",
      "\u001b[0;31mNameError\u001b[0m: name 'never_defined' is not defined"
    ],
    "ename": "NameError",
    "evalue": "name 'never_defined' is not defined"
  },
  "buffers": [],
  "channel": "iopub"
}
```

Note that the content of the error response is an ANSI-encoded string. nteract uses the [ansi-to-react](https://github.com/nteract/ansi-to-react) package to render this string in the user interface.

### display_data

`display_data` outputs are returned when the code executed returns a [Jupyter display object](https://ipython.readthedocs.io/en/stable/api/generated/IPython.display.html). Often, these outputs are images, data visualizations, HTML objects, and other rich media types that users can return from their outputs. For example, the following code snippet...

```python
from IPython import display
from IPython.display import Image
display(Image(url='https://avatars2.githubusercontent.com/u/12401040?v=3&s=200'))
```

...will return the following JSON response.

```json
{
  "header": {
    "msg_id": "b61e1899-8a11af128f44b592010e7aee",
    "msg_type": "display_data",
    "username": "jovyan",
    "session": "160b4da4-52b4a799778387233561e04b",
    "date": "2020-01-20T18:02:34.060820Z",
    "version": "5.3"
  },
  "msg_id": "b61e1899-8a11af128f44b592010e7aee",
  "msg_type": "display_data",
  "parent_header": {
    "msg_id": "13ed849a58f34c27992560425fec8ab4",
    "username": "username",
    "session": "56c4c34a426b4db5845995ade394d6c8",
    "msg_type": "execute_request",
    "version": "5.2",
    "date": "2020-01-20T18:02:34.054765Z"
  },
  "metadata": {},
  "content": {
    "data": {
      "text/html": "<img src=\"https://avatars2.githubusercontent.com/u/12401040?v=3&s=200\"/>",
      "text/plain": "<IPython.core.display.Image object>"
    },
    "metadata": {},
    "transient": {}
  },
  "buffers": [],
  "channel": "iopub"
}
```

Let's take a closer look at the content of this response.

```json
{
  "content": {
    "data": {
      "text/html": "<img src=\"https://avatars2.githubusercontent.com/u/12401040?v=3&s=200\"/>",
      "text/plain": "<IPython.core.display.Image object>"
    },
    "metadata": {},
    "transient": {}
  }
}
```

The `data` property consists of a JSON payload that contains two values. Both values are keyed by their media type: `text/html` and `text/plain`. Generally, `display_data` response will have multiple representations for the same output. Here, we have a representation that renders HTML and a representation that renders a plain-text string. In nteract, the outputs package will attempt to render the richest of the two media types in the UI. In this case, that would be the HTML representation. For more information on this, check out the transforms section of the documentation.

### execute_result

`execute_result` responses are identical to `display_data` response with the notable exception that they contain the execution count of the response. The execution count is a monotonically increasing count of the number of executions run against the kernel. `execute_result` and `display_data` responses are rendered in an identical way in the user interface.
