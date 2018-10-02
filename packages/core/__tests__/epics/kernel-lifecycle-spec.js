import { ActionsObservable } from "redux-observable";

import { actionTypes } from "@nteract/core";

import { createMessage } from "@nteract/messaging";

import { Subject, of } from "rxjs";

import {
  acquireKernelInfo,
  watchExecutionStateEpic
} from "../../src/epics/kernel-lifecycle";

import { toArray, share } from "rxjs/operators";

describe("acquireKernelInfo", () => {
  test("sends a kernel_info_request and processes kernel_info_reply", async function(done) {
    const sent = new Subject();
    const received = new Subject();

    const mockSocket = Subject.create(sent, received);

    sent.subscribe(msg => {
      expect(msg.header.msg_type).toEqual("kernel_info_request");

      const response = createMessage("kernel_info_reply");
      response.parent_header = msg.header;
      response.content = {
        status: "ok",
        protocol_version: "5.1",
        implementation: "ipython",
        implementation_version: "6.2.1",
        language_info: {
          name: "python",
          version: "3.6.5",
          mimetype: "text/x-python",
          codemirror_mode: { name: "ipython", version: 3 },
          pygments_lexer: "ipython3",
          nbconvert_exporter: "python",
          file_extension: ".py"
        },
        banner:
          "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
        help_links: [
          { text: "Python Reference", url: "https://docs.python.org/3.6" },
          {
            text: "IPython Reference",
            url: "https://ipython.org/documentation.html"
          },
          {
            text: "NumPy Reference",
            url: "https://docs.scipy.org/doc/numpy/reference/"
          },
          {
            text: "SciPy Reference",
            url: "https://docs.scipy.org/doc/scipy/reference/"
          },
          {
            text: "Matplotlib Reference",
            url: "https://matplotlib.org/contents.html"
          },
          {
            text: "SymPy Reference",
            url: "http://docs.sympy.org/latest/index.html"
          },
          {
            text: "pandas Reference",
            url: "https://pandas.pydata.org/pandas-docs/stable/"
          }
        ]
      };

      // TODO: Get the Rx handling proper here
      setTimeout(() => received.next(response), 100);
    });

    const obs = acquireKernelInfo(mockSocket);

    const actions = await obs.pipe(toArray()).toPromise();

    expect(actions).toEqual([
      {
        payload: {
          langInfo: {
            name: "python",
            version: "3.6.5",
            mimetype: "text/x-python",
            codemirror_mode: { name: "ipython", version: 3 },
            pygments_lexer: "ipython3",
            nbconvert_exporter: "python",
            file_extension: ".py"
          }
        },
        type: "SET_LANGUAGE_INFO"
      },
      {
        type: "CORE/SET_KERNEL_INFO",
        payload: {
          info: {
            protocolVersion: "5.1",
            implementation: "ipython",
            implementationVersion: "6.2.1",
            banner:
              "Python 3.6.5 (default, Mar 30 2018, 06:41:53) \nType 'copyright', 'credits' or 'license' for more information\nIPython 6.2.1 -- An enhanced Interactive Python. Type '?' for help.\n",
            helpLinks: [
              { text: "Python Reference", url: "https://docs.python.org/3.6" },
              {
                text: "IPython Reference",
                url: "https://ipython.org/documentation.html"
              },
              {
                text: "NumPy Reference",
                url: "https://docs.scipy.org/doc/numpy/reference/"
              },
              {
                text: "SciPy Reference",
                url: "https://docs.scipy.org/doc/scipy/reference/"
              },
              {
                text: "Matplotlib Reference",
                url: "https://matplotlib.org/contents.html"
              },
              {
                text: "SymPy Reference",
                url: "http://docs.sympy.org/latest/index.html"
              },
              {
                text: "pandas Reference",
                url: "https://pandas.pydata.org/pandas-docs/stable/"
              }
            ],
            languageName: "python",
            languageVersion: "3.6.5",
            mimetype: "text/x-python",
            fileExtension: ".py",
            pygmentsLexer: "ipython3",
            codemirrorMode: { name: "ipython", version: 3 },
            nbconvertExporter: "python"
          }
        }
      }
    ]);

    done();
  });
});

describe("watchExecutionStateEpic", () => {
  test("returns an Observable with an initial state of idle", done => {
    const action$ = ActionsObservable.of({
      type: actionTypes.LAUNCH_KERNEL_SUCCESSFUL,
      payload: {
        kernel: {
          channels: of({
            header: { msg_type: "status" },
            content: { execution_state: "idle" }
          })
        }
      }
    });
    const obs = watchExecutionStateEpic(action$);
    obs.pipe(toArray()).subscribe(
      // Every action that goes through should get stuck on an array
      actions => {
        const types = actions.map(({ type }) => type);
        expect(types).toEqual([actionTypes.SET_EXECUTION_STATE]);
      },
      err => done.fail(err), // It should not error in the stream
      () => done()
    );
  });
});
