# enchannel-zmq-backend

Channeling Jupyter over zmq

Given a currently running Jupyter runtime, creates RxJS subjects for three of the Jupyter channels: shell, control, and iopub.

```javascript
> var enchannelZMQ = require('enchannel-zmq-backend')
> var uuid = require('uuid')
> var kernel = require('./kernel.json')
> kernel
{ stdin_port: 58786,
  ip: '127.0.0.1',
  control_port: 58787,
  hb_port: 58788,
  signature_scheme: 'hmac-sha256',
  key: 'dddddddd-eeee-aaaa-dddd-dddddddddddd',
  shell_port: 58784,
  transport: 'tcp',
  iopub_port: 58785 }
> var enchan = enchannelZMQ(kernel)
> var payload =
... { header:
...    { msg_id: 'execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8',
.....      username: '',
.....      session: '00000000-0000-0000-0000-000000000000',
.....      msg_type: 'execute_request',
.....      version: '5.0' },
...   content:
...    { code: 'print("woo")',
.....      silent: false,
.....      store_history: true,
.....      user_expressions: {},
.....      allow_stdin: false } }
> enchan.shell.subscribe(console.log)
> enchan.shell.send(payload)
> Message {
  idents: [],
  header:
   { username: 'rgbkrk',
     msg_type: 'execute_reply',
     msg_id: '0f6d37f3-56a2-41fd-b3ed-90cc189ac423',
     version: '5.1',
     session: '40472e70-e008-48d1-9537-55837a905c05',
     date: '2016-01-12T00:39:44.686986' },
  parent_header:
   { username: '',
     session: '00000000-0000-0000-0000-000000000000',
     version: '5.0',
     msg_id: 'execute_9ed11a0f-707e-4f71-829c-a19b8ff8eed8',
     msg_type: 'execute_request' },
  metadata:
   { dependencies_met: true,
     engine: '34d73425-4f04-4b57-9bc7-b46e3100e1fd',
     status: 'ok',
     started: '2016-01-12T00:39:44.684534' },
  content:
   { status: 'ok',
     execution_count: 60,
     user_expressions: {},
     payload: [] },
  blobs: [],
  signatureOK: true }
```
